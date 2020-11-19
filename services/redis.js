const config = require("config");
const redis = require("redis");
module.exports = redis.createClient(
  config.get("redis.port"),
  config.get("redis.host")
);
