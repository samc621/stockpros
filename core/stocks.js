const redis = require("../services/redis");
const fs = require("fs");
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

const polygon = require("../services/polygon-io");
const alpaca = require("../services/alpaca");

const Ticker = require("../models/tickers");
const TickerTechnical = require("../models/tickerTechnicals");
const OHLCData = require("../models/ohlcData");
const account = require("@alpacahq/alpaca-trade-api/lib/resources/account");

const getTrades = symbol => {
  polygon.sendWebhookMessage({ action: "subscribe", params: `T.${symbol}` });
};

const dailyStockUpdate = async symbol => {
  try {
    const date = new Date();
    const data = await stockCalcs(date, symbol);
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
    const yesterdayMinus5Years = moment(yesterday)
      .subtract(5, "years")
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
      yesterdayMinus5Years
    );
    oldOHLCs.map(async ohlc => {
      await new OHLCData(ohlc.id).hardDelete();
    });
  } catch (err) {
    console.error(err.message);
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
    "NFLX",
    "AMZN",
    "MSFT",
    "ADBE",
    "INTC",
    "IBM",
    "NVDA"
  ];

  csv()
    .fromStream(
      request.get(
        "https://s3.amazonaws.com/rawstore.datahub.io/652de3c89c39dafdee912fd9cfb23c21.csv"
      )
    )
    .subscribe(async json => {
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
            await new Ticker().create(data);
          }
        }
        if (await new Ticker().checkIfTickerExists(json.Symbol)) {
          if (watchlist.includes(json.Symbol)) {
            if (!(await new OHLCData().checkIfOHLCLoaded(json.Symbol))) {
              await loadOHLC(json.Symbol);
            }
            if (await new OHLCData().checkIfOHLCLoaded(json.Symbol)) {
              scheduleDailyStockUpdate(json.Symbol);
              getTrades(json.Symbol);
            }
          }
        }
      } catch (err) {
        console.error(err.message);
      }
    });
};

exports.newTrade = async symbol => {
  redis.get(symbol, async (err, price) => {
    try {
      if (!price || !(await alpaca.isMarketOpen())) {
        return;
      }

      const strategies = fs.readdirSync(__dirname + "/../strategies");
      strategies.map(async strategy => {
        await require(__dirname + `/../strategies/${strategy}`).executeStategy(
          symbol,
          price
        );
      });
    } catch (err) {
      console.error(err.message);
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

    let aggregates50Days = await new OHLCData().find(
      { symbol },
      dateMinus50Days,
      date
    );
    let aggregates200Days = await new OHLCData().find(
      { symbol },
      dateMinus200Days,
      date
    );
    let aggregates52Weeks = await new OHLCData().find(
      { symbol },
      dateMinus52Weeks,
      date
    );
    let aggregates3Years = await new OHLCData().find(
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
    const todayMinus5Years = moment(today)
      .subtract(5, "years")
      .format("YYYY-MM-DD");

    const aggregates = await polygon.getAggregates(
      symbol,
      1,
      "day",
      todayMinus5Years,
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
    console.error(err.message);
  }
};

const backtest = async (symbol, years, startValue, strategyName) => {
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

        const trade = await require(__dirname +
          `/../strategies/${strategyName}`).executeStategy(
          symbol,
          agg.close,
          true,
          calcs,
          status.position,
          status.account
        );
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

    const endValue =
      result.position.qty * aggregates[aggregates.length - 1].close +
      result.account.buying_power;

    console.log({
      startValue,
      endValue,
      returnDollars: endValue - startValue,
      returnPercentage: percentageDifference(startValue, endValue)
    });
  } catch (err) {
    console.error(err.message);
  }
};
