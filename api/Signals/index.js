const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");

const {
  createSignal,
  getSignal,
  getSignals,
  updateSignal,
  deleteSignal
} = require("./controller");
const { create, findOne, findAll, update, deleted } = require("./validation");

router
  .route("/")
  .post(validate(create), createSignal)
  .get(validate(findAll), getSignals);

router
  .route("/:id")
  .get(validate(findOne), getSignal)
  .patch(validate(update), updateSignal)
  .delete(validate(deleted), deleteSignal);

module.exports = router;
