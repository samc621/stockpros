exports.up = function (knex) {
  return knex.schema.createTable("ticker_technicals", table => {
    table.increments(),
      table.integer("ticker_id").unsigned(),
      table.foreign("ticker_id").references("tickers.id"),
      table.decimal("sma_50_day"),
      table.decimal("sma_200_day"),
      table.decimal("high_52_week"),
      table.decimal("low_52_week"),
      table.decimal("average_volume_10_day"),
      table.decimal("cagr_3_year"),
      table.timestamp("created_at").defaultTo(knex.fn.now()),
      table.timestamp("updated_at").defaultTo(knex.fn.now()),
      table.boolean("is_deleted").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("ticker_technicals");
};
