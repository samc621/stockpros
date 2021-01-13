const express = require("express");
const router = express.Router();
const signalsRoutes = require("../api/Signals");
const strategiesRoutes = require("../api/Strategies");
const watchedSymbolsRoutes = require("../api/WatchedSymbols");

router.get("/", (req, res, next) => res.send("Welcome to the StockPros API"));
router.use("/signals", signalsRoutes);
router.use("/strategies", strategiesRoutes);
router.use("/watchedSymbols", watchedSymbolsRoutes);

module.exports = router;
