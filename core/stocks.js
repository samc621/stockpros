const fs = require("fs");
const request = require("request");
const csv = require("csvtojson");
const moment = require("moment-business-days");
const _ = require("lodash");
const schedule = require("node-schedule");
const { average, high, low, cagr } = require("../helpers/math");
const { calculateHolidays } = require("../helpers/holidays");

const polygon = require("../services/polygon-io");

const Ticker = require("../models/tickers");
const TickerTechnical = require("../models/tickerTechnicals");

moment.updateLocale("us", {
  holidays: Object.values(calculateHolidays(new Date().getFullYear())),
  holidayFormat: "MM-DD-YYYY"
});

exports.getTrades = symbol => {
  polygon.sendWebhookMessage({ action: "subscribe", params: `T.${symbol}` });
};

exports.scheduleDailyStockUpdate = symbol => {
  schedule.scheduleJob("0 16 * * 1-5", this.dailyStockUpdate(symbol));
};

exports.loadStocks = async () => {
  let counter = 0;
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
          this.dailyStockUpdate(json.Symbol);
          this.scheduleDailyStockUpdate(json.Symbol);
          if (counter % 40 == 0) {
            this.getTrades(json.Symbol);
          }
        }
        counter++;
      } catch (err) {
        // console.log(err.message);
      }
    });
};

exports.newTrade = symbol => {
  const strategies = fs.readdirSync(__dirname + "/../strategies");
  strategies.map(strategy => {
    require(__dirname + `/../strategies/${strategy}`).onNewTrade(symbol);
  });
};

exports.dailyStockUpdate = async symbol => {
  try {
    const today = moment().format("YYYY-MM-DD");
    let todaysValues = await polygon.getSnapshot(symbol);
    todaysValues = todaysValues.ticker.day;

    const dateMinus50Days = moment().businessSubtract(50).format("YYYY-MM-DD");
    const dateMinus200Days = moment()
      .businessSubtract(200)
      .format("YYYY-MM-DD");
    const dateMinus52Weeks = moment()
      .subtract(52, "weeks")
      .format("YYYY-MM-DD");
    const dateMinus3Years = moment().subtract(3, "years").format("YYYY-MM-DD");

    let aggregates50Days = await polygon.getAggregates(
      symbol,
      1,
      "day",
      dateMinus50Days,
      today
    );
    aggregates50Days.results.shift();
    aggregates50Days.results.push(todaysValues);

    let aggregates200Days = await polygon.getAggregates(
      symbol,
      1,
      "day",
      dateMinus200Days,
      today
    );
    aggregates200Days.results.shift();
    aggregates200Days.results.push(todaysValues);

    let aggregates52Weeks = await polygon.getAggregates(
      symbol,
      1,
      "day",
      dateMinus52Weeks,
      today
    );
    aggregates52Weeks.results.shift();
    aggregates52Weeks.results.push(todaysValues);

    let aggregates3Years = await polygon.getAggregates(
      symbol,
      365,
      "day",
      dateMinus3Years,
      today
    );
    aggregates3Years.results.shift();
    aggregates3Years.results.push(todaysValues);

    const sma_50_day = average(
      aggregates50Days.results.map(a => a.c),
      aggregates50Days.results.length
    );
    const sma_200_day = average(
      aggregates200Days.results.map(a => a.c),
      aggregates200Days.results.length
    );
    const high_52_week = high(aggregates52Weeks.results.map(a => a.h));
    const low_52_week = low(aggregates52Weeks.results.map(a => a.l));
    const cagr_3_year =
      aggregates3Years.results.length === 3
        ? cagr(
            aggregates3Years.results[0].o,
            aggregates3Years.results[aggregates3Years.results.length - 1].c,
            aggregates3Years.results.length
          )
        : null;

    const data = {
      sma_50_day,
      sma_200_day,
      high_52_week,
      low_52_week,
      cagr_3_year
    };

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
  } catch (err) {
    // console.log(err.message);
  }
};
