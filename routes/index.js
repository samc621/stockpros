const express = require("express");
const router = express.Router();
const signalsRoutes = require("../api/Signals");
const strategiesRoutes = require("../api/Strategies");

router.get("/", (req, res, next) => res.send("Welcome to the StockPros API"));
router.use("/signals", signalsRoutes);
router.use("/strategies", strategiesRoutes);

module.exports = router;
