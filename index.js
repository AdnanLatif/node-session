const express = require('express');
const cluster = require('cluster');
const os = require('os');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

require('dotenv').config();

const PORT = process.env.PORT || 3001;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }
} else {
  const app = express();

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
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.get('/', (req, res) => {
    res.send('Welcome to the Ecom API');
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}
