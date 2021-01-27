const Joi = require('joi');

module.exports = {
  create: {
    body: Joi.object({
      name: Joi.string().allow(null).optional(),
      buy_percentage: Joi.number().max(1).required(),
      buy_percentage_type_of: Joi.string()
        .valid('equity', 'buying_power')
        .required(),
      sell_percentage: Joi.number().max(1).required(),
      sell_percentage_type_of: Joi.string()
        .valid('quantity', 'cost_basis')
        .required(),
      is_active: Joi.boolean().allow(null).optional()
    })
  },
  findOne: {
    params: Joi.object({
      id: Joi.number().required()
    })
  },
  findAll: {
    query: Joi.object({
      name: Joi.string().optional(),
      is_active: Joi.boolean().optional()
    })
  },
  update: {
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      name: Joi.string().allow(null).optional(),
      buy_percentage: Joi.number().max(1).optional(),
      buy_percentage_type_of: Joi.string()
        .valid('equity', 'buying_power')
        .optional(),
      sell_percentage: Joi.number().max(1).optional(),
      sell_percentage_type_of: Joi.string()
        .valid('quantity', 'cost_basis')
        .optional(),
      is_active: Joi.boolean().allow(null).optional()
    })
  },
  deleted: {
    params: Joi.object({
      id: Joi.number().required()
    })
  },
  backtest: {
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      symbol: Joi.string().required(),
      years: Joi.number().max(15).allow(null).optional(),
      start_value: Joi.number().allow(null).optional()
    })
  }
};
