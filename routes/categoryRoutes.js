const express = require('express');

const router = express.Router();
const categoryController = require('../controllers/categoryController');
const {
  authenticateUser,
  authorizeUser,
} = require('../middleware/authMiddleware');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get a single category
router.get('/:id', categoryController.getCategoryById);

// Create a new category
router.post(
  '/',
  authenticateUser,
  authorizeUser,
  categoryController.createCategory,
);

// Update a category
router.patch(
  '/:id',
  authenticateUser,
  authorizeUser,
  categoryController.updateCategory,
);

// Delete a category
router.delete(
  '/:id',
  authenticateUser,
  authorizeUser,
  categoryController.deleteCategory,
);

module.exports = router;
