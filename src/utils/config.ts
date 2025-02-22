import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env"
    : `.${process.env.NODE_ENV}.env`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const configSchema = z.object({
  app: z.object({
    port: z.string().transform(Number).default("3000"),
    env: z.enum(["development", "production", "test"]).default("development"),
    domainBase: z.string().default("http://localhost"),
  }),
  database: z.object({
    uri: z.string().url().default("mongodb://localhost:27017/defaultDatabase"),
    storage: z.string().default("storage"),
  }),
  auth: z.object({
    TOKEN_SECRET: z.string().min(1),
    TOKEN_EXPIRES: z.string().min(1),
    REFRESH_TOKEN_EXPIRES: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
  }),
});

const config = configSchema.parse({
  app: {
    port: process.env.PORT,
    env: process.env.NODE_ENV,
    domainBase: process.env.DOMAIN_BASE,
  },
  database: {
    uri: process.env.URI_MONGO,
    storage: process.env.STORAGE,
  },
  logger: {
    level: process.env.LOG_LEVEL,
  },
  auth: {
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    TOKEN_EXPIRES: process.env.TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
});

export default config;
