const express = require("express");

const { handleHealth } = require("../handlers/health.js");

const healthRoutes = express.Router();

healthRoutes.get("/", handleHealth);

module.exports = healthRoutes;
