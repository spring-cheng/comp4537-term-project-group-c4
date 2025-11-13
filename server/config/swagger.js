import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "COMP 4537 Term Project - Group C4 API",
      version: "1.0.0",
      description: "API documentation for COMP 4537 term project.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app) {
  app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default swaggerSpec;
