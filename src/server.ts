import express from "express";
import dotenv from "dotenv";

dotenv.config();

import logger from "./utils/logger";
import routes from "./routes/index";
import loggerMiddleware from "./middlewares/logger";
import { connect as connectMongo } from "./db/utils";
import config from "./utils/config";
import swaggerMiddleware from "./middlewares/swagger";

const PORT = config.app.port;

const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  swaggerMiddleware(app);
  app.use(loggerMiddleware);
  app.use("/", routes);

  return app;
};

const connectDB = async () => {
  logger.info("Attempting to connect to DataBase.");
  await connectMongo();
};

const init = async () => {
  await connectDB();
  const app = createServer();

  app.listen(PORT, () => {
    logger.debug(`Listening on port ${PORT}`);
  });
};

export { createServer, init };
