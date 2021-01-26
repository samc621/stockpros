const Joi = require('joi');

module.exports = {
  create: {
    body: Joi.object({
      symbol: Joi.string().required(),
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
      is_active: Joi.boolean().optional()
    })
  },
  update: {
    params: Joi.object({
      id: Joi.number().required()
    }),
    body: Joi.object({
      symbol: Joi.string().optional(),
      is_active: Joi.boolean().allow(null).optional()
    })
  },
  deleted: {
    params: Joi.object({
      id: Joi.number().required()
    })
  }
};
