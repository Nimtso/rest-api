import express from "express";

import healthRoutes from "./health";
import postRoutes from "./posts";
import commentRoutes from "./comments";
import authRoutes from "./auth";
import userRoute from "./users";

const routes = express.Router();

routes.use("/about", healthRoutes);

routes.use("/auth", authRoutes);
routes.use("/posts", postRoutes);
routes.use("/comments", commentRoutes);
routes.use("/users", userRoute);

export default routes;
