
const Product = require('../Models/Products');
const User = require('../Models/Users');
const Order = require('../Models/Orders');
const ShoppingCart = require('../Models/ShoppingCart');
const Category = require('../Models/Categories');

module.exports =
{
    
    getShoppingCartByUserId: async function (userId) {
        shoppingCart = await ShoppingCart.findOne({ User: userId }).populate(
            {
                path: 'Products.Product',
                model: Product,
                populate: {
                    path: 'Category',
                    model: Category
                }
            }
        );
        console.log("Repo", shoppingCart);
        return await shoppingCart;
    },
    getShoppingCartProductsByUserId: async function (userId) {
        shoppingCart = await ShoppingCart.findOne({ User: userId }).populate('Products.Product');
        console.log("Repo", shoppingCart.Products);
        return await shoppingCart;
    },
    ResetShoppingCart: async function (shoppingCart) {
        shoppingCart.Products = [];
        shoppingCart = await shoppingCart.save();
    },
}
