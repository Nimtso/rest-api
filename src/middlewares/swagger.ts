import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "../utils/config";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [
      { url: "http://localhost:" + config.app.port },
      { url: config.app.domainBase },
    ],
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);

const swaggerMiddleware = (app: express.Application) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};

export default swaggerMiddleware;
