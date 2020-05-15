const express = require('./node_modules/express');

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


//search products within category
router.get('/Page/:categoryId/:NP/:RP',async (req,res)=>{
    console.log("get page");
    const { categoryId } = req.params;
    const { NP } = req.params;
    const { RP } = req.params;
    const { error } = validateObjectId(categoryId);

    var NProductsPerPage = Number.parseInt(NP);
    var RequiredPage = Number.parseInt(RP);

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
    var subArray = [];
    var startPos = (RequiredPage - 1) * NProductsPerPage;

    if((startPos + NProductsPerPage) > products.length)
        subArray = products.slice(startPos,startPos + (products.length - startPos));
    else
        subArray = products.slice(startPos,startPos + NProductsPerPage)
    
    
    res.status(200).send(subArray);

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

router.get('/:id/GetProductsCount',async (req,res)=>{
    const { id } = req.params;
    const { CategoryName } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid category Id');
    }

    //repo
    let products = await CategoryRepo.GetAllProductsInCategory(id);
    
    products = products.filter(p => p.productId.IsDeleted == false);
    if(!products)
    {
        return res.status(404).send('Category resource is not found!');
    }
    //console.log(category);
    //category.CategoryName = CategoryName;
    //repo
    //category = await CategoryRepo.SaveCategory(category);
    
    console.log(products.length);
    res.status(200).send({count:products.length});

})

module.exports = router;