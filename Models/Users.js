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
    Orders: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    }]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;