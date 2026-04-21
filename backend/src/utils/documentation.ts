import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

export function setupDocumentation(app: Application) {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Car Rental API",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:4000/api", // 🔥 THIS FIXES YOUR 404
        },
      ],
    },
    apis: ["./src/**/*.ts"], // 🔥 safer than modules/*
  };

  const specs = swaggerJsdoc(options);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}
