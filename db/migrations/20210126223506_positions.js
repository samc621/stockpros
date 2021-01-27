exports.up = (knex) => knex.schema.alterTable("positions", (table) => {
    table.decimal("avg_entry_price");
    table.decimal("cost_basis");
});

exports.down = () => { };
