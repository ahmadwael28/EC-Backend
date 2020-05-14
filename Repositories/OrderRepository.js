
const Product = require('../Models/Products');
const User = require('../Models/Users');
const Order = require('../Models/Orders');
const Category = require('../Models/Categories');
const ProductsRepo=require('../Repositories/ProductsRepository');
const UserRepo=require('../Repositories/UserRepository');
var moment = require('moment');


module.exports =
{
    
    getAllOrders: async function ()
    {
        orders =  await Order.find({}).populate('Products.Product').populate('User');
        orders = orders.filter(o=>o.Status!='Canceled');
        console.log('Inside getAll Orders in order repo...');
        
        for(let i=0;i<orders.length;i++)
         {
             console.log("inside 1st loop",orders[i].Date)
             var str = new String(orders[i].Date);
             {}
             const date = moment(str);
             console.log("Moment...",moment(orders[i].Date.toString()).format("MM-DD-YYYY h hh"));
             console.log("Date",orders[i].toString().split("GMT")[0]);
             console.log("Date(before)",orders[i].Date.toString().split("GMT")[0]);
             //orders[i].Date = d;////moment(str,"MM-DD-YYYY");//.format('LLL'); // January 14th 2013 2:08 PM
             console.log("Date(after)",orders[i].Date);
             console.log(`Order Element Num ${i+1}`,orders[i]);
          
         }
           
      
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