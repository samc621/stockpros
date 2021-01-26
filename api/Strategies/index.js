const express = require('express');
const { validate } = require('express-validation');

const router = express.Router();

const {
  createStrategy,
  getStrategy,
  getStrategies,
  updateStrategy,
  deleteStrategy,
  backtestStrategy
} = require('./controller');
const {
  create,
  findOne,
  findAll,
  update,
  deleted,
  backtest
} = require('./validation');

router
  .route('/')
  .post(validate(create), createStrategy)
  .get(validate(findAll), getStrategies);

router.route('/:id/backtest').post(validate(backtest), backtestStrategy);

router
  .route('/:id')
  .get(validate(findOne), getStrategy)
  .patch(validate(update), updateStrategy)
  .delete(validate(deleted), deleteStrategy);

module.exports = router;
