exports.up = function (knex) {
  return knex.schema.createTable("watched_symbols", (table) => {
    table.increments();
    table.string("symbol").notNullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("is_deleted").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("watched_symbols");
};
