const express = require('express');

const Product = require('../Models/Products');
const validateProducts = require('../Helpers/validateProducts');

const router = express.Router();

router.get('/', async (req, res) => {
    const Products = await Product.find({});
    console.log(Products[0].Name);
    console.log(Products[0].NetPrice);
    res.send(Products);
});

router.post('/', async (req, res) => {
    console.log("Post products")
    const { error } = validateProducts(req.body);
    if (error) {
        console.log(error.details);
        return res.status(400).send("8alat ya zeft" + error.details);
    }

    let product = new Product({
        ...req.body
    });

    product = await product.save();

    res.send(product);
});

module.exports = router;