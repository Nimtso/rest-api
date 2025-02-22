import express from "express";

import { handleHealth } from "../controllers/health";

const healthRoutes = express.Router();

healthRoutes.get("/", handleHealth);

export default healthRoutes;
