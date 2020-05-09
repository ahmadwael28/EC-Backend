
const Product = require('../Models/Products');
const User = require('../Models/Users');
const Order = require('../Models/Orders');
const Category = require('../Models/Categories');
const ProductsRepo=require('../Repositories/ProductsRepository');
const UserRepo=require('../Repositories/UserRepository');

module.exports =
{
    
    getAllOrders: async function ()
    {
        return await Order.find({}).populate('Products.Product');
    },

    getOrderById: async function(orderID)
    {
        return await Order.findById(orderID).populate('Products.Product')
    },
    getOrdersByUser: async function(userId)
    {
        return await Order.find({User:userId}).populate('Products.Product')
    },
    addOrder:async function(orderData)
    {
        let order = new Order({
            ...orderData
        });
        return order;

    },
    notifyProductsOfOrders:async function(order)
    {
        ProductsRepo.AddOrderInProducts(order);
    },
    notifyUserOfOrders:async function(order)
    {
        UserRepo.AddOrderInUser(order);
    },
   
    UpdateOrderStatusById:async function(orderID,status)
    {
        return await Order.findByIdAndUpdate(orderID, {Status: status});
    },
    CancelOrderById:async function(orderID)
    {
        return await Order.findByIdAndUpdate(orderID, {Status:"Canceled"});
    }
}