const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    Name: {
        type: String,
        required: true,
    },
    Description:{
        type: String,
        required:true,
    },
    Price:{
        type:Number,
        required:true
    },
    Promotion:{
        type:Number,
        required:true
    },

    // NetPrice:{
    //     type:Number
    // },

    UnitsInStock:{
        type:Number,
        required:true
    },
    NSales:{
        type:Number,
        required:true
    },
    Image:{
        type:String,
        required:true,
        default:"default.jpg"
        },

    IsDeleted:{
        type:Boolean,
        required:true,
        default:false
    },
   
    Orders: [
        {
        id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
        }
    }],
},{ getters: true });

ProductSchema.virtual('NetPrice').
    get(function(){return this.Price - (this.Price * (this.Promotion/100))});


const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;