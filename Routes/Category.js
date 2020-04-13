const express = require('express');

const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const validateCategories = require('../Helpers/validateCategories');

const router = express.Router();

router.get('/', async (req, res) => {
    const Categories = await Category.find({});
    res.send(Categories);
});

router.post('/', async (req, res) => {
    console.log("Post category")
    const { error } = validateCategories(req.body);
    if (error) {
        return res.status(400).send("8alat ya zeft" + error.details);
    }

    let category = new Category({
        ...req.body
    });

    category = await category.save();

    res.send(category);
});

module.exports = router;