exports.up = function (knex) {
  return knex.schema.createTable("positions", (table) => {
    table.increments();
    table.string("symbol").notNullable();
    table.decimal("quantity").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    table.boolean("is_deleted").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("positions");
};
