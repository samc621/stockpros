const Signal = require('../../models/signals');
const StrategySignal = require('../../models/strategySignals');

const response = require('../../helpers/server-response');

exports.createSignal = async (req, res) => {
  try {
    const { strategy_ids } = req.body;
    delete req.body.strategy_ids;
    const signal = await new Signal().create(req.body);

    if (strategy_ids) {
      strategy_ids.map(async (strategy_id) => {
        await new StrategySignal().create({
          strategy_id,
          signal_id: signal.id
        });
      });
    }

    return response.Ok(res, 'Signal successfully created', signal);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getSignal = async (req, res) => {
  try {
    const { id } = req.params;
    const signal = await new Signal().findOne({ id });

    return response.Ok(res, 'Signal successfully found', signal);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getSignals = async (req, res) => {
  try {
    const signals = await new Signal().find(req.query);

    return response.Ok(res, 'Signals successfully found', signals);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateSignal = async (req, res) => {
  try {
    const { id } = req.params;
    const { strategy_ids } = req.body;
    delete req.body.strategy_ids;
    const signal = await new Signal(id).update(req.body);

    if (strategy_ids) {
      const existingStrategies = await new StrategySignal().find({
        signal_id: id
      });
      existingStrategies.map(async (es) => {
        if (!strategy_ids.includes(es.strategy_id)) {
          await new StrategySignal(es.id).update({ is_deleted: true });
        }
      });

      strategy_ids.map(async (strategy_id) => {
        if (
          !existingStrategies.map((es) => es.strategy_id).includes(strategy_id)
        ) {
          await new StrategySignal().create({
            strategy_id,
            signal_id: signal.id
          });
        }
      });
    }

    return response.Ok(res, 'Signal successfully updated', signal);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteSignal = async (req, res) => {
  try {
    const { id } = req.params;
    const signal = await new Signal(id).update({ is_deleted: true });

    return response.Ok(res, 'Signal successfully deleted', signal);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
