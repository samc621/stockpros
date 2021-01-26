exports.up = function (knex) {
  return knex.schema.createTable("strategies", (table) => {
    table.increments();
    table.string("name");
    table.decimal("buy_percentage");
    table.enu("buy_percentage_type_of", ["equity", "buying_power"], {
      useNative: true,
      enumName: "buy_percentages_type"
    });
    table.decimal("sell_percentage");
    table.enu("sell_percentage_type_of", ["qty", "cost_basis"], {
      useNative: true,
      enumName: "sell_percentages_type"
    });
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("is_deleted").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("strategies");
};
