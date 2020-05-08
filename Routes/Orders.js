const express = require('express');

const Order = require('../Models/Orders');
const OrderRepository = require('../Repositories/OrderRepository');
const ProductsRepo=require('../Repositories/ProductsRepository');
const User = require('../Models/Users');
const Product = require('../Models/Products');
const validateOrders = require('../Helpers/validateOrders');
const validateObjectId = require('../Helpers/validateObjectId');



const router = express.Router();

//get all orders
router.get('/', async (req, res) => {
   // const Orders = await Order.find({}).populate('Products.Product');
    const Orders = await OrderRepository.getAllOrders();
    //console.log(Orders[0].TotalPrice)
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
    const order = await OrderRepository.getOrderById(id);
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
    const order = await OrderRepository.getOrderById(id);
    if (!order) {
        console.log("order not found");
        return res.status(404).send('order not found');
    }
    console.log("success");

    res.send(order.Products);
});

//get orders for a user
router.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid user Id');
    }
    const orders = await OrderRepository.getOrdersByUser(id);
    if (!orders) {
        console.log("no orders found");
        return res.status(404).send('order not found');
    }
    console.log("success");

    res.send(orders);
});


//insert Order
router.post('/', async (req, res) => {
    console.log("Post orders")
    const { error } = validateOrders(req.body);
    if (error) {
        console.log(error.details);
        return res.status(400).send("8alat ya zeft" + error.details);
    }

    let order = await OrderRepository.addOrder(req.body);
    order = await ProductsRepo.removeIsDeletedProducts(order);
    console.log(order.Products)
    order = await order.save();

    await OrderRepository.notifyProductsOfOrders(order);

    //mapping order in User's orders []
    await OrderRepository.notifyUserOfOrders(order);
    order = await OrderRepository.getOrderById(order._id);//Return order with products populated
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
    let order = await OrderRepository.getOrderById(id);
   
    if(order != null)
    {
        if(req.body.Status != undefined)
        {
            order = await OrderRepository.UpdateOrderStatusById(id,req.body.Status);
            res.send("Order's Status Successfully Updated!");
        }
    }
    else
    {
        console.log(error.details);
        return res.status(404).send('Order resource not found!');
    }
   
    
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
    else
    {
        order = await OrderRepository.CancelOrderById(id);
        return res.status(200).send('Order is successfully canceled');
    }



   




})


module.exports = router;