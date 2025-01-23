import mongoose from "mongoose";
import config from "../utils/config";
import logger from "../utils/logger";

const connect = async () => {
  try {
    await mongoose.connect(config.database.uri);
    logger.info("Connected to MongoDB successfully");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB successfully");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB:", error);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection lost. Retrying...");
});

export { connect, disconnect };
