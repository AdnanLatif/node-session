const host = 'localhost:5000';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Users API',
    description: '',
    version: '1.0.0',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

module.exports = {
  swaggerDefinition,
  host,
  basePath: '/',
  apis: ['src/routes/*.js'],
};
