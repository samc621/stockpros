const stocks = require("./core/stocks");
const redis = require("./services/redis");

const types = require("pg").types;
types.setTypeParser(1700, val => {
  return parseFloat(val);
});

stocks.loadStocks();

process.on("SIGINT", () => {
  redis.flushdb();
  process.exit();
});
