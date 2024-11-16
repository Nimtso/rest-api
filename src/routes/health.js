const express = require("express");

const { handleHealth } = require("../controllers/health.js");

const healthRoutes = express.Router();

healthRoutes.get("/", handleHealth);

module.exports = healthRoutes;
