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
module.exports = router;
