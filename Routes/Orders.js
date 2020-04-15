const express = require('express');

const Order = require('../Models/Orders');
const Product = require('../Models/Products');
const validateOrders = require('../Helpers/validateOrders');
const validateObjectId = require('../Helpers/validateObjectId');


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
       console.log(order._id);
      let productsInOrder = order.Products;

      for(let i=0;i<productsInOrder.length;i++)
      {
          console.log(productsInOrder[i]);
           var obj =  await Product.findOne({"_id":productsInOrder[i].Product,"Orders.id":order._id});
           if(obj==null)
           {
             await Product.findByIdAndUpdate(productsInOrder[i].Product, {$push: {"Orders": order._id}} );
             console.log(`"inside if"${order._id}`);
           } 
      }
       
       res.send("Successfully Updated!");
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
     console.log(products);
     for (let i=0;i<products.length;i++)
     {
         Product.findByIdAndUpdate(
            products[i]._id,
            { $pull: { 'Orders': {  id: order._id } } },function(err,model){
                if(err)
                {
                    console.log(err);
                    res.send(err);
                }
                   res.json(model);
            });
            
     }
    
        
     
       res.send("Successfully Deleted!");

    })
    

module.exports = router;