const Order = require('../models/Order');
const emailService = require('../services/emailService');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Place an order
const placeOrder = async (req, res) => {
  try {
    // Process the order and get the necessary data
    const { user } = req;
    const { cartId } = req.body;

    // Fetch the cart from the database using the cartId
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const products = cart.products.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      name: item.product.name,
    }));

    // Calculate the total price
    const totalPrice = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Create a new order
    const order = new Order({
      user: user.id,
      products,
      orderPrice: totalPrice,
    });

    // Save the order
    await order.save();

    // Deduct the quantity from actual products
    await Promise.all(
      cart.products.map(async (item) => {
        const product = await Product.findById(item.product);
        if (product) {
          product.availableQuantity -= item.quantity;
          await product.save();
        }
      })
    );

    // Send the cart details email to the user
    await emailService.sendCartDetailsEmail(user.email, cart);

    // Delete the cart
    await Cart.findByIdAndDelete(cart._id);

    res.json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    // Find orders for the user
    const orders = await Order.find({ user: userId });

    res.json({ orders });
  } catch (error) {
    console.error('Error retrieving user orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
};
