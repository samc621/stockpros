const Alpaca = require('@alpacahq/alpaca-trade-api');
const config = require('config');
const Position = require('../models/positions');
const redis = require('./redis');

const alpaca = new Alpaca({
  keyId: config.get('alpaca.paperApiKey'),
  secretKey: config.get('alpaca.paperApiKeySecret'),
  paper: true,
  usePolygon: true
});

const ws = alpaca.trade_ws;
ws.connect();

ws.onConnect(() => {
  ws.subscribe(['trade_updates']);
});

ws.onOrderUpdate(async (message) => {
  const { order, event } = message;
  const { side, symbol } = order;
  const qty = Number(order.qty);
  const avg_entry_price = order.filled_avg_price;
  const cost_basis = qty * avg_entry_price;

  if (event === 'new') {
    redis.set(symbol, 'PENDING ORDER');
  }

  if (event !== 'fill') {
    return;
  }

  console.log(`${side} fill ===> `, symbol, qty);

  const position = await new Position().findOne({ symbol });

  let quantity;
  if (side === 'buy') {
    quantity = position ? (position.quantity += qty) : qty;
    if (position) {
      await new Position(position.id).update({ quantity });
    } else {
      await new Position().create({
        symbol,
        quantity,
        avg_entry_price,
        cost_basis
      });
    }
  } else if (side === 'sell') {
    quantity = position.quantity - qty;

    if (quantity < 0) {
      console.error('The quantity should never go negative.');
    } else if (quantity === 0) {
      await new Position(position.id).hardDelete();
    } else {
      await new Position(position.id).update({ quantity });
    }
  }

  redis.del(symbol);
});

exports.createOrder = async (symbol, qty, side) => {
  try {
    return await alpaca.createOrder({
      symbol,
      qty,
      side,
      type: 'market',
      time_in_force: 'gtc'
    });
  } catch (err) {
    if (err.response.statusCode === 403) {
      throw new Error(err.message.message);
    } else {
      throw new Error(err.message);
    }
  }
};

exports.getAllPositions = async () => {
  try {
    return await alpaca.getPositions();
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.getPositionForSymbol = async (symbol) => {
  try {
    return await alpaca.getPosition(symbol);
  } catch (err) {
    if (err.response.statusCode === 404) {
      throw new Error('The position does not exist.');
    } else {
      throw new Error(err.message);
    }
  }
};

exports.getAccount = async () => {
  try {
    return await alpaca.getAccount();
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.isMarketOpen = async () => {
  try {
    const clock = await alpaca.getClock();
    return clock.is_open;
  } catch (err) {
    throw new Error(err.message);
  }
};
