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

router.get('/WithProducts', async (req, res) => {
    console.log("get all categories with products");
    const Categories = await Category.find({}).populate('Products.productId');
    res.send(Categories);
});

//search products within category
router.get('/Search/:categoryId/:searchKey',async (req,res)=>{
    const { categoryId } = req.params;
    const { searchKey } = req.params;
    const { error } = validateObjectId(categoryId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid category Id');
    }

    //repo
    let products = await CategoryRepo.GetAllProductsInCategory(categoryId);
    if(!products)
    {
        return res.status(404).send('Products resource is not found!');
    }
    
    products = products.filter(product => product.productId.IsDeleted == false);    
    console.log(products.length);
    var filteredProducts = products.filter(product => product.productId.Name.toLowerCase().indexOf(searchKey.toLowerCase()) != -1);
    console.log(filteredProducts.length);
    
    res.status(200).send(filteredProducts);

})

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