// src/middleware/logging.ts
import expressWinston from "express-winston";
import logger from "../utils/logger";

const requestLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
  expressFormat: true,
  colorize: false,
});

export default requestLogger;
