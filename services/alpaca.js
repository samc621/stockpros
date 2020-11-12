const Alpaca = require("@alpacahq/alpaca-trade-api");
const config = require("config");
const PositionsModel = require("../models/positions");
const Position = require("../models/positions");

const alpaca = new Alpaca({
  keyId: config.get("alpaca.paperApiKey"),
  secretKey: config.get("alpaca.paperApikeySecret"),
  paper: true,
  usePolygon: true
});

const ws = alpaca.trade_ws;
ws.connect();

ws.onConnect(() => {
  ws.subscribe(["trade_updates"]);
});

ws.onOrderUpdate(async order => {
  const symbol = order.symbol;
  const position = await new Position().findOne({ symbol });

  let quantity;
  if (order.side === "buy") {
    quantity = position ? (position.quantity += order.qty) : order.qty;
    if (position) {
      await new Position(position.id).update({ quantity });
    } else {
      await new Position().create({ symbol, quantity });
    }
  } else if (order.side === "sell") {
    quantity = position.quantity -= order.qty;
    if (quantity == 0) {
      await new Position(position.id).hardDelete();
    } else {
      await new Position(position.id).update({ quantity });
    }
  }
});

exports.createOrder = async (symbol, qty, side) => {
  try {
    return await alpaca.createOrder({
      symbol,
      qty,
      side,
      type: "market",
      time_in_force: "gtc"
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.getAllPositions = async () => {
  try {
    return await alpaca.getPositions();
  } catch (err) {
    throw new Error(err);
  }
};

exports.getPositionForSymbol = async symbol => {
  try {
    return await alpaca.getPosition(symbol);
  } catch (err) {
    if (err.response.status === 404) {
      return {};
    }
    throw new Error(err);
  }
};

exports.getAccount = async () => {
  try {
    return await alpaca.getAccount();
  } catch (err) {
    throw new Error(err);
  }
};
