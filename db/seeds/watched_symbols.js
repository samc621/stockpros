exports.seed = function (knex) {
  return knex('watched_symbols').del()
    .then(function () {
      return knex("watched_symbols").insert([
        { id: 1, symbol: "AAPL" },
        { id: 2, symbol: "GOOG" },
        { id: 3, symbol: "FB" },
        { id: 4, symbol: "AMZN" },
        { id: 5, symbol: "MSFT" },
        { id: 6, symbol: "ADBE" },
        { id: 7, symbol: "INTC" },
        { id: 8, symbol: "NVDA" }
      ]);
    })
};
