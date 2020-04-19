
const Product = require('../Models/Products');
const User = require('../Models/Users');
const Order = require('../Models/Orders');
const ShoppingCart = require('../Models/ShoppingCart');
const Category = require('../Models/Categories');

module.exports =
{
    
getShoppingCartByUserId: async function (userId)
{
    return await ShoppingCart.find({ User: userId }).populate('Products.Product');
},

getProductsInShoppingCartByUserId: async function (userId)
{
    const shoppingCart = await ShoppingCart.findOne({ User: userId }).populate(
        {
            path: 'Products.Product',
            model: Product,
            populate: {
                path: 'Category',
                model: Category
            }
        }
    );
    console.log("Repo",shoppingCart);
    return shoppingCart.Products;
},


}