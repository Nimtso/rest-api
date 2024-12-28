import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const configSchema = z.object({
  app: z.object({
    port: z.string().transform(Number).default("3000"),
    env: z.enum(["development", "production", "test"]).default("development"),
  }),
  database: z.object({
    uri: z.string().url().default("mongodb://localhost:27017/defaultDatabase"),
  }),
  auth: z.object({
    TOKEN_SECRET: z.string().nonempty(),
    TOKEN_EXPIRES: z.string().nonempty(),
    REFRESH_TOKEN_EXPIRES: z.string().nonempty(),
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
  auth: {
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    TOKEN_EXPIRES: process.env.TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
  },
});

export default config;
