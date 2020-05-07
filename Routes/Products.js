const express = require('express');

const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const Order = require('../Models/Orders');
const validateProducts = require('../Helpers/validateProducts');
const validateObjectId = require('../Helpers/validateObjectId');
const ProductsRepo=require('../Repositories/ProductsRepository');

const router = express.Router();


//get all products
router.get('/', async (req, res) => {
    console.log("get all products");
    const Products = await ProductsRepo.getAllProducts();
    res.send(Products);
});

//get 3 random products
router.get('/random/three', async (req, res) => {
    console.log("get 3 random products");
    const Products = await ProductsRepo.getAllProducts();
    
    var arr = [];
    while(arr.length < 3){
        var r = Math.floor(Math.random() * Products.length);
        if(arr.indexOf(r) === -1) arr.push(r);
    }
    var response = [];
    response.push(Products[arr[0]])
    response.push(Products[arr[1]])
    response.push(Products[arr[2]])
    console.log(arr);
    res.send(response);
});

//get product by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        return res.status(400).send('Invalid Product Id');
    }
    const product = await ProductsRepo.getProductById(id);
    if (!product) {
        return res.status(404).send('Product not found');
    }
    res.send(product);
});

//get product by category
router.get('/:categoryId/Category', async (req, res) => {
    const { categoryId } = req.params;
    const { error } = validateObjectId(categoryId);
    if (error) {
        return res.status(400).send('Invalid Category Id');
    }
    const product = await ProductsRepo.getProductsByCategoryId(categoryId);
    if (!product) {
        return res.status(404).send('no product found');
    }
    res.send(product);
});

//get all orders in a product
router.get('/:productId/Orders', async (req, res) => {
    const { productId } = req.params;
    const { error } = validateObjectId(productId);
    if (error) {
        return res.status(400).send('Invalid Product Id');
    }
    const orders = await ProductsRepo.getProductOrders(productId);
    if (!orders) {
        return res.status(404).send('orders not found');
    }
    res.send(orders);
});

//search in products
router.get('/Search/:searchKey', async (req, res) => {
    const { searchKey } = req.params;
    const products = await ProductsRepo.getAllProducts();;
    if (!products) {
        return res.status(404).send('No products found');
    }
    var filteredProducts = products.filter(product => product.Name.toLowerCase().indexOf(searchKey.toLowerCase()) != -1);


    res.send(filteredProducts);
});

//get top selling products
router.get('/top/Selling', async (req, res) => {
    console.log("get top Selling products");
    await Product.find({}).sort({NSales: -1}).limit(7).exec( 
        function(err, products) {
            if(err)
            {
                console.log(err);
                res.status(404).send("error")
            }
            console.log(products.length);

            res.status(200).send(products);        
        }
    );
});


//insert product
router.post('/', async (req, res) => {        
    console.log("Post products")
    const { error } = validateProducts(req.body);
    if (error) {
        console.log(req.body)
        console.log(error.details);
        return res.status(400).send(error.details);
    }

    product =await ProductsRepo.insertProduct(req.body);

    category=await ProductsRepo.validateNewProductCategory(product);

    res.send(product);
});

//update product
router.patch('/:id', async (req, res) => {
    const product = await ProductsRepo.getProductById(req.params.id);
    console.log("Route req.params.id ",product);
   
    if(product != undefined)
    {
        if(req.body.Category != undefined)
        {
            // var currentCategory = product.Category;
            // var newCategory = req.body.Category;

            // var oldCategory = await Category.findById(currentCategory);
            // oldCategory.Products = oldCategory.Products.filter(p => p.productId.toString() != product._id.toString());
            // oldCategory = await oldCategory.save();

            // var newCategory = await Category.findById(newCategory);
            // newCategory.Products.push({"productId":product._id})
            // newCategory = await newCategory.save();
           console.log("Product",product);
           console.log("Product old Category",product.Category._id);
            newCategory=await ProductsRepo.updateProduct(product,req.body);
        }

        //await Product.updateOne({"_id":req.params.id},{ $set: req.body });
        
        await Product.updateOne({"_id":req.params.id},{ $set: req.body });
        
        res.status(200).send('Product Updated')
    }
    else
    {
        res.status(404).send('Product Not found')
    }
});

//delete product
router.delete('/:id', async (req, res) => {
    const product = await ProductsRepo.getProductById(req.params.id);
    if(product && product.IsDeleted!=true)
    {

        // product.IsDeleted = true;
        // await Product.updateOne({"_id":req.params.id},{ $set: product });

        ProductsRepo.deleteProduct(product);
        res.status(200).send('Product Deleted')
    }
    else
    {
        res.status(404).send('Product Not found')
    }
});


module.exports = router;