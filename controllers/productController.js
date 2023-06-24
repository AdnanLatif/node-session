const Product = require('../models/Product');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  const {
    title,
    description,
    price,
    availableQuantity,
    category,
    otherProperties,
  } = req.body;

  try {
    const product = new Product({
      title,
      description,
      price,
      availableQuantity,
      category,
      otherProperties,
    });

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const {
    title,
    description,
    price,
    availableQuantity,
    category,
    otherProperties,
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.title = title;
    product.description = description;
    product.price = price;
    product.availableQuantity = availableQuantity;
    product.category = category;
    product.otherProperties = otherProperties;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
