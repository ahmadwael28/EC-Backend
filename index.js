const express = require('express');
const mongoose = require('mongoose');

const CategoriesRouter = require('./Routes/Category');
const UsersRouter = require('./Routes/User');
const ProductsRouter = require('./Routes/Products');
const OrdersRouter = require('./Routes/Orders');
const ShoppingCartRouter = require('./Routes/ShoppingCart');

var cors = require('cors')


const app = express();

const mongoURL = process.env.MONGO_URL || 'mongodb+srv://ahmadwael28:qwertz91@flybuydb-13pev.mongodb.net/test?retryWrites=true&w=majority';
const port = process.env.PORT || 3000;

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:false
})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.log('Failed to connect to Mongodb,', err.message));
    
app.use(cors());
app.use('/static',express.static('./uploads/images'));
app.use(express.json());
app.use(express.urlencoded());//for form req body

 app.use('/Categories', CategoriesRouter);
 app.use('/Users', UsersRouter);
 app.use('/Products', ProductsRouter);
 app.use('/Orders', OrdersRouter);
 app.use('/ShoppingCarts',ShoppingCartRouter)

 


app.listen(port, () => console.log(`Server listens on port ${port}`));