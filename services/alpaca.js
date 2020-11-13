const Alpaca = require("@alpacahq/alpaca-trade-api");
const config = require("config");
const Position = require("../models/positions");

const alpaca = new Alpaca({
  keyId: config.get("alpaca.paperApiKey"),
  secretKey: config.get("alpaca.paperApiKeySecret"),
  paper: true,
  usePolygon: true
});

const ws = alpaca.trade_ws;
ws.connect();

ws.onConnect(() => {
  ws.subscribe(["trade_updates"]);
});

ws.onOrderUpdate(async message => {
  if (message.event !== "fill") {
    return;
  }

  const order = message.order;
  const side = order.side;
  const symbol = order.symbol;
  const qty = Number(order.qty);
  console.log(`${side} fill ===> `, symbol, qty);

  const position = await new Position().findOne({ symbol });

  let quantity;
  if (side === "buy") {
    quantity = position ? (position.quantity += qty) : qty;
    if (position) {
      await new Position(position.id).update({ quantity });
    } else {
      await new Position().create({ symbol, quantity });
    }
  } else if (side === "sell") {
    quantity = position.quantity -= qty;

    if (quantity < 0) {
      console.log("The quantity should never go negative.");
    } else if (quantity == 0) {
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

exports.getPositionForSymbol = async symbol => {
  try {
    return await alpaca.getPosition(symbol);
  } catch (err) {
    if (err.response.statusCode === 404) {
      throw new Error("The position does not exist.");
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
