import dotenv from 'dotenv';
import path from 'path';

// Prioritaskan .env.local kemudian .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  hasDatabaseConfigured: Boolean(process.env.DATABASE_URL),
};
