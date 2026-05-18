import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

export function setupDocumentation(app: Application) {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Car Rental Website API",
        version: "1.0.0",
      },
      servers: [
        {
          url: "https://car-rental-website-backend-g5ot.onrender.com/api",
        },
      ],
    },
    apis: ["./src/**/*.ts"],
  };

  const specs = swaggerJsdoc(options);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}
