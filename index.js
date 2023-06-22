const express = require('express');
const app = express();
const mongoose = require('mongoose');

require('dotenv').config();

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Check database connection
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('connected', () => {
  console.log('Connected to the database');
});

app.use(express.json());

// Set up routes
app.use('/', (req, res) => {
  res.send('Welcome to the Ecom API');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
