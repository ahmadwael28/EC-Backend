
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
        orders =  await Order.find({}).populate('Products.Product').populate('User');
        console.log('Inside getAll Orders in order repo...');
        let i=0;
        orders.forEach(element => {
           
            console.log(`Order Element Num ${i+1}`,element);
            i++;
        });
        ordersWithTP = new Array();
       
        orders.forEach(element => {
            ordersWithTP.push({'Order':element,'TotalPrice':element.TotalPrice});
        });
        return ordersWithTP;
    },

    getOrderById: async function(orderID)
    {
        return await Order.findById(orderID).populate('Products.Product')
    },
    getOrdersByUser: async function(userId)
    {
        return await Order.find({User:userId}).sort({Date: -1}).populate('Products.Product')
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