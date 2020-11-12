const WebSocket = require("ws");
const config = require("config");
const axios = require("axios");

const stocks = require("../core/stocks");
const redis = require("./redis");

const baseUrl = "https://api.polygon.io";
const apiKey = `apiKey=${config.get("alpaca.liveApiKey")}`;
const ws = new WebSocket("wss://socket.polygon.io/stocks");

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      action: "auth",
      params: config.get("alpaca.liveApiKey")
    })
  );
};

ws.onmessage = message => {
  const data = JSON.parse(message.data)[0];
  switch (data.ev) {
    case "T":
      redis.set(data.sym, data.p, stocks.newTrade(data.sym));
      break;
    case "status":
      break;
  }
};

exports.sendWebhookMessage = data => {
  ws.send(JSON.stringify(data));
};

exports.getTickerDetails = async symbol => {
  try {
    const response = await axios.get(
      `${baseUrl}/v1/meta/symbols/${symbol}/company?${apiKey}`
    );
    return response.data;
  } catch (err) {
    if (err.response.status === 404) {
      return {};
    }
    throw new Error(err);
  }
};

exports.getAggregates = async (symbol, multiplier, timespan, from, to) => {
  try {
    const response = await axios.get(
      `${baseUrl}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?${apiKey}`
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};

exports.getSnapshot = async symbol => {
  try {
    const response = await axios.get(
      `${baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?${apiKey}`
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};
