import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

export function setupDocumentation(app: Application) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Car Rental API',
        version: '1.0.0',
      },
    },
    apis: ['./src/routes.ts'], // later point to all your route files
  };

  const specs = swaggerJsdoc(options);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}