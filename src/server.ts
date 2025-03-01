import fs from "fs";
import path from "path";
import https from "https";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

dotenv.config();

import logger from "./utils/logger";
import routes from "./routes/index";
import loggerMiddleware from "./middlewares/logger";
import { connect as connectMongo } from "./db/utils";
import config from "./utils/config";
import swaggerMiddleware from "./middlewares/swagger";

const port = config.app.port;

const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  swaggerMiddleware(app);
  app.use(loggerMiddleware);
  app.use("/", routes);
  app.use("/storage", express.static("storage"));
  app.use(express.static("front"));

  app.use((req, res, next) => {
    if (req.originalUrl.includes(".")) {
      return next();
    }

    res.sendFile(path.resolve("front", "index.html"), (err) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      }
    });
  });

  return app;
};

const connectDB = async () => {
  logger.info("Attempting to connect to DataBase.");
  await connectMongo();
};

const init = async () => {
  await connectDB();
  const app = createServer();

  if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
      logger.debug(`Listening on port ${port}`);
    });
  } else {
    const options = {
      key: fs.readFileSync("../client-key.pem"),
      cert: fs.readFileSync("../client-cert.pem"),
    };
    https.createServer(options, app).listen(port);
  }
};

export { createServer, init };
