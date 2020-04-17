const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    
    User: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    Date: {
        type: Date,
        required: true,
        default:Date.now()
    },
    Status:{
        type:String,
        required:true,
        default:"Pending"
    },
    // TotalPrice:{
    //     type:Number,
    // },
    // Products: [{
    //     Product:{
    //         type: mongoose.Schema.Types.ObjectId,
    //         required: true,
    //         ref: 'Product'
    //     }
    // }],

    // Quantities:[{
    //     Quantity:{
    //         type:Number,
    //         required:true
    //     }
    // }]



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

OrderSchema.virtual('TotalPrice').
    get(function(){
        var Total = 0;
        this.Products.forEach(element => {
            console.log("Product:",element.Product);
            console.log("NP:",element.Product.NetPrice);
            console.log("Quantity:",element.Quantity);
            Total += element.Product.NetPrice * element.Quantity;
            console.log(Total);
        });

        return Total
    });


const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;