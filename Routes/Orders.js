const express = require('express');

const Order = require('../Models/Orders');
const User = require('../Models/Users');
const Product = require('../Models/Products');
const validateOrders = require('../Helpers/validateOrders');
const validateObjectId = require('../Helpers/validateObjectId');


const router = express.Router();

//get all orders
router.get('/', async (req, res) => {
    const Orders = await Order.find({}).populate('Products.Product');
    console.log(Orders[0].TotalPrice)
    res.send(Orders);
});

//get order by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid order Id');
    }
    const order = await Order.findById(id).populate('Products.Product')//.populate('Products.Quantity');
    if (!order) {
        console.log("order not found");
        return res.status(404).send('order not found');
    }
    console.log("success");

    res.send(order);
});


//get products in order
router.get('/:id/Products', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid order Id');
    }
    const order = await Order.findById(id).populate('Products.Product')//.populate('Products.Quantity');
    if (!order) {
        console.log("order not found");
        return res.status(404).send('order not found');
    }
    console.log("success");

    res.send(order.Products);
});


//insert Order
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

    
    for(let i = 0;i<order.Products.length;i++)
    {
        var product = await Product.findOne({ "_id": order.Products[i].Product});
        if(product.IsDeleted)
        {
             order.Products.splice(i, 1);
            i--;
        }

    }

    console.log(order.Products)
    order = await order.save();

    let productsInOrder = order.Products;

    for (let i = 0; i < productsInOrder.length; i++) {
        console.log(productsInOrder[i]);
        var product = await Product.findOne({ "_id": productsInOrder[i].Product});

        if(product)
        {
            product.Orders.push({"OrderId":order._id})
            await Product.updateOne({"_id":product._id},{ $set: product });
        }
    }

    //mapping order in User's orders []
    user= await User.findById(order.User);
    user.Orders.push({"id":order._id});
    user = await user.save();
    order = await Order.findById(order._id).populate('Products.Product');
    console.log(order.TotalPrice);
    res.send(order);
});


//PATCH orders/id
router.patch('/:id', async (req, res) => {
    //Step1: ValidateId
    let { id } = req.params;
    let { error } = validateObjectId(id);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid id');
    }
    let order = await Order.findById(id);
    if (order == null) {
        console.log(error.details);
        return res.status(404).send('Order resource not found!');
    }
    order = await Order.findByIdAndUpdate(id, {
        ...req.body
    }
        ,
        {
            new: true
        })
    console.log(order._id);
    let productsInOrder = order.Products;

    for (let i = 0; i < productsInOrder.length; i++) {
        console.log(productsInOrder[i]);
        var obj = await Product.findOne({ "_id": productsInOrder[i].Product, "Orders.id": order._id });
        if (obj == null) {
            await Product.findByIdAndUpdate(productsInOrder[i].Product, { $push: { "Orders": order._id } });
            console.log(`"inside if"${order._id}`);
        }
    }

    res.send("Successfully Updated!");
});


// DELETE orders/id
router.delete('/:id', async (req, res) => {

    let { id } = req.params;
    let { error } = validateObjectId(id);
    if (error) {

        return res.status(400).send('Invalid id');
    }
    let order = await Order.findById(id);
    if (order == null) {
        return res.status(404).send('Order resource not found!');
    }
    order = await Order.findByIdAndDelete(id);


    let products = await Product.find({ 'Orders.id': id });
    console.log(products);
    for (let i = 0; i < products.length; i++) {
        Product.findByIdAndUpdate(
            products[i]._id,
            { $pull: { 'Orders': { id: order._id } } }, function (err, model) {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
                res.json(model);
            });

    }



    res.send("Successfully Deleted!");

})


module.exports = router;