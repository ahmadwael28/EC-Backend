const Category = require('../Models/Categories');

module.exports =
{

     GetCategoryById :async function(id) {

        return await Category.findById(id)
    },

    SaveCategory: async function(category) {
        return await category.save();
    },
}
