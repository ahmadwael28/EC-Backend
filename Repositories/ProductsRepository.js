const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const Order = require('../Models/Orders');

module.exports={
    getAllProducts:async function(){
        return await Product.find({IsDeleted : false}).populate('Category');
    },
    getProductById:async function(productId){
        //return await Product.findById(productId).populate('Category').populate('Orders.OrderId');
        return await Product.findOne({_id:productId,IsDeleted : false}).populate('Category').populate('Orders.OrderId');
    },
    //should be moved to category repository?
    getProductsByCategoryId:async function (categoryId){
        //return await Product.find({Category : categoryId}).populate('Category').populate('Orders.OrderId');
        let category=await Category.findById(categoryId);
        category=await category.populate('Products.productId').execPopulate();
        console.log("Repo",category);
        //console.log("filter",await category.Products.filter(p=>p.IsDeleted==false));
        let products= category.Products.filter(p=>p.IsDeleted==false);
         category.Products.filter(p=> console.log(p.IsDeleted));

        console.log("Repo",products);
        return products;
    },
    getProductOrders:async function (productId){
        const product = await Product.findById(productId).populate('Category').populate('Orders.OrderId');
        return product.Orders;
    },
    //should it be moved to category repository?
    validateNewProductCategory:async function (product){
        let category=await Category.findById(product.Category);
        category.Products.push({"productId":product._id});
        category=await category.save();
        return category;
    },
    insertProduct:async function(data){
        
    let product = new Product({
        ...data
    });

    product = await product.save();
    return product;
    },
    deleteProduct:async function(product){
        product.IsDeleted = true;
        console.log("Repo",product);
        product=await Product.findByIdAndUpdate(product._id,product);
        //product= await Product.updateOne({"_id":product._id},{ $set: product });
        product=await product.save();
    },
    updateProduct:async function(currentProduct,updatedProduct){
        console.log("Repo currentProduct",currentProduct);
        console.log("Repo updatedProduct",updatedProduct);

        var currentCategory= currentProduct.Category;
        var newCategory= updatedProduct.Category;
        console.log("Repo currentProduct Id",currentProduct._id);

        console.log("Repo currentCategory",currentCategory._id);
        console.log("Repo newCategory",newCategory);

        var oldCategory=await Category.findById(currentCategory);
        console.log("Repo oldCategory",oldCategory);
        oldCategory.Products = oldCategory.Products.filter(p => p.productId.toString() != currentProduct._id.toString());
        oldCategory = await oldCategory.save();

        var newCategory = await Category.findById(newCategory);
        newCategory.Products.push({"productId":currentProduct._id})
        newCategory = await newCategory.save();

        return newCategory;
    },
     //ValidateProducts must be moved to ProductRepo
    removeIsDeletedProducts: async function(container)
    {
        //console.log(container);
        for(let i = 0;i<container.Products.length;i++)
        {
            var product = await Product.findOne({ "_id": container.Products[i].Product});
            if(product)
            {
                if(product.IsDeleted)
                {
                    container.Products.splice(i, 1);
                    i--;
                }
                else if (product.UnitsInStock >= container.Products[i].Quantity) {
                    product.UnitsInStock -= container.Products[i].Quantity;
                }
                else {
                    //console.log("out of stock");
                    container.Products.splice(i, 1);
                    i--;
                }
            }

        }
        return container;
        
    },
     //Should be invoked from Orders.js
    AddOrderInProducts:async function(order)
     {
         for (let i = 0; i < order.Products.length; i++) {
             //console.log(order.Products[i]);
             var product = await Product.findOne({ "_id": order.Products[i].Product});
 
             if(product)
             {
                 product.Orders.push({"OrderId":order._id})
                 await Product.updateOne({"_id":product._id},{ $set: product });
             }
         }
     }
}