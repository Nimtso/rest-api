import express from "express";
import swaggerMiddleware from "../middlewares/swagger";

import healthRoutes from "./health";
import postRoutes from "./posts";
import commentRoutes from "./comments";
import authRoutes from "./auth";

const routes = express.Router();

routes.use("/about", healthRoutes);

routes.use("/auth", authRoutes);
routes.use("/posts", postRoutes);
routes.use("/comments", commentRoutes);

export default routes;
