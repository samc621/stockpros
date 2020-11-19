const alpaca = require("../services/alpaca");
const { percentageDifference } = require("../helpers/math");

const Position = require("../models/positions");
const TickerTechnical = require("../models/tickerTechnicals");

const targetAnnualReturn = 0.2;
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

      const signalOne =
        percentageDifference(pst.avg_entry_price, price) >=
        targetAnnualReturn * 2;
      const signalTwo =
        percentageDifference(price, pst.avg_entry_price) >= maxRisk;

      if (signalOne || signalTwo) {
        const quantity = Number(pst.qty);
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("sell ==> ", symbol, quantity);
          await alpaca.createOrder(symbol, quantity, "sell");
        } else {
          return {
            date: tickerTechnical.date,
            signal: signalOne
              ? `price is ${percentageDifference(
                  pst.avg_entry_price,
                  price
                )} above average entry price`
              : `price is ${percentageDifference(
                  price,
                  pst.avg_entry_price
                )} below average entry price`,
            quantity: quantity * -1,
            price,
            value: quantity * -1 * price
          };
        }
      }
    } else {
      const signalOne =
        percentageDifference(price, tickerTechnical.sma_50_day) >=
        targetAnnualReturn / 2;
      const signalTwo =
        price >= tickerTechnical.sma_50_day &&
        percentageDifference(price, tickerTechnical.high_52_week) >=
          targetAnnualReturn;

      if (signalOne || signalTwo) {
        const acct = account ? account : await alpaca.getAccount();
        const quantity = Math.floor((acct.buying_power * maxExposure) / price);
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("buy ==> ", symbol, quantity);
          await alpaca.createOrder(symbol, quantity, "buy");
        } else {
          return {
            date: tickerTechnical.date,
            signal: signalOne
              ? `price is ${percentageDifference(
                  price,
                  tickerTechnical.sma_50_day
                )} below 50-day SMA`
              : `price is ${percentageDifference(
                  price,
                  tickerTechnical.high_52_week
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
