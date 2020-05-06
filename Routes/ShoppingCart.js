const express = require('express');
const AuthorizationMiddleware = require('../middlewares/authorization');
const Product = require('../Models/Products');
const User = require('../Models/Users');
const Order = require('../Models/Orders');
const ShoppingCart = require('../Models/ShoppingCart');
const Category = require('../Models/Categories');
const validateProducts = require('../Helpers/validateProducts');
const validateOrders = require('../Helpers/validateOrders');
const validateShoppingCart = require('../Helpers/validateShoppingCart');
const validateObjectId = require('../Helpers/validateObjectId');
const ShoppingCartRepo=require('../Repositories/ShoppingCartRepository');
const ProductsRepo=require('../Repositories/ProductsRepository');
const OrdersRepo=require('../Repositories/OrderRepository');
const UserRepo=require('../Repositories/UserRepository');

const router = express.Router();


//get shopping cart
//DONE FOR TESTING
router.get('/UserShoppingCart',AuthorizationMiddleware.verifyToken, async (req, res) => {
    console.log("Routes UserShoppingCart",req.user);
    const  userId  = req.user.id;
    console.log("userId",userId);

    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid user Id');
    }

    const shoppingCart = await ShoppingCartRepo.getShoppingCartByUserId(userId);
    console.log("Routes",shoppingCart);
    if(shoppingCart)
    {
        res.send(shoppingCart);
    }
    else
    {
        res.status(404).send("Shopping Cart Not found")
    }
});

//get products in shopping cart
//DONE FOR TESTING
router.get('/Products/ByUserToken',AuthorizationMiddleware.verifyToken, async (req, res) => {
    console.log("Routes /Products/ByUserToken",req.user);

    const  userId  = req.user.id;
    console.log("userId",userId);

    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid user Id');
    }

    // const shoppingCart = await ShoppingCart.find({User : userId})
    // .populate('Products.Product')
    const shoppingCart = await ShoppingCartRepo.getShoppingCartByUserId(userId);
    console.log("Routes",shoppingCart);
    res.send(shoppingCart.Products);
});
//reset the shopping cart and set the order
//DONE FOR TESTING
router.get('/Products/ByUserToken/Checkout',AuthorizationMiddleware.verifyToken, async (req, res) => {
    console.log("Routes /Products/ByUserToken/Checkout",req.user);
    const  userId  = req.user.id;
    console.log("userId",userId);
    let { error } = validateObjectId(userId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid user Id');
    }
    shoppingCart =await ShoppingCartRepo.getShoppingCartProductsByUserId(userId);

    if (!shoppingCart) {
        return res.status(404).send('Shopping cart resource not found!');
    }

    let order = {
        User: userId,
        Products: shoppingCart.Products
    };

    order=await OrdersRepo.addOrder(order);
    order=await ProductsRepo.removeIsDeletedProducts(order);

    order = await order.save();
    order = await OrdersRepo.getOrderById(order._id);
    
    await ShoppingCartRepo.ResetShoppingCart(shoppingCart);

    OrdersRepo.notifyProductsOfOrders(order);

    user = await UserRepo.NotifyUserOfOrders(order);
    user = await UserRepo.UpdateUser(userId,user);

    res.status(200).send(user);
});
//increase product quantity in shopping cart
//DONE FOR TESTING
router.patch('/UpdateProduct/:productId/inc',AuthorizationMiddleware.verifyToken, async (req, res) => {
    //Step1: ValidateId
    console.log("Routes /UpdateProduct/:productId/inc",req.user);
    const  userId  = req.user.id;
    console.log("userId",userId);
    let { productId } = req.params;
    let { error } = validateObjectId(userId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid user Id');
    }
    shoppingCart = await ShoppingCartRepo.getShoppingCartByUserId(userId);
    if (!shoppingCart) {

        return res.status(404).send('Shopping cart resource not found!');
    }

    var product = shoppingCart.Products.find(elem=> elem.Product._id.toString() == productId.toString());

    if(product)
    {
        if(product.Product.UnitsInStock >= product.Quantity + 1)
        {
            product.Quantity += 1;
            shoppingCart = await shoppingCart.save();
        }
        else
        {
            return res.status(404).send('this product in out of stock!');
        }

    }
    else
    {
        return res.status(404).send('No such product in shopping cart!');
    }

    res.status(200).send("Successfully Updated!");
});

