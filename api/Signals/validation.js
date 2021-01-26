const Joi = require('joi');

const validOperands = [
  'price',
  'avg_entry_price',
  'sma_50_day',
  'sma_200_day',
  'high_52_week',
  'low_52_week',
  'cagr_3_year'
];

module.exports = {
  create: {
    body: Joi.object({
      strategy_ids: Joi.array().items(Joi.number()).optional(),
      type: Joi.string().valid('buy', 'sell').required(),
      operand_1: Joi.string()
        .valid(...validOperands)
        .required(),
      operator: Joi.string().valid('<=', '>=').required(),
      percentage_difference: Joi.number().max(1).required(),
      operand_2: Joi.string()
        .valid(...validOperands)
        .required(),
      next_signal_inclusive: Joi.boolean().allow(null).required()
    })
  },
  findOne: {
    params: Joi.object({
      id: Joi.number().required()
    })
  },
  findAll: {
    query: Joi.object({
      type: Joi.string().valid('buy', 'sell').optional()
    })
  },
  update: {
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      strategy_ids: Joi.array().items(Joi.number()).optional(),
      type: Joi.string().valid('buy', 'sell').optional(),
      operand_1: Joi.string()
        .valid(...validOperands)
        .optional(),
      operator: Joi.string().valid('<=', '>=').optional(),
      percentage_difference: Joi.number().max(1).optional(),
      operand_2: Joi.string()
        .valid(...validOperands)
        .optional(),
      next_signal_inclusive: Joi.boolean().allow(null).optional()
    })
  },
  deleted: {
    params: Joi.object({
      id: Joi.number().required()
    })
  }
};
