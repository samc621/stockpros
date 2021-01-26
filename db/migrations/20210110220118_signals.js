exports.up = function (knex) {
  return knex.schema.createTable("signals", (table) => {
    table.increments();
    table.enu("type", ["buy", "sell"], {
      useNative: true,
      enumName: "signals_type"
    });
    table.string("operand_1");
    table.string("operator");
    table.decimal("percentage_difference");
    table.string("operand_2");
    table.boolean("next_signal_inclusive");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("is_deleted").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("signals");
};
