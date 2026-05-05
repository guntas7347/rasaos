import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((val) => val.split(",")),
});

export const env = envSchema.parse(process.env);
