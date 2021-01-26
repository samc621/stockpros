exports.up = function (knex) {
  return knex.schema.createTable("tickers", (table) => {
    table.increments();
    table.string("name").notNullable();
    table.string("symbol").notNullable();
    table.string("logo");
    table.string("country");
    table.string("exchange");
    table.string("industry");
    table.string("sector");
    table.string("market_cap");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("is_deleted").defaultTo(false);
    table.unique("symbol");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tickers");
};
