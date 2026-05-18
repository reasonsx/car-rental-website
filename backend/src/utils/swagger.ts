import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { schemas } from "./docs";

export function setupDocumentation(app: Application) {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Car Rental Website API",
        version: "1.0.0",
        description:
          "REST API for authentication, cars, bookings, users, categories, and locations.",
      },
      servers: [
        {
          url: "https://car-rental-website-backend-g5ot.onrender.com/api",
          description: "Production server",
        },
      ],
      tags: [
        { name: "Auth", description: "Authentication and account management" },
        { name: "Cars", description: "Car catalog" },
        { name: "Bookings", description: "Booking operations" },
        { name: "Users", description: "User management" },
        { name: "Categories", description: "Car categories" },
        { name: "Locations", description: "Rental locations" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        schemas,
      },
    },
    apis: ["./src/**/*.ts"],
  };

  const specs = swaggerJsdoc(options);

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customSiteTitle: "Car Rental API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "none",
        tryItOutEnabled: true,
      },
      customCss: `
        .swagger-ui .topbar {
          display: none;
        }
      `,
    }),
  );
}