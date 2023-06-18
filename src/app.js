const express = require('express');
const app = express();
const { usersRouter, indexRouter } = require('./routes/index');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerConfig = require('./swagger');

require('dotenv').config();

app.use(express.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);

const swaggerSpec = swaggerJsDoc(swaggerConfig);
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
