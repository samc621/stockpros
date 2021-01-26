exports.up = function (knex) {
  return knex.schema.createTable("strategy_signals", (table) => {
    table.increments();
    table.integer("strategy_id").unsigned();
    table.foreign("strategy_id").references("strategies.id");
    table.integer("signal_id").unsigned();
    table.foreign("signal_id").references("signals.id");
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("is_deleted").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("strategy_signals");
};
