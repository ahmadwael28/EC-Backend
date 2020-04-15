const express = require('express');

const Order = require('../Models/Orders');
const User = require('../Models/Users');
const validateUsers = require('../Helpers/valitadeUsers');
const validateObjectId = require('../Helpers/validateObjectId');

const router = express.Router();

router.get('/', async (req, res) => {
    const Users = await User.find({}).populate('Orders.id');
    res.send(Users);
});

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

    res.send(user);
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