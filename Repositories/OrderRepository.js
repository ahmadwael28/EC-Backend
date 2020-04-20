
const Product = require('../Models/Products');
const User = require('../Models/Users');
const Order = require('../Models/Orders');
const Category = require('../Models/Categories');

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
    addOrder:async function(orderData)
    {
        let order = new Order({
            ...orderData
        });
        return order;

    },
    //ValidateProducts must be moved to ProductRepo
    removeIsDeletedProducts: async function(container)
    {
        console.log(container);
        for(let i = 0;i<container.Products.length;i++)
        {
            var product = await Product.findOne({ "_id": container.Products[i].Product});
            if(product && product.IsDeleted)
            {
                container.Products.splice(i, 1);
                i--;
            }

        }
        return container;
        
    },
    //Mapping Orders in Product Model must be moved to Product Repo
    AddOrderInProducts:async function(order)
    {
        for (let i = 0; i < order.Products.length; i++) {
            //console.log(order.Products[i]);
            var product = await Product.findOne({ "_id": order.Products[i].Product});

            if(product)
            {
                product.Orders.push({"OrderId":order._id})
                await Product.updateOne({"_id":product._id},{ $set: product });
            }
        }
    },
    //Mapping Orders in User Model must be moved to User Repo
    AddOrderInUser:async function(order)
    {
        user= await User.findById(order.User);
        user.Orders.push({"id":order._id});
        user = await user.save();
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