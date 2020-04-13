const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    
    CategoryName:{
        type:String,
        required:true
    },

    Products: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    }]
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;