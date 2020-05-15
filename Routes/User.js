const express = require('express');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const SECRET_KEY = require('../config');
const AuthorizationMiddleware = require('middlewares/authorization');

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
const UserRepo = require('../Repositories/UserRepository');
const ShoppingCartRepo = require('../Repositories/ShoppingCartRepository');

const router = express.Router();

//when to be used??
//even the admin hasn't the feature of seeing all users
router.get('/', async (req, res) => {
    const Users = await UserRepo.GetAllUsers();
    res.send(Users);
});
//validation on username if already exists
//not tested through fiddler
router.get('/ValidateUsername/:username', async (req, res) => {
    let { username } = req.params;
    if(username == null)
      return res.status(400).send("Username is not sent");
   
    value = await UserRepo.CheckIfUsernameExists(username) ;
    res.status(200).send({'exists':value});
});
//validation on email if already exists
//not tested through fiddler
router.get('/ValidateEmail/:email', async (req, res) => {
    let { email } = req.params;
    if(email == null)
      return res.status(400).send("Email is not sent");
    value = await UserRepo.CheckIfEmailExists(email) ;
    res.status(200).send({'exists':value});
});
//post new user with his new shopping cart
//not tested through fiddler
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

    console.log("After Hash", user);
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
    console.log("FullName",user.FullName);
    res.status(201).send(user);
});

///tessssssssssssst multer
//not tested through fiddler
router.post('/upload', upload.single('photo'), (req, res) => {
    console.log("upload");
    if (req.file) {
        console.log('File is Available!');
        console.log(req.file);
        const targetPath = path.join(path.dirname(__dirname), "./uploads/images");
        req.file.path = targetPath
        //req.file.filename = `${req.file.filename}.png`;
        console.log(targetPath);
        res.json(req.file);
    }
    else throw 'error';
});


//update user info
router.patch('/UpdateUser',AuthorizationMiddleware.verifyToken, async (req, res) => {
    //step 1: validate id
    console.log("Routes UserInfo in update user",req.user);
    let  id  = req.user.id;
    console.log("Routes UserInfo id",id);

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

    //user = await UserRepo.UpdateUser(id, ...req.body);  //here there is a problemm!!!
    user = await UserRepo.UpdateUser(id,req.body);

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
router.get('/User/Orders',AuthorizationMiddleware.verifyToken, async (req, res) => {
    console.log("Routes UserInfo",req.user);
    const  userId  = req.user.id;
    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validation")
        return res.status(400).send('Invalid user Id');
    }

    let user = await GetUserById(userId);
    //user.Orders = user.Orders.filter(o=>o.status=="Accepted" || o.status=="Pending")
    res.status(200).send(user.Orders);
});

//get user by token
router.get('/UserToken', AuthorizationMiddleware.verifyToken,async (req, res) => {
    console.log("Routes UserInfo in get user by token",req.user);
    const  userId  = req.user.id;
    console.log("Routes UserInfo userId",userId);

    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validation")
        return res.status(400).send('Invalid user Id');
    }

    let user = await UserRepo.GetUserByIdWithShoppingCart(userId);

    res.status(200).send(user);
});

//get specific order by id in  User's Orders
router.get('/User/Orders/:orderId',AuthorizationMiddleware.verifyToken, async (req, res) => {
    console.log("Routes UserInfo",req.user);
    const  userId  = req.user.id;
    const { orderId } = req.params;
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
router.delete('/DeleteUser',AuthorizationMiddleware.verifyToken, async (req, res) => {
    //step 1: validate id
    console.log("Routes UserInfo",req.user);
    let { id } =req.user.id;
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

//Signing In a user
router.post('/Login', async (req, res) => {
    console.log("server is hit");
    const email = req.body.Email;
    const password = req.body.Password;
    let user = await UserRepo.GetUserByEmail(email);
    console.log("user",user);
    if (user!=null) {
        console.log("inside if");
        bcrypt.compare(password, user.Password, async (err, isMatched) => {
            if (isMatched) {
                console.log("isMatched");
                const payload = { id: user._id, email: user.Email, role: user.Role };//holds user info/details
                console.log("payload", payload);

                jwt.sign({ user: payload }, SECRET_KEY, { expiresIn: 36000 }, (err, token) => {
                    console.log("da5al henaaaaa");
                        if (err) 
                            console.log("Error",err.details);
                        if (token)
                        { 
                             console.log(" if (token)",token);
                            res.status(200).json({ mess: "Signed In Successfully", tokenCreated: token});
                            
                        }
                        else
                        {
                            console.log("else");

                             res.status(200).json("Valid Password But error occurred while creating token! ");
                        }
                    });


            }
            else {
                return res.status(400).send("Invalid Password!");
            }
        });
    }
    else {
        return res.status(404).send("User not found!")
    }

});

module.exports = router;