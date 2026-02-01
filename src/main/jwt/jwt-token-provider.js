const jwt = require('jsonwebtoken');
const Exception = require('../exceptions/exception');

const secretKey = process.env.JWT_SECRETKEY;

const generateToken = (admin) => {
  return jwt.sign({ id: admin.phoneNumber }, secretKey, { expiresIn: '3h' });
};

const verifyToken = (token) => {
  try {
    jwt.verify(token, secretKey);
  } catch (error) {
    throw new Exception('AuthenticationException', 'Invalid token');
  }
};

module.exports = { generateToken, verifyToken };


