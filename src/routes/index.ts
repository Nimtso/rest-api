import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../../swagger.json";

import healthRoutes from "./health";
import postRoutes from "./posts";
import commentRoutes from "./comments";
import usersRoutes from "./users";

const routes = express.Router();

routes.use("/about", healthRoutes);
routes.use("/api-docs", swaggerUi.serve);
routes.get("/api-docs", swaggerUi.setup(swaggerDocument));

routes.use("/posts", postRoutes);
routes.use("/comments", commentRoutes);
routes.use("/users", usersRoutes);

export default routes;
