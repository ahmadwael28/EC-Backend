const express = require('express');

const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const validateCategories = require('../Helpers/validateCategories');
const validateObjectId = require('../Helpers/validateObjectId');


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

//Update Category name /id/newName
router.get('/:id/:CategoryName',async (req,res)=>{
    const { id } = req.params;
    const { CategoryName } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid category Id');
    }
    let category = await Category.findById(id);
    if(!category)
    {
        return res.status(404).send('Category resource is not found!');
    }
    category.CategoryName = CategoryName;
    category = await category.save();
    
    res.status(200).send(category);

})

module.exports = router;