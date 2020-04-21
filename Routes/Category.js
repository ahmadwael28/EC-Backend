const express = require('express');

const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const validateCategories = require('../Helpers/validateCategories');
const validateObjectId = require('../Helpers/validateObjectId');
const CategoryRepo=require('../Repositories/CategoryRepository');


const router = express.Router();

router.get('/', async (req, res) => {
    const Categories = await Category.find({});
    res.send(Categories);
});

router.post('/', async (req, res) => {
    console.log("Post category")
    const { error } = validateCategories(req.body);
    if (error) {
        return res.status(400).send(error.details);
    }

    let category = new Category({
        ...req.body
    });
    //repo
    category = CategoryRepo.SaveCategory(category);

    res.send(category);
});

//Update Category name /id/newName
router.get('/:id/:CategoryName/UpdateName',async (req,res)=>{
    const { id } = req.params;
    const { CategoryName } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid category Id');
    }

    //repo
    let category = await CategoryRepo.GetCategoryById(id);
    if(!category)
    {
        return res.status(404).send('Category resource is not found!');
    }
    console.log(category);
    category.CategoryName = CategoryName;
    //repo
    category = await CategoryRepo.SaveCategory(category);
    
    res.status(200).send(category);

})

router.get('/:id/GetAllProducts',async (req,res)=>{
    const { id } = req.params;
    const { CategoryName } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid category Id');
    }

    //repo
    let products = await CategoryRepo.GetAllProductsInCategory(id);
    if(!products)
    {
        return res.status(404).send('Category resource is not found!');
    }
    //console.log(category);
    //category.CategoryName = CategoryName;
    //repo
    //category = await CategoryRepo.SaveCategory(category);
    
    res.status(200).send(products);

})

module.exports = router;