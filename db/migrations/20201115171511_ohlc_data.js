exports.up = function (knex) {
  return knex.schema.createTable("ohlc_data", (table) => {
    table.increments();
    table.string("symbol").notNullable();
    table.timestamp("timestamp").notNullable();
    table.decimal("open");
    table.decimal("high");
    table.decimal("low");
    table.decimal("close");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("is_deleted").defaultTo(false);
    table.unique(["symbol", "timestamp"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("ohlc_data");
};
