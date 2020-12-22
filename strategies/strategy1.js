const alpaca = require("../services/alpaca");
const { percentageDifference } = require("../helpers/math");

const targetReturn = 0.2;
const maxExposure = 0.7;
const maxRisk = 0.01;

exports.executeStategy = async (
  symbol,
  price,
  backtest,
  stockCalcs,
  position,
  account
) => {
  try {
    if (!stockCalcs) {
      return;
    }

    if (position) {
      const signalOne =
        percentageDifference(position.avg_entry_price, price) >=
        targetReturn * 2;
      const signalTwo =
        percentageDifference(price, position.avg_entry_price) >= maxRisk;

      if (signalOne || signalTwo) {
        const quantity = Number(position.qty);
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("sell ==> ", symbol, quantity);
          await alpaca.createOrder(symbol, quantity, "sell");
        } else {
          return {
            date: stockCalcs.date,
            signal: signalOne
              ? `price is ${percentageDifference(
                  position.avg_entry_price,
                  price
                )} above average entry price`
              : `price is ${percentageDifference(
                  price,
                  position.avg_entry_price
                )} below average entry price`,
            quantity: quantity * -1,
            price,
            value: quantity * -1 * price
          };
        }
      }
    } else {
      const signalOne =
        percentageDifference(price, stockCalcs.sma_50_day) >= targetReturn;
      const signalTwo =
        price >= stockCalcs.sma_50_day &&
        percentageDifference(price, stockCalcs.high_52_week) >= targetReturn;

      if (signalOne || signalTwo) {
        const quantity = Math.floor(
          (account.buying_power * maxExposure) / price
        );
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("buy ==> ", symbol, quantity);
          await alpaca.createOrder(symbol, quantity, "buy");
        } else {
          return {
            date: stockCalcs.date,
            signal: signalOne
              ? `price is ${percentageDifference(
                  price,
                  stockCalcs.sma_50_day
                )} below 50-day SMA`
              : `price is ${percentageDifference(
                  price,
                  stockCalcs.high_52_week
                )} below 52-week high`,
            quantity,
            price,
            value: quantity * price
          };
        }
      }
    }

    return null;
  } catch (err) {
    throw new Error(err.message);
  }
};
