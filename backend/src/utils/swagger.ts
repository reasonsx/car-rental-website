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
        description:
          "REST API for the Car Rental Website platform. Supports authentication, car management, bookings, profile management, and admin operations.",
      },
      servers: [
        {
          url: "https://car-rental-website-backend-g5ot.onrender.com/api",
          description: "Production server",
        },
      ],

      tags: [
        {
          name: "Auth",
          description: "Authentication and account management",
        },
        {
          name: "Cars",
          description: "Car catalog and vehicle management",
        },
        {
          name: "Bookings",
          description: "Booking and reservation operations",
        },
        {
          name: "Users",
          description: "User profile management",
        },
        {
          name: "Admin",
          description: "Administrative operations",
        },
      ],

      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter JWT token",
          },
        },

        schemas: {
          ErrorResponse: {
            type: "object",
            properties: {
              error: {
                type: "string",
                example: "Validation failed",
              },
            },
          },

          SuccessResponse: {
            type: "object",
            properties: {
              error: {
                nullable: true,
                example: null,
              },
              data: {
                type: "object",
              },
            },
          },
        },
      },

      security: [
        {
          bearerAuth: [],
        },
      ],
    },

    apis: ["./src/**/*.ts"],
  };

  const specs = swaggerJsdoc(options);

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,

      customSiteTitle: "Car Rental API Docs",

      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "none",
        filter: true,
        tryItOutEnabled: true,
      },

      customCss: `
        .swagger-ui .topbar {
          display: none;
        }

        .swagger-ui .info {
          margin-bottom: 20px;
        }

        .swagger-ui .scheme-container {
          border-radius: 12px;
        }
      `,
    }),
  );
}