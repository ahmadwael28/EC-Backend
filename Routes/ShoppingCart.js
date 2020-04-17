const express = require('express');

const Product = require('../Models/Products');
const User = require('../Models/Users');
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

    shoppingCart.Products=req.body;
    console.log("After Update",shoppingCart);
    for(let i = 0;i<shoppingCart.Products.length;i++)
    {
        console.log("ProductShoppingCart:",shoppingCart.Products[i].Product);
        var product = await Product.findOne({_id:shoppingCart.Products[i].Product});
        console.log("Product:",product);
        console.log("Net Price:",product.NetPrice);
        if( product && product.IsDeleted)
        {
            shoppingCart.Products.splice(i, 1);
            i--;
        }

    }

    shoppingCart = await shoppingCart.save();
 
    console.log("After update",shoppingCart);
  

    res.status(200).send("Successfully Updated!");
});

//reset the shopping cart and set the order
router.get('/:userId/Checkout',async (req,res)=>{
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
    console.log('ShoppingCart TP:',shoppingCart.TotalPrice);
    let order=new Order({
        User:userId,
        Products:shoppingCart.Products
    });
    console.log(order.Products)
    order = await order.save();
    order = await Order.findById(order._id).populate('Products.Product');
   
    console.log("order is created", order);
   
    //reset the shopping cart
    shoppingCart.Products = [];
    shoppingCart = await shoppingCart.save();

    let productsInOrder = order.Products;

    //to update the Orders array (OrderId) for each  product
    for (let i = 0; i < productsInOrder.length; i++) {
        console.log(productsInOrder[i]);
        var product = await Product.findOne({ "_id": productsInOrder[i].Product});

        if(product)
        {
            product.Orders.push({"OrderId":order._id})
            await Product.updateOne({"_id":product._id},{ $set: product });
        }
    }
    console.log("Order Id:",order._id);
    user= await User.findById(userId).populate('Orders.id').populate('ShoppingCart');
    user.Orders.push({"id":order._id});
    user = await User.findByIdAndUpdate(userId,user).populate('Orders.id').populate('ShoppingCart');
    console.log(order.TotalPrice);
    res.status(200).send(user);
});

//remove product from shopping cart
router.delete('/:userId/RemoveProduct/:productId',async(req,res)=>{
    let { userId,productId } = req.params;
    let { userIderror } = validateObjectId(userId);
    let { productIderror } = validateObjectId(productId);
    if (userIderror || productIderror) {
        console.log(userIderror.details);
        return res.status(400).send('Invalid Ids');
    }
    shoppingCart=await ShoppingCart.findOne({User : userId}).populate('Products.Product');
    shoppingCart.Products=shoppingCart.Products.filter(element=>element.Product._id!=productId);
    shoppingCart=await shoppingCart.save();
    res.status(200).send(shoppingCart);
});

//add product to cart
router.patch('/:userId/AddProduct',async(req,res)=>{
    let { userId } = req.params;
    let { error} = validateObjectId(userId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid user ID');
    }
    let shoppingCart = await ShoppingCart.findOne({User: userId}).populate('Products.Product');
    shoppingCart.Products.push(req.body);
    shoppingCart = await shoppingCart.save();
    res.status(200).send(shoppingCart);

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