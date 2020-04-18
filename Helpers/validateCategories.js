const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const categorySchema = Joi.object({
    CategoryName:Joi.string().required(),
    Products:Joi.array().items({productId:Joi.objectId()}).default([])
});

const validateCategory = category => categorySchema.validate(category, { abortEarly: false });

module.exports = validateCategory;