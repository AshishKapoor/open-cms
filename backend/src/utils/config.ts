import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
});

const parseConfig = (): z.infer<typeof configSchema> => {
  try {
    return configSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    });
  } catch (error) {
    console.error('Invalid configuration:', error);
    process.exit(1);
  }
};

export const config = parseConfig();
