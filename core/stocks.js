const redis = require("../services/redis");
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

const StrategyInstance = require("./strategies");

const polygon = require("../services/polygon-io");
const alpaca = require("../services/alpaca");

const Ticker = require("../models/tickers");
const TickerTechnical = require("../models/tickerTechnicals");
const OHLCData = require("../models/ohlcData");
const Position = require("../models/positions");
const Strategy = require("../models/strategies");
const WatchedSymbols = require("../models/watchedSymbols");

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

    const yesterday = moment().businessSubtract(1, "day").format("YYYY-MM-DD");
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
  let watchlist = await new WatchedSymbols().find({ is_active: true });
  watchlist = watchlist.map(ws => ws.symbol);

  try {
    watchlist.map(async symbol => {
      if (!(await new Ticker().checkIfTickerExists(symbol))) {
        await loadTicker(symbol);
      }
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

const loadTicker = async symbol => {
  try {
    const tickerDetails = await polygon.getTickerDetails(symbol);
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
  } catch (err) {
    throw new Error(err.message);
  }
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

      const avg_entry_price = position.avg_entry_price;
      const {
        sma_50_day,
        sma_200_day,
        high_52_week,
        low_52_week,
        cagr_3_year
      } = tickerTechnical;

      let data = {};
      data["strategies.is_active"] = true;
      data["strategy_signals.is_active"] = true;
      const strategies = await new Strategy().find(data);
      strategies.map(async strategy => {
        let buySignals = strategy.signals.filter(
          signal => signal.type === "buy"
        );
        buySignals = !position
          ? buySignals.reduce((string, signal) => {
              return (string +=
                eval(
                  percentageDifference(
                    eval(signal.operand_1),
                    eval(signal.operand_2)
                  ) +
                    signal.operator +
                    signal.percentage_difference
                ) +
                (signal.next_signal_inclusive === null
                  ? ""
                  : signal.next_signal_inclusive
                  ? "&&"
                  : "||"));
            }, "")
          : null;

        let account;
        if (eval(buySignals)) {
          account = await alpaca.getAccount();
        }

        let sellSignals = strategy.signals.filter(
          signal => signal.type === "sell"
        );
        sellSignals = position
          ? sellSignals.reduce((string, signal) => {
              return (string +=
                eval(
                  percentageDifference(
                    eval(signal.operand_1),
                    eval(signal.operand_2)
                  ) +
                    signal.operator +
                    signal.percentage_difference
                ) +
                (signal.next_signal_inclusive === null
                  ? ""
                  : signal.next_signal_inclusive
                  ? "&&"
                  : "||"));
            }, "")
          : null;

        const buyQuantity = account
          ? (account[strategy.buy_percentage_type_of] *
              strategy.buy_percentage) /
            price
          : null;

        const sellQuantity = position
          ? (position[strategy.sell_percentage_type_of] *
              strategy.sell_percentage) /
            (strategy.sell_percentage_type_of === "cost_basis" ? price : 1)
          : null;

        await new StrategyInstance(
          eval(buySignals),
          eval(sellSignals),
          buyQuantity,
          sellQuantity
        ).executeStrategy(symbol, price, false);
      });
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
      aggregates50Days.map(agg => agg.close),
      aggregates50Days.length
    );
    const sma_200_day = average(
      aggregates200Days.map(agg => agg.close),
      aggregates200Days.length
    );
    const high_52_week = high(aggregates52Weeks.map(agg => agg.high));
    const low_52_week = low(aggregates52Weeks.map(agg => agg.low));
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

exports.backtest = async (strategyId, symbol, years, startValue) => {
  try {
    const to = moment().format("YYYY-MM-DD");
    const from = moment(to).subtract(years, "years").format("YYYY-MM-DD");
    const aggregates = await new OHLCData().find({ symbol }, from, to);

    let data = {};
    data["strategies.id"] = strategyId;
    data["strategy_signals.is_active"] = true;
    const strategy = await new Strategy().findOne(data);

    let buySignals = strategy.signals.filter(signal => signal.type === "buy");
    let sellSignals = strategy.signals.filter(signal => signal.type === "sell");

    const result = await aggregates.reduce(
      async (status, agg) => {
        const calcs = await stockCalcs(
          moment(agg.timestamp).format("YYYY-MM-DD"),
          symbol
        );

        status = await status;

        const price = agg.close;
        const avg_entry_price = status.position
          ? status.position.avg_entry_price
          : null;
        const {
          sma_50_day,
          sma_200_day,
          high_52_week,
          low_52_week,
          cagr_3_year
        } = calcs;

        const evaluatedBuySignals = !status.position
          ? buySignals.reduce((string, signal) => {
              return (string +=
                eval(
                  percentageDifference(
                    eval(signal.operand_1),
                    eval(signal.operand_2)
                  ) +
                    signal.operator +
                    signal.percentage_difference
                ) +
                (signal.next_signal_inclusive === null
                  ? ""
                  : signal.next_signal_inclusive
                  ? "&&"
                  : "||"));
            }, "")
          : null;

        const evaluatedSellSignals = status.position
          ? sellSignals.reduce((string, signal) => {
              return (string +=
                eval(
                  percentageDifference(
                    eval(signal.operand_1),
                    eval(signal.operand_2)
                  ) +
                    signal.operator +
                    signal.percentage_difference
                ) +
                (signal.next_signal_inclusive === null
                  ? ""
                  : signal.next_signal_inclusive
                  ? "&&"
                  : "||"));
            }, "")
          : false;

        const buyQuantity =
          (status.account[strategy.buy_percentage_type_of] *
            strategy.buy_percentage) /
          price;

        const sellQuantity = status.position
          ? (status.position[strategy.sell_percentage_type_of] *
              strategy.sell_percentage) /
            (strategy.sell_percentage_type_of === "cost_basis" ? price : 1)
          : null;

        const trade = await new StrategyInstance(
          eval(evaluatedBuySignals),
          eval(evaluatedSellSignals),
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
                  qty: newQty,
                  cost_basis: trade.value
                }
              : null;
          status.account.buying_power -= trade.value;
          status.account.equity -= trade.value;
          status.trades.push(trade);
        }

        return status;
      },
      {
        position: null,
        account: {
          buying_power: startValue,
          equity: startValue
        },
        trades: []
      }
    );

    const trades = result.trades.map((trade, i) => {
      if (trade.value < 0) {
        trade.profit =
          (trade.price - result.trades[i - 1].price) * trade.quantity * -1;
      }

      return trade;
    });
    const profitableTrades = trades.filter(trade => trade.profit).length;
    const winningTrades = trades.filter(trade => trade.profit > 0).length;
    const losingTrades = profitableTrades - winningTrades;
    const winRate = winningTrades / profitableTrades;

    const endValue =
      (result.position ? result.position.qty : 0) *
        aggregates[aggregates.length - 1].close +
      result.account.buying_power;

    return {
      trades,
      startValue,
      endValue,
      returnDollars: endValue - startValue,
      returnPercentage: percentageDifference(startValue, endValue),
      winningTrades,
      losingTrades,
      winRate
    };
  } catch (err) {
    console.error(err);
  }
};
