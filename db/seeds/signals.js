exports.seed = (knex) => knex('strategy_signals').del().then(() => knex('signals').del()
  .then(() => knex('signals').insert([
    {
      id: 1,
      type: 'buy',
      operand_1: 'price',
      operator: '>=',
      percentage_difference: 0.2,
      operand_2: 'sma_50_day',
      next_signal_inclusive: false
    },
    {
      id: 2,
      type: 'buy',
      operand_1: 'sma_50_day',
      operator: '>=',
      percentage_difference: 0,
      operand_2: 'price',
      next_signal_inclusive: true
    },
    {
      id: 3,
      type: 'buy',
      operand_1: 'price',
      operator: '>=',
      percentage_difference: 0.2,
      operand_2: 'high_52_week',
      next_signal_inclusive: null
    },
    {
      id: 4,
      type: 'sell',
      operand_1: 'avg_entry_price',
      operator: '>=',
      percentage_difference: 0.4,
      operand_2: 'price',
      next_signal_inclusive: false
    },
    {
      id: 5,
      type: 'sell',
      operand_1: 'price',
      operator: '>=',
      percentage_difference: 0.01,
      operand_2: 'avg_entry_price',
      next_signal_inclusive: null
    }
  ])));
