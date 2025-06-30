const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'My API Description',
  },
  tags: [
    {
      name: 'Colleges',
      description: 'Operations related to colleges',
    },
    {
      name: 'Departments',
      description: 'Operations related to departments',
    },
    {
      name: 'Professors',
      description: 'Operations related to proffs',
    },
    {
      name: 'Users',
      description: 'Operations related to users',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/modules/*/routes.js'], // Path to the API routes in your Node.js application
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
