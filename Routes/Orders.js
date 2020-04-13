const express = require('express');

const Order = require('../Models/Orders');
const validateOrders = require('../Helpers/validateOrders');

const router = express.Router();

router.get('/', async (req, res) => {
    const Orders = await Order.find({}).populate('Products.Product');
    console.log(Orders[0].TotalPrice)
    res.send(Orders);
});

router.post('/', async (req, res) => {
    console.log("Post orders")
    const { error } = validateOrders(req.body);
    if (error) {
        console.log(error.details);
        return res.status(400).send("8alat ya zeft" + error.details);
    }

    let order = new Order({
        ...req.body
    });

    order = await order.save();

    res.send(order);
});

module.exports = router;