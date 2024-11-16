const express = require("express");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../../swagger.json");

const healthRoutes = require("./health");
const postRoutes = require("./posts");
const commentRoutes = require("./comments")

const routes = express.Router();

routes.use("/about", healthRoutes);
routes.use("/api-docs", swaggerUi.serve);
routes.get("/api-docs", swaggerUi.setup(swaggerDocument));

routes.use("/posts", postRoutes);
routes.use("/comments", commentRoutes)

module.exports = routes;
