const express = require('express');

const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const validateCategories = require('../Helpers/validateCategories');
const validateObjectId = require('../Helpers/validateObjectId');


const router = express.Router();

router.get('/', async (req, res) => {
    const Categories = await Category.find({});
    res.send(Categories);
});

router.post('/', async (req, res) => {
    console.log("Post category")
    const { error } = validateCategories(req.body);
    if (error) {
        return res.status(400).send("8alat ya zeft" + error.details);
    }

    let category = new Category({
        ...req.body
    });

    category = await category.save();

    res.send(category);
});

//should be updated to "Update categoy name"
router.patch('/:id',async (req,res)=>{
    const { id } = req.params;
    const { error } = validateObjectId(id);
    if (error) {
        console.log(error.details);
        return res.status(400).send('Invalid category Id');
    }
    let category = await Category.findById(id);
    if(!category)
    {
        return res.status(404).send('Category resource is not found!');
    }
    category = await Category.findById(id).populate('Products.productId');
    category.Products = req.body;
    category = await category.save();
    // for(let i = 0;i<category.Products.length;i++)
    // {
    //     var product = await Product.findOne({ "_id": category.Products[i].productId});
    //     if(product && product.IsDeleted)
    //     {
    //          category.Products.splice(i, 1);
    //          i--;
    //     }

    // }
    category = await category.save();

   
    //Modify Products' Category in Product Model
    let productsInCategory = category.Products;//Products [] 

    for (let i = 0; i < productsInCategory.length; i++) {
        console.log(productsInCategory[i]);
        var product = await Product.findOne({ "_id": productsInCategory[i].productId});

        if(product)
        {
        //    product.Category = category._id;//mapping
        //     product = await product.save();
            product = await Product.findByIdAndUpdate(product._id,{'Category':category._id});
        }
    }
    category = await Category.findById(category._id).populate('Products.productId');
    res.status(200).send(category);

})
module.exports = router;