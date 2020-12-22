const alpaca = require("../services/alpaca");

class Strategy {
  constructor(buySignals, sellSignals, buyQuantity, sellQuantity) {
    this.buySignals = buySignals;
    this.sellSignals = sellSignals;
    this.buyQuantity = buyQuantity;
    this.sellQuantity = sellQuantity;
  }

  async executeStrategy(symbol, price, backtest, stockCalcs) {
    try {
      if (!symbol || !price || !stockCalcs) {
        return;
      }

      if (this.sellSignals.some(signal => signal === true)) {
        const quantity = this.sellQuantity;
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("sell ==> ", symbol, quantity);
          return await alpaca.createOrder(symbol, quantity, "sell");
        } else if (backtest) {
          return {
            date: stockCalcs.date,
            quantity: quantity * -1,
            price,
            value: quantity * -1 * price
          };
        }
      } else if (this.buySignals.some(signal => signal === true)) {
        const quantity = this.buyQuantity;
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("buy ==> ", symbol, quantity);
          return await alpaca.createOrder(symbol, quantity, "buy");
        } else if (backtest) {
          return {
            date: stockCalcs.date,
            quantity,
            price,
            value: quantity * price
          };
        }
      }

      return null;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

module.exports = Strategy;
