const express = require("express");
require("dotenv").config();

const logger = require("./utils/logger");
const routes = require("./routes/index");
const loggerMiddleware = require("./middlewares/logger.js");
const { connect: connectMongo } = require("../src/db/utils.js");
const config = require("./utils/config.js");

const PORT = config.app.port;
const URI_DB = config.database.uri;

const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(loggerMiddleware);
  app.use("/", routes);

  return app;
};

const connectDB = async () => {
  logger.info("Attempting to connect to DataBase.");
  await connectMongo(URI_DB);
};

const init = async () => {
  await connectDB();
  const app = createServer();

  app.listen(PORT, () => {
    logger.debug(`Listening on port ${PORT}`);
  });
};

module.exports = { createServer, init };
