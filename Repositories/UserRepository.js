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


    UpdateUser :async function(Id,obj) {

        return await User.findByIdAndUpdate(Id, { ...req.body }, { new: true });
    },
}