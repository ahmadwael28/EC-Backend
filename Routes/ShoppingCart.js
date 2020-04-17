const express = require('express');

const Product = require('../Models/Products');
const Order = require('../Models/Orders');
const ShoppingCart = require('../Models/ShoppingCart');
const Category = require('../Models/Categories');
const validateProducts = require('../Helpers/validateProducts');
const validateOrders = require('../Helpers/validateOrders');
const validateShoppingCart = require('../Helpers/validateShoppingCart');
const validateObjectId = require('../Helpers/validateObjectId');

const router = express.Router();


//get shopping cart
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid user Id');
    }

    const shoppingCart = await ShoppingCart.find({User : userId}).populate('Products.Product');
    res.send(shoppingCart);
});


//get products in shopping cart
router.get('/:userId/Products', async (req, res) => {
    const { userId } = req.params;
    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid user Id');
    }

   // const shoppingCart = await ShoppingCart.find({User : userId})
   // .populate('Products.Product')
   const shoppingCart = await ShoppingCart.find({User : userId}).populate(
    {
        path: 'Products.Product',
        model: Product,
        populate: {
          path: 'Category',
          model: Category
        }
      }
   );
    res.send(shoppingCart.Products);
});
//update cart 
//PATCH orders/id
router.patch('/:userId', async (req, res) => {
    //Step1: ValidateId
    let { userId } = req.params;
    let { error } = validateObjectId(userId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid user Id');
    }
    shoppingCart = await ShoppingCart.findOne({User : userId}).populate('Products.Product');
    if (!shoppingCart) {
       
        return res.status(404).send('Shopping cart resource not found!');
    }
    console.log("Before update",shoppingCart);
    console.log(shoppingCart.User,shoppingCart.Products);
    shoppingCart.Products = [];//reset

    //shoppingCart = await shoppingCart.save();

    shoppingCart.Products=req.body;
   //shoppingCart.Products.push(...req.body);
    shoppingCart = await shoppingCart.save();
 
    console.log("After update",shoppingCart);
  

    res.status(200).send("Successfully Updated!");
});
//insert cart for testing
//#region
 router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { error } = validateObjectId(userId);
    if (error) {
        console.log("error in Id validatoin")
        return res.status(400).send('Invalid user Id');
    }

    // let shoppingCart = new ShoppingCart({
    //     User: userId,
    //     Products: [],
    //     TotalPrice:0
    // });

    // shoppingCart = await shoppingCart.save();
    // console.log("cart created")

    res.status(200).send(shoppingCart);
});
//#endregion



module.exports = router;