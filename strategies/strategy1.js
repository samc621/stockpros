const redis = require("../services/redis");
const alpaca = require("../services/alpaca");
const { percentageDifference } = require("../helpers/math");

const Position = require("../models/positions");
const TickerTechnical = require("../models/tickerTechnicals");

const targetAnnualReturn = 0.2;

exports.onNewTrade = async symbol => {
  redis.get(symbol, async (err, price) => {
    try {
      if (!price || !(await alpaca.isMarketOpen())) {
        return;
      }

      const tickerTechnical = await new TickerTechnical().findOne({ symbol });
      if (!tickerTechnical) {
        return;
      }

      if (await new Position().checkIfPositionExists(symbol)) {
        const position = await alpaca.getPositionForSymbol(symbol);
        if (
          percentageDifference(tickerTechnical.sma_50_day, price) >=
            targetAnnualReturn / 2 ||
          price >= tickerTechnical.high_52_week ||
          percentageDifference(price, position.avg_entry_price) >=
            targetAnnualReturn / 2
        ) {
          const quantity = Number(position.qty);
          console.log("sell ==> ", symbol, quantity);
          await alpaca.createOrder(symbol, quantity, "sell");
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
          const quantity = Math.floor(
            (account.buying_power * (targetAnnualReturn / 2)) / price
          );
          console.log("buy ==> ", symbol, quantity);
          await alpaca.createOrder(symbol, quantity, "buy");
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  });
};
