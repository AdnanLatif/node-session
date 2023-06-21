const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Get user's cart
router.get('/', authenticateUser, cartController.getUserCart);

// Add a product to the cart
router.post('/', authenticateUser, cartController.addProductToCart);

// Update the quantity of a product in the cart
router.put(
  '/:productId',
  authenticateUser,
  cartController.updateProductQuantity
);

// Remove a product from the cart
router.delete(
  '/:productId',
  authenticateUser,
  cartController.removeProductFromCart
);

module.exports = router;
