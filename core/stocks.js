const redis = require("../services/redis");
const request = require("request");
const csv = require("csvtojson");
const moment = require("moment-business-days");
const _ = require("lodash");
const schedule = require("node-schedule");
const {
  average,
  high,
  low,
  cagr,
  percentageDifference
} = require("../helpers/math");
const { calculateHolidays } = require("../helpers/holidays");

const Strategy = require("./strategies");

const polygon = require("../services/polygon-io");
const alpaca = require("../services/alpaca");

const Ticker = require("../models/tickers");
const TickerTechnical = require("../models/tickerTechnicals");
const OHLCData = require("../models/ohlcData");
const Position = require("../models/positions");

const getTrades = symbol => {
  polygon.sendWebhookMessage({ action: "subscribe", params: `T.${symbol}` });
};

const dailyStockUpdate = async symbol => {
  try {
    const date = new Date();
    const data = await stockCalcs(date, symbol);
    delete data.date;
    let query = {};
    query["tickers.symbol"] = symbol;
    const tickerTechnical = await new TickerTechnical().findOne(query);
    if (tickerTechnical) {
      await new TickerTechnical(tickerTechnical.id).update(data);
    } else {
      const ticker = await new Ticker().findOne({ symbol });
      if (ticker) {
        await new TickerTechnical().create({
          ticker_id: ticker.id,
          ...data
        });
      }
    }

    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");
    const yesterdayMinus15Years = moment(yesterday)
      .subtract(15, "years")
      .format("YYYY-MM-DD");
    const yesterdaysOHLC = await polygon.getDailyPrices(symbol, yesterday);
    await new OHLCData().create({
      symbol,
      timestamp: yesterday,
      open: yesterdaysOHLC.open,
      high: yesterdaysOHLC.high,
      low: yesterdaysOHLC.low,
      close: yesterdaysOHLC.close
    });

    const oldOHLCs = await new OHLCData().find(
      { symbol },
      null,
      yesterdayMinus15Years
    );
    oldOHLCs.map(async ohlc => {
      await new OHLCData(ohlc.id).hardDelete();
    });
  } catch (err) {
    console.error(err);
  }
};

const scheduleDailyStockUpdate = symbol => {
  schedule.scheduleJob("0 16 * * 1-5", dailyStockUpdate(symbol));
};

