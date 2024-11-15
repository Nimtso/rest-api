const express = require("express");

const healthRoutes = require("./health");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");

const routes = express.Router();

routes.use("/health", healthRoutes);
routes.use("/api-docs", swaggerUi.serve);
routes.get("/api-docs", swaggerUi.setup(swaggerDocument));

module.exports = routes;
