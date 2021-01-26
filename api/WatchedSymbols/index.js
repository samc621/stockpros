const express = require('express');
const { validate } = require('express-validation');

const router = express.Router();

const {
  createWatchedSymbol,
  getWatchedSymbol,
  getWatchedSymbols,
  updateWatchedSymbol,
  deleteWatchedSymbol
} = require('./controller');
const {
  create,
  findOne,
  findAll,
  update,
  deleted
} = require('./validation');

router
  .route('/')
  .post(validate(create), createWatchedSymbol)
  .get(validate(findAll), getWatchedSymbols);

router
  .route('/:id')
  .get(validate(findOne), getWatchedSymbol)
  .patch(validate(update), updateWatchedSymbol)
  .delete(validate(deleted), deleteWatchedSymbol);

module.exports = router;
