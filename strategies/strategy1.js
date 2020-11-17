const alpaca = require("../services/alpaca");
const { percentageDifference } = require("../helpers/math");

const Position = require("../models/positions");
const TickerTechnical = require("../models/tickerTechnicals");

const targetAnnualReturn = 0.2;

exports.executeStategy = async (
  symbol,
  price,
  backtest,
  stockCalcs,
  position,
  account
) => {
  try {
    const tickerTechnical = stockCalcs
      ? stockCalcs
      : await new TickerTechnical().findOne({ symbol });
    if (!tickerTechnical) {
      return;
    }

    if (position || (await new Position().checkIfPositionExists(symbol))) {
      const pst = position
        ? position
        : await alpaca.getPositionForSymbol(symbol);
      if (
        percentageDifference(tickerTechnical.sma_50_day, price) >=
          targetAnnualReturn / 2 ||
        price >= tickerTechnical.high_52_week ||
        percentageDifference(price, pst.avg_entry_price) >=
          targetAnnualReturn / 2
      ) {
        const quantity = Number(pst.qty);
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("sell ==> ", symbol, quantity);
          await alpaca.createOrder(symbol, quantity, "sell");
        } else {
          return {
            quantity: quantity * -1,
            price,
            value: quantity * -1 * price
          };
        }
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
        const acct = account ? account : await alpaca.getAccount();
        const quantity = Math.floor(
          (acct.buying_power * (targetAnnualReturn / 2)) / price
        );
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("buy ==> ", symbol, quantity);
          await alpaca.createOrder(symbol, quantity, "buy");
        } else {
          return { quantity, price, value: quantity * price };
        }
      }
    }

    return null;
  } catch (err) {
    console.error(err.message);
  }
};
