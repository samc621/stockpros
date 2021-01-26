exports.seed = (knex) => knex('strategy_signals').del()
  .then(() => knex('strategy_signals').insert([
    { id: 1, strategy_id: 1, signal_id: 1 },
    { id: 2, strategy_id: 1, signal_id: 2 },
    { id: 3, strategy_id: 1, signal_id: 3 },
    { id: 4, strategy_id: 1, signal_id: 4 },
    { id: 5, strategy_id: 1, signal_id: 5 }
  ]));
