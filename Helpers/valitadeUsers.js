const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const userSchema = Joi.object({
    Name: Joi.string().regex(/^[\sa-zA-Z-]*$/),
    Email: Joi.string().email().regex(/[^@]+@[^\.]+\..+/).required(),
    Username: Joi.string().regex(/^[a-z0-9_-]{3,16}$/).required(),
    Password: Joi.string().min(8).max(16).required(),
    Image: Joi.string().default("default.jpg"),
    Gender:Joi.string().valid('m','f'),
    Role:Joi.string().default("User"),
    Address:Joi.string(),
    IsDeleted: Joi.boolean().default(false),
    Orders:Joi.array().items({id:Joi.objectId()}).default([]),
    ShoppingCart:Joi.objectId()
});

const validateUser = user => userSchema.validate(user, { abortEarly: false });

module.exports = validateUser;