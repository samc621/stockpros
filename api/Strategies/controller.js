const Strategy = require("../../models/strategies");

const stocks = require("../../core/stocks");

const response = require("../../helpers/server-response");

exports.createStrategy = async (req, res) => {
  try {
    const strategy = await new Strategy().create(req.body);

    return response.Ok(res, "Strategy successfully created", strategy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getStrategy = async (req, res) => {
  try {
    const id = req.params.id;
    let data = {};
    data["strategies.id"] = id;
    const strategy = await new Strategy().findOne(data);

    return response.Ok(res, "Strategy successfully found", strategy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getStrategies = async (req, res) => {
  try {
    const strategies = await new Strategy().find(req.query);

    return response.Ok(res, "Strategyes successfully found", strategies);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateStrategy = async (req, res) => {
  try {
    const id = req.params.id;
    const strategy = await new Strategy(id).update(req.body);

    return response.Ok(res, "Strategy successfully updated", strategy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteStrategy = async (req, res) => {
  try {
    const id = req.params.id;
    const strategy = await new Strategy(id).update({ is_deleted: true });

    return response.Ok(res, "Strategy successfully deleted", strategy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.backtestStrategy = async (req, res) => {
  try {
    const id = req.params.id;
    const symbol = req.body.symbol;
    const years = req.body.years || 5;
    const startValue = req.body.start_value || 10000;

    const results = await stocks.backtest(id, symbol, years, startValue);

    return response.Ok(res, "Backtest successfully run for strategy", results);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
