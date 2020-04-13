const express = require('express');

const Order = require('../Models/Orders');
const User = require('../Models/Users');
const validateUsers = require('../Helpers/valitadeUsers');

const router = express.Router();

router.get('/', async (req, res) => {
    const Users = await User.find({});
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
    const {error}=validateUsers(id);
    if(error){
        return res.status(400).send('Invalid UserID');
    }

    let user=await User.findById(req.params.id);

    if(user==null){
        return res.status(404).send('UserID not found');
    }
    user=await User.updateOne({"_id":req.params.id},{$set:req.body});
    //user=await User.findByIdAndUpdate(id,{...req.body},{new:true});
    res.send(user);
});
module.exports = router;