exports.up = (knex) => knex.raw(`
    ALTER TYPE sell_percentages_type RENAME VALUE 'qty' TO 'quantity';
`);

exports.down = () => { };
