const mongoose = require('mongoose');

const ShoppingCartSchema = new mongoose.Schema({
    
    User: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    Products: [{
        Product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        Quantity: {
            type: Number,
            required: true
        }
    }]

},{ getters: true });

ShoppingCartSchema.virtual('TotalPrice').
    get(function(){
        var Total = 0;
        this.Products.forEach(element => {
            Total += element.Product.NetPrice * element.Quantity;
        });

        return Total
    });


const ShoppingCart = mongoose.model('ShoppingCart', ShoppingCartSchema);

module.exports = ShoppingCart;