const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const orderSchema = Joi.object({
    User:Joi.objectId().required(),
    Date: Joi.date().default(Date.now()),
    Status: Joi.string().valid('Pending','Accepted',"Rejected","Canceled").default("Pending"),
    TotalPrice:Joi.number().min(0),
    Products:Joi.array().items({Product:Joi.objectId(),Quantity:Joi.number().min(1).default(1)})
});

const validateOrder = order => orderSchema.validate(order, { abortEarly: false });

module.exports = validateOrder;