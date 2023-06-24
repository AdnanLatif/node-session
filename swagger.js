const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = ['./index.js']; // Path to your route files

const doc = {
  info: {
    title: 'ECOM API Documentation',
    description: 'This is the documentation of Ecom API.',
    version: '1.0.0',
  },
  host: 'node-session.vercel.app', // Replace with your API's host
  basePath: '/', // Replace with your API's base path
  schemes: ['https'], // Replace with the supported protocols (http, https, etc.)
};

swaggerAutogen(outputFile, endpointsFiles, doc);
