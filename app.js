const express = require("express");
const app = express();
const routes = require("./routes");

const stocks = require("./core/stocks");
const redis = require("./services/redis");

const config = require("config");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/v1", routes);

const types = require("pg").types;
types.setTypeParser(1700, val => {
  return parseFloat(val);
});

stocks.loadStocks();

const port = config.get("server.port");
app.listen(port, () => console.log(`App listening at port ${port}`));

process.on("SIGINT", () => {
  redis.flushdb();
  process.exit();
});
