const express = require('express');

const Order = require('../Models/Orders');
const Product = require('../Models/Products');
const validateOrders = require('../Helpers/validateOrders');

const router = express.Router();

router.get('/', async (req, res) => {
    const Orders = await Order.find({}).populate('Products.Product');
    console.log(Orders[0].TotalPrice)
    res.send(Orders);
});

router.post('/', async (req, res) => {
    console.log("Post orders")
    const { error } = validateOrders(req.body);
    if (error) {
        console.log(error.details);
        return res.status(400).send("8alat ya zeft" + error.details);
    }

    let order = new Order({
        ...req.body
    });

    order = await order.save();

    res.send(order);
});
//PATCH orders/id
router.patch('/:id',async (req,res)=>{
    //Step1: ValidateId
       let {id} = req.params;
       let  {error} = validateObjectId(id);
       if(error)
       {
        console.log(error.details);
           return res.status(400).send('Invalid id');
       }
       let order = await Order.findById(id);
       if(order== null)
       {
            console.log(error.details);
           return res.status(404).send('Order resource not found!');
       }
       order = await Order.findByIdAndUpdate(id,{
           ...req.body
       }
       ,
       {
             new:true
       })
       
       res.send(order).send("Successfully Updated!");
    });
    // DELETE orders/id
    router.delete('/:id',async (req,res)=> {
    
       let {id} = req.params;
       let  {error} = validateObjectId(id);
       if(error)
       {
           
           return res.status(400).send('Invalid id');
       }
       let order = await Order.findById(id);
       if(order== null)
       {
           return res.status(404).send('Order resource not found!');
       }
       order = await Order.findByIdAndDelete(id);
      
        let products = await Product.find({'Orders.id': id});
    
       for (let i=0;i<products.length;i++)
       {
           await Product.findByIdAndDelete(products[i]._id);
       }
    
       res.redirect('localhost:3000/orders/');
    })
    

module.exports = router;