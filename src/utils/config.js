const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const configSchema = z.object({
  app: z.object({
    port: z.string().transform(Number).default("3000"),
    env: z.enum(["development", "production", "test"]).default("development"),
  }),
  database: z.object({
    uri: z.string().url().default("mongodb://localhost:27017/defaultDatabase"),
  }),
});

const config = configSchema.parse({
  app: {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
  },
  database: {
    uri: process.env.URI_MONGO,
  },
  logger: {
    level: process.env.LOG_LEVEL,
  },
});

module.exports = config;
