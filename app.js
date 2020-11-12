const stocks = require("./core/stocks");
const redis = require("./services/redis");

stocks.loadStocks();

process.on("SIGINT", () => {
  redis.flushdb();
  process.exit();
});
