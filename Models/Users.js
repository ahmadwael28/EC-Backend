const mongoose = require('mongoose');

const UserSchema =  new mongoose.Schema({

    Email:{
        type: String,
        required:true
    },
    Username:{
        type: String,
        required: true
    },
    Password:{
        type: String,
        required:true,
    },
    Image:{
        type:String,
        required:true,
        default:"default.jpg"
    },
    Gender:{
        type: String,
        required:true,
    },
    Role:{
        type:String,
        required:true,
        default:"User"
    },
    IsDeleted:{
        type:Boolean,
        default:false
    },
    Orders: [{
        id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
        }
    }],
    ShoppingCart: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default:mongoose.Types.ObjectId(),
        ref: 'ShoppingCart'
    },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;