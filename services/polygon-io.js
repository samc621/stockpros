const WebSocket = require('ws');
const config = require('config');
const axios = require('axios');

const stocks = require('../core/stocks');
const redis = require('./redis');

const baseUrl = 'https://api.polygon.io';
const apiKey = `apiKey=${config.get('alpaca.liveApiKey')}`;
const ws = new WebSocket('wss://socket.polygon.io/stocks');

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      action: 'auth',
      params:
        config.get('polygon.apiKey') !== ''
          ? config.get('polygon.apiKey')
          : config.get('alpaca.liveApiKey')
    })
  );
};

ws.onmessage = async (message) => {
  const data = JSON.parse(message.data)[0];
  switch (data.ev) {
    case 'A':
      redis.get(data.sym, async (error, price) => {
        if (price !== 'PENDING ORDER') {
          redis.set(data.sym, data.a, await stocks.newTrade(data.sym));
        }
      });
      break;
    default:
      break;
  }
};

const waitForOpenConnection = () => new Promise((resolve, reject) => {
  const maxNumberOfAttempts = 10;
  const intervalTime = 200;

  let currentAttempt = 0;
  const interval = setInterval(() => {
    if (currentAttempt > maxNumberOfAttempts - 1) {
      clearInterval(interval);
      reject(new Error('Websocket not connecting'));
    } else if (ws.readyState === ws.OPEN) {
      clearInterval(interval);
      resolve();
    }
    currentAttempt += 1;
  }, intervalTime);
});

exports.sendWebhookMessage = async (data) => {
  if (ws.readyState !== ws.OPEN) {
    await waitForOpenConnection();
  }
  ws.send(JSON.stringify(data));
};

exports.getTickerDetails = async (symbol) => {
  try {
    const response = await axios.get(
      `${baseUrl}/v1/meta/symbols/${symbol}/company?${apiKey}`
    );
    return response.data;
  } catch (err) {
    if (err.response.status === 404) {
      throw new Error(`The details for ${symbol} can not be found.`);
    } else {
      throw new Error(err.message);
    }
  }
};

exports.getAggregates = async (symbol, multiplier, timespan, from, to) => {
  try {
    const response = await axios.get(
      `${baseUrl}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?${apiKey}`
    );
    return response.data;
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.getDailyPrices = async (symbol, date) => {
  try {
    const response = await axios.get(
      `${baseUrl}/v1/open-close/${symbol}/${date}?${apiKey}`
    );
    return response.data;
  } catch (err) {
    throw new Error(err.message);
  }
};
