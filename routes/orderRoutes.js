const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {
  authenticateUser,
  authorizeUser,
} = require('../middleware/authMiddleware');

// Place an order
router.post('/', authenticateUser, orderController.placeOrder);

// Route for getting user order details
router.get(
  '/:userId',
  authenticateUser,
  authorizeUser,
  orderController.getUserOrders
);

// Route for getting all orders (admin access)
router.get(
  '/all',
  authenticateUser,
  authorizeUser,
  orderController.getAllOrders
);

// Route for getting order by ID (admin access or user's own order)
router.get('/order/:orderId', authenticateUser, orderController.getOrderById);

module.exports = router;
