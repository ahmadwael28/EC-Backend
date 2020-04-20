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
const ShoppingCartRepo=require('../Repositories/ShoppingCartRepository');
const ProductsRepo=require('../Repositories/ProductsRepository');
const OrdersRepo=require('../Repositories/OrderRepository');
const UserRepo=require('../Repositories/UserRepository');

const router = express.Router();


//get shopping cart
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
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
router.get('/:userId/Products', async (req, res) => {
    const { userId } = req.params;
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

//increase product quantity in shopping cart
router.patch('/:userId/UpdateProduct/:productId/inc', async (req, res) => {
    //Step1: ValidateId
    let { userId } = req.params;
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
router.patch('/:userId/UpdateProduct/:productId/dec', async (req, res) => {
    //Step1: ValidateId
    let { userId } = req.params;
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

//reset the shopping cart and set the order
router.get('/:userId/Checkout', async (req, res) => {
    let { userId } = req.params;
    let { error } = validateObjectId(userId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid user Id');
    }
    shoppingCart =await ShoppingCartRepo.getShoppingCartProductsByUserId(userId);

    if (!shoppingCart) {
        return res.status(404).send('Shopping cart resource not found!');
    }
    console.log('ShoppingCart TP:', shoppingCart.TotalPrice);
    console.log("shoppingcart",shoppingCart);
    let order = {
        User: userId,
        Products: shoppingCart.Products
    };

    //checking if any of the products in order is deleted
    // for (let i = 0; i < order.Products.length; i++) {
    //     //console.log("Product in order:", order.Products[i].Product);
    //     var product = await Product.findOne({ _id: order.Products[i].Product });
    //     //console.log("Product:", product);
    //     //console.log("Net Price:", product.NetPrice);
    //     if (product) {
    //         if(product.IsDeleted)
    //         {
    //             order.Products.splice(i, 1);
    //             i--;
    //         }
    //         else if(product.UnitsInStock >= order.Products[i].Quantity)
    //         {
    //             product.UnitsInStock -= order.Products[i].Quantity;
    //         }
    //         else
    //         {
    //             //console.log("out of stock");
    //             order.Products.splice(i, 1);
    //             i--;
    //         }
    //     }
    // }

    console.log("shopping cart products",shoppingCart.Products);
     order=await OrdersRepo.addOrder(order);
     order=await ProductsRepo.removeIsDeletedProducts(order);


    //console.log(order.Products)
    order = await order.save();
    order = await OrdersRepo.getOrderById(order._id);
    //Order.findById(order._id).populate('Products.Product');

    //console.log("order is created", order);

    //reset the shopping cart
     await ShoppingCartRepo.ResetShoppingCart(shoppingCart);

    let productsInOrder = order.Products;


    //to update the Orders array (OrderId) for each  product
    // for (let i = 0; i < productsInOrder.length; i++) {
    //     //console.log(productsInOrder[i]);
    //     var product = await Product.findOne({ "_id": productsInOrder[i].Product });

    //     if (product) {
    //         product.Orders.push({ "OrderId": order._id })
    //         await Product.updateOne({ "_id": product._id }, { $set: product });
    //     }
    // }

    OrdersRepo.notifyProductsOfOrders(productsInOrder);

    //console.log("Order Id:", order._id);
    user = await UserRepo.notifyUserOfOrders(order);
    user = await UserRepo.UpdateUser(userId,user);
    //User.findByIdAndUpdate(userId, user).populate('Orders.id').populate('ShoppingCart');
    //console.log(order.TotalPrice);
    res.status(200).send(user);
});

//remove product from shopping cart
router.delete('/:userId/RemoveProduct/:productId', async (req, res) => {
    let { userId, productId } = req.params;
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
router.patch('/:userId/AddProduct', async (req, res) => {
    let { userId } = req.params;
    let { error } = validateObjectId(userId);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid user ID');
    }
    let shoppingCart = await ShoppingCart.findOne({ User: userId }).populate('Products.Product');
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