exports.loadStocks = async () => {
  const watchlist = [
    "AAPL",
    "GOOG",
    "FB",
    "AMZN",
    "MSFT",
    "ADBE",
    "INTC",
    "NVDA"
  ];

  try {
    await loadSP500();
    watchlist.map(async symbol => {
      if (await new Ticker().checkIfTickerExists(symbol)) {
        if (!(await new OHLCData().checkIfOHLCLoaded(symbol))) {
          await loadOHLC(symbol);
        }
        if (await new OHLCData().checkIfOHLCLoaded(symbol)) {
          scheduleDailyStockUpdate(symbol);
          getTrades(symbol);
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const loadSP500 = async () => {
  try {
    const jsons = await csv().fromStream(
      request.get(
        "https://s3.amazonaws.com/rawstore.datahub.io/652de3c89c39dafdee912fd9cfb23c21.csv"
      )
    );

    return await Promise.all(
      jsons.map(async json => {
        try {
          if (!(await new Ticker().checkIfTickerExists(json.Symbol))) {
            const tickerDetails = await polygon.getTickerDetails(json.Symbol);
            if (tickerDetails) {
              let data = _.pick(tickerDetails, [
                "name",
                "symbol",
                "logo",
                "country",
                "exchange",
                "industry",
                "sector",
                "marketcap"
              ]);
              data["market_cap"] = data["marketcap"];
              delete data["marketcap"];
              return await new Ticker().create(data);
            }
          }
        } catch (err) {
          return;
        }
      })
    );
  } catch (err) {
    throw new Error(err.message);
  }
};

const getStrategy1Data = async (price, stockCalcs, position, account) => {
  const targetReturn = 0.2,
    maxExposure = 0.7,
    maxRisk = 0.01;

  const sellSignals = [];
  if (position) {
    sellSignals.push(
      percentageDifference(position.avg_entry_price, price) >= targetReturn * 2
    );
    sellSignals.push(
      percentageDifference(price, position.avg_entry_price) >= maxRisk
    );
  }
  let sellQuantity = null;
  if (sellSignals.some(signal => signal === true)) {
    sellQuantity = Number(position.qty);
  }

  const buySignals = [];
  buySignals.push(
    percentageDifference(price, stockCalcs.sma_50_day) >= targetReturn
  );
  buySignals.push(
    price >= stockCalcs.sma_50_day &&
      percentageDifference(price, stockCalcs.high_52_week) >= targetReturn
  );
  let buyQuantity = null;
  if (buySignals.some(signal => signal === true)) {
    const acct = account || (await alpaca.getAccount());
    buyQuantity = Math.floor((acct.buying_power * maxExposure) / price);
  }

  return {
    buySignals,
    sellSignals,
    buyQuantity,
    sellQuantity
  };
};

exports.newTrade = async symbol => {
  redis.get(symbol, async (err, price) => {
    try {
      if (!price) {
        return;
      }

      const tickerTechnical = await new TickerTechnical().findOne({ symbol });

      let position = null;
      if (await new Position().checkIfPositionExists(symbol)) {
        position = await alpaca.getPositionForSymbol(symbol);
      }
      const {
        buySignals,
        sellSignals,
        buyQuantity,
        sellQuantity
      } = await getStrategy1Data(price, tickerTechnical, position);

      await new Strategy(
        buySignals,
        sellSignals,
        buyQuantity,
        sellQuantity
      ).executeStrategy(symbol, price, false);
    } catch (err) {
      console.error(err);
    }
  });
};

const stockCalcs = async (dt, symbol) => {
  try {
    moment.updateLocale("us", {
      holidays: Object.values(calculateHolidays(new Date(dt).getFullYear())),
      holidayFormat: "MM-DD-YYYY"
    });

    const date = moment(dt).format("YYYY-MM-DD");

    const dateMinus50Days = moment(date)
      .businessSubtract(50)
      .format("YYYY-MM-DD");
    const dateMinus200Days = moment(date)
      .businessSubtract(200)
      .format("YYYY-MM-DD");
    const dateMinus52Weeks = moment(date)
      .subtract(52, "weeks")
      .format("YYYY-MM-DD");
    const dateMinus3Years = moment(date)
      .subtract(3, "years")
      .format("YYYY-MM-DD");

    const aggregates50Days = await new OHLCData().find(
      { symbol },
      dateMinus50Days,
      date
    );
    const aggregates200Days = await new OHLCData().find(
      { symbol },
      dateMinus200Days,
      date
    );
    const aggregates52Weeks = await new OHLCData().find(
      { symbol },
      dateMinus52Weeks,
      date
    );
    const aggregates3Years = await new OHLCData().find(
      { symbol },
      dateMinus3Years,
      date
    );

    const sma_50_day = average(
      aggregates50Days.map(a => a.close),
      aggregates50Days.length
    );
    const sma_200_day = average(
      aggregates200Days.map(a => a.close),
      aggregates200Days.length
    );
    const high_52_week = high(aggregates52Weeks.map(a => a.high));
    const low_52_week = low(aggregates52Weeks.map(a => a.low));
    const cagr_3_year = cagr(
      aggregates3Years[0].open,
      aggregates3Years[aggregates3Years.length - 1].close,
      3
    );

    const data = {
      date,
      sma_50_day,
      sma_200_day,
      high_52_week,
      low_52_week,
      cagr_3_year
    };

    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};

const loadOHLC = async symbol => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const todayMinus15Years = moment(today)
      .subtract(15, "years")
      .format("YYYY-MM-DD");

    const aggregates = await polygon.getAggregates(
      symbol,
      1,
      "day",
      todayMinus15Years,
      today
    );

    await aggregates.results.map(async agg => {
      await new OHLCData().create({
        symbol,
        timestamp: moment(agg.t).format("YYYY-MM-DD"),
        open: agg.o,
        high: agg.h,
        low: agg.l,
        close: agg.c
      });
    });
  } catch (err) {
    console.error(err);
  }
};

const backtest = async (symbol, years, startValue) => {
  try {
    const to = moment().format("YYYY-MM-DD");
    const from = moment(to).subtract(years, "years").format("YYYY-MM-DD");
    const aggregates = await new OHLCData().find({ symbol }, from, to);

    const result = await aggregates.reduce(
      async (status, agg) => {
        const calcs = await stockCalcs(
          moment(agg.timestamp).format("YYYY-MM-DD"),
          symbol
        );

        status = await status;

        const {
          buySignals,
          sellSignals,
          buyQuantity,
          sellQuantity
        } = await getStrategy1Data(
          agg.close,
          calcs,
          status.position,
          status.account
        );

        const trade = await new Strategy(
          buySignals,
          sellSignals,
          buyQuantity,
          sellQuantity
        ).executeStrategy(symbol, agg.close, true, calcs.date);
        if (trade) {
          let oldQty = status.position ? status.position.qty : 0;
          const newQty = (oldQty += trade.quantity);
          status.position =
            newQty > 0
              ? {
                  avg_entry_price: trade.price,
                  qty: newQty
                }
              : null;
          status.account.buying_power -= trade.value;
          status.trades.push(trade);
        }

        return status;
      },
      {
        position: null,
        account: {
          buying_power: startValue
        },
        trades: []
      }
    );

    const trades = result.trades.map((trade, i) => {
      if (trade.value < 0) {
        trade.profit = result.trades[i - 1].value * -1 - trade.value;
      }

      return trade;
    });

    const endValue =
      (result.position ? result.position.qty : 0) *
        aggregates[aggregates.length - 1].close +
      result.account.buying_power;

    return {
      trades,
      startValue,
      endValue,
      returnDollars: endValue - startValue,
      returnPercentage: percentageDifference(startValue, endValue)
    };
  } catch (err) {
    console.error(err);
  }
};
