const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");

const healthRoutes = require("./health");
const postRoutes = require("./posts");

const routes = express.Router();

routes.use("/about", healthRoutes);
routes.use("/api-docs", swaggerUi.serve);
routes.get("/api-docs", swaggerUi.setup(swaggerDocument));

routes.use("/posts", postRoutes);

module.exports = routes;
