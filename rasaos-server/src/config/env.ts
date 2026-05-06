import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  FE_URL: z.url().default("http://localhost:5174"),
  BE_URL: z.url().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(1),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((val) => val.split(",")),

  GMAIL_USER: z.email().default(""),
  GMAIL_APP_PASS: z.string().default(""),
  GMAIL_FROM: z.email().default("noreply@rasaos.com"),
});

export const env = envSchema.parse(process.env);
