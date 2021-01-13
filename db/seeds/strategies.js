exports.seed = function (knex) {
  return knex("strategies").insert({
    id: 1,
    name: "Strategy 1",
    buy_percentage: 0.7,
    buy_percentage_type_of: "buying_power",
    sell_percentage: 1,
    sell_percentage_type_of: "qty"
  });
};