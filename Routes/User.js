const express = require('express');

const Order = require('../Models/Orders');
const User = require('../Models/Users');
const ShoppingCart = require('../Models/ShoppingCart');
const validateUsers = require('../Helpers/valitadeUsers');
const validateObjectId = require('../Helpers/validateObjectId');
let fs = require('fs-extra');

const multer = require('multer');
//const upload = multer({dest: __dirname + '/uploads/images'});

let upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, callback) => {
        let type = req.params.type;
        let path = `./uploads/images`;
        fs.mkdirsSync(path);
        callback(null, path);
      },
      filename: (req, file, callback) => {
        //originalname is the uploaded file's name with extn
        callback(null, file.originalname);
      }
    })
  });

const path = require("path");
const UserRepo=require('../Repositories/UserRepository');
const ShoppingCartRepo=require('../Repositories/ShoppingCartRepository');

const router = express.Router();

router.get('/', async (req, res) => {
    const Users = await UserRepo.GetAllUsers();
    res.send(Users);
});

//post new user with his new shopping cart
router.post('/', async (req, res) => {
    console.log("Post user")
    const { error } = validateUsers(req.body);
    if (error) {
        console.log(error.details);
        return res.status(400).send(error.details);
    }

    let user = new User({
        ...req.body
    });

    user = await UserRepo.SaveUser(user);

    let shoppingCart = new ShoppingCart({
        User: user._id,
        Products: [],
        TotalPrice: 0
    });

    //need to be added to shopping cart repo
    shoppingCart = await shoppingCart.save();
    console.log("cart created");
    console.log(shoppingCart);


    user.ShoppingCart = shoppingCart._id;
    user = await UserRepo.SaveUser(user);
    res.status(201).send(user);
});

///tessssssssssssst multer
router.post('/upload', upload.single('photo'), (req, res) => {
    console.log("upload");
    if(req.file) {
        const targetPath = path.join(path.dirname(__dirname), "./uploads/images");
        req.file.path = targetPath
        req.file.filename = `${ req.file.filename}.png`;
        console.log(targetPath);
        res.json(req.file);
    }
    else throw 'error';
});


//update user info
router.patch('/:id', async (req, res) => {
    //step 1: validate id
    let { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log(error.details);
        console.log("error.details");

        return res.status(400).send('Invalid UserID');
    }

    let user = await UserRepo.GetUserById(id);

    if (user == null) {
        return res.status(404).send('UserID not found');
    }

    user = await UpdateUser(id,...req.body);

    let ordersOfUser = await user.Orders;

    for (let i = 0; i < ordersOfUser.length; i++) {
        //Order Repo needed
        var obj = await Order.findOne({ "_id": ordersOfUser[i].id, "Users.id": user._id });
        if (obj == null) {
            await Order.findByIdAndUpdate(ordersOfUser[i].id, { $push: { "Users": user._id } });
        }
        ///////////////////
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

    let user = await GetUserById(userId);
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

    let user = await UserRepo.GetUserByIdWithShoppingCart(userId);

    res.status(200).send(user);
});

//get specific order by id in  User's Orders
router.get('/:userId/Orders/:orderId', async (req, res) => {
    const { userId, orderId } = req.params;
    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validation")
        return res.status(400).send('Invalid user Id');
    }
    console.log("Order Id :", orderId);

    let user = await UserRepo.GetUserById(userId);
    
    var orderExists = user.Orders.find(o => o.id == orderId);//check status or not??
    console.log("OrderExists:", orderExists);
    if (orderExists) {
        //Order repo
        let order = await Order.findOne({ "_id": orderId }).populate('Products.Product');
        console.log('Order Resource is found', order);
        res.status(200).send(order);
    }
    else
        res.status(404).send("Order resource is not found!");

});

//delete user
router.delete('/:id', async (req, res) => {
    //step 1: validate id
    let { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        return res.status(400).send('Invalid UserID');
    }
    let user = await GetUserById(id);

    if (user == null) {
        return res.status(404).send('UserID not found');
    }
    user.IsDeleted = true;
    user = await UserRepo.SaveUser(user);

    console.log("User is Successfully Deleted");
    res.send(user);
});

module.exports = router;