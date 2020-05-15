
const jwt = require('./node_modules/jsonwebtoken');

const SECRET_KEY = require('../config');

const verifyToken = (req, res, next) => {
  
  const token =  req.headers['x-access-token'];
  if (!token) 
      return res.status(401).send({ auth: false, message: 'Unauthorized, No token provided.' });
      //must redirect to login page for products page
      console.log('token in middleware',token);
  jwt.verify( token, SECRET_KEY, ( err, decoded ) => {

    
    if ( err ) {
         res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
     
    }
    else {
        req.user = decoded.user;

        console.log("req.user",req.user); 
    }
    next();//go to next middleware

  });
}


module.exports = {
  verifyToken
};