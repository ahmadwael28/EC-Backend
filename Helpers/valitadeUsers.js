const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const userSchema = Joi.object({
    Email: Joi.string().email().regex(/[^@]+@[^\.]+\..+/).required(),
    Username: Joi.string().regex(/^[a-z0-9_-]{3,16}$/).required(),
    Password: Joi.string().min(8).max(16).required(),
    Image: Joi.string().default("default.jpg"),
    Gender:Joi.string().valid('m','f'),
    Role:Joi.string().default("User"),
    Orders:Joi.array().items({id:Joi.objectId()}).default([])
});

const validateUser = user => userSchema.validate(user, { abortEarly: false });

module.exports = validateUser;