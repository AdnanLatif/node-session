const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
const getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      'products.product'
    );
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a product to the cart
const addProductToCart = async (req, res) => {
  const { products } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        products: [],
      });
    }

    for (const { productId, quantity } of products) {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product with ID ${productId} not found` });
      }

      // Check if the required quantity is available
      if (product.availableQuantity < quantity) {
        return res.status(400).json({
          error: `Insufficient quantity for product with title ${product.title}`,
        });
      }

      const existingProduct = cart.products.find(
        (item) => item.product.toString() === productId
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        const price = product.price; // Retrieve the price from the product
        cart.products.push({ product: productId, quantity, price });
      }

      // Deduct the quantity from the product
      product.quantity -= quantity;
      await product.save();
    }

    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update the quantity of a product in the cart
const updateProductQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id });

    // Find the product in the cart
    const product = cart.products.find(
      (item) => item.product.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    product.quantity = quantity;

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Remove a product from the cart
const removeProductFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user.id });

    // Find the index of the product in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    cart.products.splice(productIndex, 1);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getUserCart,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
};
