const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const productSchema = Joi.object({
    Category:Joi.objectId().required(),
    Name: Joi.string().alphanum().required(),
    Description: Joi.string().min(20).max(1000).required(),
    Price:Joi.number().min(0).required(),
    Promotion:Joi.number().min(0).max(100).default(0),
    NetPrice:Joi.number(),
    UnitsInStock:Joi.number().min(0).required().default(0),
    NSales:Joi.number().min(0).required().default(0),
    Image: Joi.string().default("defaultProduct.jpg"),
    IsDeleted: Joi.boolean().default(false),
    Orders:Joi.array().items({id:Joi.objectId()}).default([])
});

const validateProduct = product => productSchema.validate(product, { abortEarly: false });

module.exports = validateProduct;