//decrease product quantity in shopping cart
//DONE FOR TESTING
router.patch('/UpdateProduct/:productId/dec',AuthorizationMiddleware.verifyToken, async (req, res) => {
    //Step1: ValidateId
    console.log("Routes /UpdateProduct/:productId/dec",req.user);
    const  userId  = req.user.id;
    console.log("userId",userId);
    let { productId } = req.params;
    let { error } = validateObjectId(userId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid user Id');
    }
    shoppingCart = await ShoppingCart.findOne({ User: userId }).populate('Products.Product');
    if (!shoppingCart) {

        return res.status(404).send('Shopping cart resource not found!');
    }

    var product = shoppingCart.Products.find(elem=> elem.Product._id.toString() == productId.toString());

    if(product)
    {
        if(product.Quantity -1 > 0)
        {
            product.Quantity -= 1;
            shoppingCart = await shoppingCart.save();
        }
        else
        {
            return res.status(404).send('cannot decrease product quantity less than 1!');
        }

    }
    else
    {
        return res.status(404).send('No such product in shopping cart!');
    }

    res.status(200).send(shoppingCart);
});

//remove product from shopping cart
//DONE FOR TESTING
router.delete('/RemoveProduct/:productId',AuthorizationMiddleware.verifyToken, async (req, res) => {
    console.log("Routes /RemoveProduct/:productId",req.user);
    const  userId  = req.user.id;
    console.log("userId",userId);
    let { productId } = req.params;
    let { userIderror } = validateObjectId(userId);
    let { productIderror } = validateObjectId(productId);
    if (userIderror || productIderror) {
        console.log(userIderror.details);
        return res.status(400).send('Invalid Ids');
    }
    shoppingCart = await ShoppingCart.findOne({ User: userId }).populate('Products.Product');
    shoppingCart.Products = shoppingCart.Products.filter(element => element.Product._id != productId);
    shoppingCart = await shoppingCart.save();
    res.status(200).send(shoppingCart);
});

//add product to cart
//DONE FOR TESTING
router.patch('/AddProduct', AuthorizationMiddleware.verifyToken ,async (req, res) => {
    console.log("Routes UserInfo",req.user);
    let  userId  = req.user.id;
    let { error } = validateObjectId(userId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid user ID');
    }
    console.log("Routes UserID",userId);
    let shoppingCart = await ShoppingCart.findOne({ User: userId }).populate('Products.Product');
    console.log("Routes", shoppingCart);
    //check req.body type
    //check if body is an object and contains needed properties or not

    var product = await Product.findOne({ _id: req.body.Product });

    if (product && !product.IsDeleted) {

        let obj =  shoppingCart.Products.find(elem=> elem.Product._id.toString() == product._id.toString());
        if (obj == undefined) {
            shoppingCart.Products.push(req.body);
            shoppingCart = await shoppingCart.save();
            res.status(200).send(shoppingCart);
        }
        else
        {
            res.status(400).send("Product already Exists in shopping cart")
        }
    }
    else {
        res.status(400).send("Product doesnot exist")
    }


});







//insert cart for testing
//#region
// router.post('/:userId', async (req, res) => {
//     const { userId } = req.params;
//     const { error } = validateObjectId(userId);
//     if (error) {
//         console.log("error in Id validatoin")
//         return res.status(400).send('Invalid user Id');
//     }

//     res.status(200).send(shoppingCart);
// });
//#endregion



module.exports = router;