const express = require('express');

const router = express.Router();
const productController = require('../controllers/productController');
const {
  authenticateUser,
  authorizeUser,
} = require('../middleware/authMiddleware');

// Get all products
router.get('/', productController.getAllProducts);

// Get a single product
router.get('/:id', productController.getProductById);

// Create a new product
router.post(
  '/',
  authenticateUser,
  authorizeUser,
  productController.createProduct,
);

// Update a product
router.put(
  '/:id',
  authenticateUser,
  authorizeUser,
  productController.updateProduct,
);

// Delete a product
router.delete(
  '/:id',
  authenticateUser,
  authorizeUser,
  productController.deleteProduct,
);

module.exports = router;
