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


//insert cart for testing
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


module.exports = router;