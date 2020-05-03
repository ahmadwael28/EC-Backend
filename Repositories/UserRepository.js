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

    GetUserByEmail : async function(email)
    {
         return await User.findOne({Email:email}).populate('Orders.id').populate('ShoppingCart');
    },
    CheckIfUsernameExists : async function(username)
    {
          const user = await User.findOne({Username: new RegExp('^'+username+'$', "i")});
          if(user == null)
             return false;
          return true;
    },
    CheckIfEmailExists : async function(email)
    {
          const user = await User.findOne({Email: email});
          if(user == null)
             return false;
          return true;
    },
    NotifyUserOfOrders : async function(order)
    {
        var user = await User.findById(order.User).populate('Orders.id');
        if(user)
            user.Orders.push({"id":order._id});
        return user;
    }
}