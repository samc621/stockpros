const alpaca = require("../services/alpaca");

class StrategyInstance {
  constructor(buySignals, sellSignals, buyQuantity, sellQuantity) {
    this.buySignals = buySignals;
    this.sellSignals = sellSignals;
    this.buyQuantity = buyQuantity;
    this.sellQuantity = sellQuantity;
  }

  async executeStrategy(symbol, price, backtest, date) {
    try {
      if (this.sellSignals) {
        const quantity = this.sellQuantity;
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("sell ==> ", symbol, quantity);
          return await alpaca.createOrder(symbol, quantity, "sell");
        } else if (backtest) {
          return {
            date,
            quantity: quantity * -1,
            price,
            value: quantity * -1 * price
          };
        }
      } else if (this.buySignals) {
        const quantity = this.buyQuantity;
        if (!backtest && (await alpaca.isMarketOpen())) {
          console.log("buy ==> ", symbol, quantity);
          return await alpaca.createOrder(symbol, quantity, "buy");
        } else if (backtest) {
          return {
            date,
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

module.exports = StrategyInstance;
