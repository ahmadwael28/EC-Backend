const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const ShoppingCartSchema = Joi.object({
    User:Joi.objectId().required(),
    TotalPrice:Joi.number().min(0),
    Products:Joi.array().items({Product:Joi.objectId(),Quantity:Joi.number().min(1).default(1)}).default([])
});

const validateShoppingCart = ShoppingCart => ShoppingCartSchema.validate(ShoppingCart, { abortEarly: false });

module.exports = validateShoppingCart;