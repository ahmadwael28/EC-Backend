const Order = require('../Models/Orders');
const User = require('../Models/Users');
const ShoppingCart = require('../Models/ShoppingCart');



module.exports =
{

     GetAllUsers :async function() {

        return await User.find({}).populate('Orders.id');
    },

    SaveUser: async function(user) {
    
      
        return await user.save();
    },

    GetUserById :async function(Id) {

        return await User.findById(Id).populate('Orders.id');
    },

    GetUserByIdWithShoppingCart :async function(Id) {

        return await User.findById(Id).populate('Orders.id').populate('ShoppingCart');
    },

    AddOrderInUser:async function(order)
    {
        user= await User.findById(order.User);
        user.Orders.push({"id":order._id});
        user = await user.save();
        return user;
    },

    UpdateUser :async function(Id,obj) {

        return await User.findByIdAndUpdate(Id, obj, { new: true }).populate('Orders.id').populate('ShoppingCart');
    },

    GetUserByUsername : async function(username)
    {
         return await User.findOne({Username:username}).populate('Orders.id').populate('ShoppingCart');
    },

    NotifyUserOfOrders : async function(order)
    {
        var user = await User.findById(order.User).populate('Orders.id');
        if(user)
            user.Orders.push({"id":order._id});
        return user;
    }
}