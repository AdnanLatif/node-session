const Order = require('../models/Order');
const emailService = require('../services/emailService');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Place an order
const placeOrder = async (req, res) => {
  try {
    const { user } = req;
    const { cartId } = req.body;

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const products = cart.products.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      name: item.product.name,
    }));

    const totalPrice = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const order = new Order({
      user: user.id,
      products,
      orderPrice: totalPrice,
    });

    await order.save();

    await Promise.all(
      cart.products.map(async (item) => {
        const product = await Product.findById(item.product);
        if (product) {
          product.availableQuantity -= item.quantity;
          await product.save();
        }
      }),
    );

    await emailService.sendCartDetailsEmail(user.email, cart);

    await Cart.findByIdAndDelete(cart._id);

    res.json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    let query = {};
    if (userId !== 'all') {
      query = { user: userId };
    }

    const orders = await Order.find(query);

    res.json({ orders });
  } catch (error) {
    console.error('Error retrieving user orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all orders (admin access)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    res.json({ orders });
  } catch (error) {
    console.error('Error retrieving all orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get order by ID (admin access or user's own order)
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the user is authorized to access the order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error retrieving order by ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
};
