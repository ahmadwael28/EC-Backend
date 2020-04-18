const express = require('express');
const mongoose = require('mongoose');

const CategoriesRouter = require('./Routes/Category');
const UsersRouter = require('./Routes/User');
const ProductsRouter = require('./Routes/Products');
const OrdersRouter = require('./Routes/Orders');
const ShoppingCartRouter = require('./Routes/ShoppingCart');

const app = express();

const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/E-commerce-DB';
const port = process.env.PORT || 3000;

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:false
})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.log('Failed to connect to Mongodb,', err.message));

app.use(express.json());

 app.use('/Categories', CategoriesRouter);
 app.use('/Users', UsersRouter);
 app.use('/Products', ProductsRouter);
 app.use('/Orders', OrdersRouter);
 app.use('/ShoppingCarts',ShoppingCartRouter)

 


app.listen(port, () => console.log(`Server listens on port ${port}`));