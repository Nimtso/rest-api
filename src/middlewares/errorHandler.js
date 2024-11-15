const logger = require("../utils/logger.js");

const errorHandler = (error, req, res, _next) => {
  logger.error(error.message);
  res.status(error.status).json({
    status: error.name,
    statusCode: error.status,
    message: error.message,
  });
};

module.exports = errorHandler;
