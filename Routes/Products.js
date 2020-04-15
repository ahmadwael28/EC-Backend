const express = require('express');

const Product = require('../Models/Products');
const Order = require('../Models/Orders');
const validateProducts = require('../Helpers/validateProducts');
const validateObjectId = require('../Helpers/validateObjectId');

const router = express.Router();


//get all products
router.get('/', async (req, res) => {
    const Products = await Product.find({IsDeleted : false}).populate('Category');
    res.send(Products);
});

//get product by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid Product Id');
    }
    const product = await Product.findById(id).populate('Category').populate('Orders.id');
    if (!product) {
        console.log("no product found");
        return res.status(404).send('Product not found');
    }
    console.log("success");

    res.send(product);
});

//get product by category
router.get('/:Id/Category', async (req, res) => {
    const { Id } = req.params;
    const { error } = validateObjectId(Id);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid Product Id');
    }
    const product = await Product.find({Category : Id}).populate('Category').populate('Orders.id');
    if (!product) {
        console.log("no product found");
        return res.status(404).send('no product found');
    }
    console.log("success");

    res.send(product);
});

//get all orders in a product
router.get('/:id/Orders', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid Product Id');
    }
    const product = await Product.findById(id).populate('Category').populate('Orders.id');
    if (!product) {
        console.log("no product found");
        return res.status(404).send('Product not found');
    }
    console.log("success");

    res.send(product.Orders);
});

//insert product
router.post('/', async (req, res) => {        
    console.log(req.body)

    console.log("Post products")
    const { error } = validateProducts(req.body);
    if (error) {
        console.log(req.body)
        console.log(error.details);
        return res.status(400).send("8alat ya zeft" + error.details);
    }

    let product = new Product({
        ...req.body
    });

    product = await product.save();

    res.send(product);
});

//update product
router.patch('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if(product != 'undefined')
    {
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
    const product = await Product.findById(req.params.id);
    if(product)
    {
        //#region 
        // var orders = product.Orders;

        // for(let k=0;k<orders.length;k++)
        // {
        //     let order = orders[k];
        //     console.log(order.id);

        //     let pOrder = await Order.findById(order.id);
        //     for(let i = 0;i<pOrder.Products.length;i++)
        //     {
        //         if(pOrder.Products[i].Product == req.params.id)
        //         {
        //             pOrder.Products.splice(i, 1);
        //             await Order.updateOne({"_id":pOrder._id},{ $set: pOrder});
        //             console.log("product removed from some order");
        //             break;
        //         }
        //     }
        // }
        //#endregion

        product.IsDeleted = true;
        await Product.updateOne({"_id":req.params.id},{ $set: product });

        res.status(200).send('Product Deleted')
    }
    else
    {
        res.status(404).send('Product Not found')
    }
});

//insert Into orders
// router.patch('/:id/Orders', async (req, res) => {
//     const product = await Product.findById(req.params.id);
//     if(product != 'undefined')
//     {
//         var original = product.Orders;
//         console.log("adding order")
//         product.Orders.push(req.body);
//         await Product.updateOne({"_id":req.params.id},{ $set: product });
//         console.log("should be updated !!");
//         res.status(200).send('Product orders Updated')
//     }
//     else
//     {
//         res.status(404).send('Product Not found')
//     }
// });




module.exports = router;