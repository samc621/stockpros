const redis = require("../services/redis");
const alpaca = require("../services/alpaca");

const Position = require("../models/positions");
const TickerTechnical = require("../models/tickerTechnicals");

const targetAnnualReturn = 0.2;

const percentageDifference = (a, b) => {
  return (b - a) / a;
};

exports.onNewTrade = async symbol => {
  redis.get(symbol, async (err, price) => {
    const tickerTechnical = await new TickerTechnical().findOne({ symbol });

    if (await new Position().checkIfPositionExists(symbol)) {
      const position = await alpaca.getPositionForSymbol(symbol);
      if (
        percentageDifference(tickerTechnical.sma_50_day, price) >=
          targetAnnualReturn / 2 ||
        price >= tickerTechnical.high_52_week ||
        percentageDifference(price, position.avg_entry_price) >=
          targetAnnualReturn / 2
      ) {
        alpaca.createOrder(symbol, position.qty, "sell");
      }
    } else {
      if (
        (price < tickerTechnical.sma_50_day &&
          percentageDifference(price, tickerTechnical.sma_50_day) >=
            targetAnnualReturn / 2) ||
        (price >= tickerTechnical.sma_50_day &&
          percentageDifference(price, tickerTechnical.high_52_week) >=
            targetAnnualReturn)
      ) {
        const account = await alpaca.getAccount();
        alpaca.createOrder(
          symbol,
          account.buying_power * (targetAnnualReturn / 2),
          "buy"
        );
      }
    }
  });
};
