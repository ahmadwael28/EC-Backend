const express = require('express');

const Order = require('../Models/Orders');
const User = require('../Models/Users');
const ShoppingCart=require('../Models/ShoppingCart');
const validateUsers = require('../Helpers/valitadeUsers');
const validateObjectId = require('../Helpers/validateObjectId');

const router = express.Router();

router.get('/', async (req, res) => {
    const Users = await User.find({}).populate('Orders.id');
    res.send(Users);
});

//post new user with his new shopping cart
router.post('/', async (req, res) => {
    console.log("Post user")
    const { error } = validateUsers(req.body);
    if (error) {
        console.log(error.details);
        return res.status(400).send("8alat ya zeft" + error.details);
    }

    let user = new User({
        ...req.body
    });
    user = await user.save();

    let shoppingCart = new ShoppingCart({
        User: user._id,
        Products: [],
        TotalPrice:0
    });

    shoppingCart = await shoppingCart.save();
    console.log("cart created");
    console.log(shoppingCart);

    
    user.ShoppingCart=shoppingCart._id;
    user = await user.save();
    res.status(201).send(user);
});
router.patch('/:id',async (req,res)=>{
    //step 1: validate id
    let {id}=req.params;
    const {error}=validateObjectId(id);
    if(error){
        console.log(error.details);
        console.log("error.details");

        return res.status(400).send('Invalid UserID');
    }

    let user=await User.findById(req.params.id);

    if(user==null){
        return res.status(404).send('UserID not found');
    }

    user=await User.findByIdAndUpdate(id,{...req.body},{new:true});
    
    let ordersOfUser= await user.Orders;

    for(let i=0;i<ordersOfUser.length;i++)
    {
      var obj = await Order.findOne({"_id":ordersOfUser[i].id,"Users.id":user._id});
      if(obj==null)
      {
          await Order.findByIdAndUpdate(ordersOfUser[i].id,{$push:{"Users":user._id}});
      }
    }
    //user=await User.updateOne({"_id":req.params.id},{$set:req.body});
    console.log("User is Successfully Updated");
   res.send(user);
});
//get user's orders (view history)
router.get('/:userId/Orders', async (req, res) => {
    const { userId } = req.params;
    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validation")
        return res.status(400).send('Invalid user Id');
    }

    let user = await User.findById(userId).populate('Orders.id');
    //user.Orders = user.Orders.filter(o=>o.status=="Accepted" || o.status=="Pending")
    res.status(200).send(user.Orders);
});
//get user by id
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validation")
        return res.status(400).send('Invalid user Id');
    }

    let user = await User.findById(userId).populate('Orders.id').populate('ShoppingCart');
   
    res.status(200).send(user);
});
//get specific order by id in  User's Orders
router.get('/:userId/Orders/:orderId', async (req, res) => {
    const { userId,orderId } = req.params;
    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validation")
        return res.status(400).send('Invalid user Id');
    }
    console.log("Order Id :",orderId);
    let user = await User.findById(userId);
    var orderExists = user.Orders.find(o=>o.id==orderId);//check status or not??
    console.log("OrderExists:",orderExists);
    if(orderExists)
    {
        let order = await Order.findOne({"_id":orderId}).populate('Products.Product');
        console.log('Order Resource is found',order);
        res.status(200).send(order);
    }
    else
          res.status(404).send("Order resource is not found!");
  
});
// router.delete('/:id',async (req,res)=>{
//     //step 1: validate id
//     let {id}=req.params;
//     const {error}=validateObjectId(id);
//     if(error){
//         return res.status(400).send('Invalid UserID');
//     }
//     let user=await User.findById(id);

//    if(user==null){
//        return res.status(404).send('UserID not found');
//    }
//    user=await User.findByIdAndDelete(id);

//    let orders= await Order.find({'User':user});

//     for(let i=0;i<orders.length;i++)
//     {
//         await Order.findByIdAndDelete(orders[i]._id);
//     }

//     console.log("User is Successfully Deleted");
//    res.send(user);
// });
module.exports = router;