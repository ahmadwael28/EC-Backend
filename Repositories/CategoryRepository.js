const Category = require('../Models/Categories');

module.exports =
{

     GetCategoryById :async function(id) {

        return await Category.findById(id)
    },

    SaveCategory: async function(category) {
        return await category.save();
    },
    GetAllProductsInCategory: async function(id) {
        var category = await Category.findById(id).populate('Products.productId');
        if(category)
            return await category.Products.filter(p => p.productId.IsDeleted == false);
        else
            return [];
    }
}
