import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
dotenv.config({ 
  path: process.env.NODE_ENV === 'production' 
    ? path.resolve(process.cwd(), '.env.production') 
    : path.resolve(process.cwd(), '.env') 
});

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}