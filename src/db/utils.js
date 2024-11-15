const mongoose = require("mongoose");

const config = require("../utils/config");
const logger = require("../utils/logger");

const connect = async () => {
  try {
    await mongoose.connect(config.database.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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

module.exports = { connect, disconnect };
