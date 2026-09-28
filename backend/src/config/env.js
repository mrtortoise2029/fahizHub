import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: new URL('../../../.env', import.meta.url), quiet: true });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DB_HOST: z.string().default('localhost'), DB_PORT: z.coerce.number().default(3306), DB_NAME: z.string().default('fahizhub'), DB_USER: z.string().default('root'), DB_PASSWORD: z.string().default(''),
  JWT_SECRET: z.string().min(32).default('development-only-secret-change-me-now'), JWT_EXPIRES_IN: z.string().default('2h'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
});
export const env = schema.parse(process.env);
