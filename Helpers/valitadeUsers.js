const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const userSchema = Joi.object({
    FirstName: Joi.string().regex(/^[a-zA-Z-]*$/),
    LastName: Joi.string().regex(/^[a-zA-Z-]*$/),
    PhoneNumber: Joi.string().regex(/^(00201)[0-9]{9}$/).min(14).max(14),
    City: Joi.string().regex(/^[a-zA-Z-]*$/),
    Street: Joi.string(),
    Zip: Joi.string().regex(/^[0-9]{4}$/).max(4).min(4),
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