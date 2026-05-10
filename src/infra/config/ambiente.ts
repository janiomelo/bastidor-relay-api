export interface Ambiente {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  DATABASE_URL: string;
  S3_ENDPOINT: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_BUCKET: string;
  S3_REGION: string;
  HEALTH_CHECK_TIMEOUT_MS: number;
  HEALTH_CACHE_TTL_SECONDS: number;
}

export function carregarAmbiente(): Ambiente {
  const env = process.env as Record<string, string | undefined>;

  return {
    NODE_ENV: (env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
    PORT: parseInt(env.PORT || '3000', 10),
    LOG_LEVEL: (env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    DATABASE_URL: env.DATABASE_URL || 'postgresql://usuario:senha@localhost:5432/bastidor_relay',
    S3_ENDPOINT: env.S3_ENDPOINT || 'https://r2.example.com',
    S3_ACCESS_KEY_ID: env.S3_ACCESS_KEY_ID || '',
    S3_SECRET_ACCESS_KEY: env.S3_SECRET_ACCESS_KEY || '',
    S3_BUCKET: env.S3_BUCKET || 'bastidor-storage',
    S3_REGION: env.S3_REGION || 'auto',
    HEALTH_CHECK_TIMEOUT_MS: parseInt(env.HEALTH_CHECK_TIMEOUT_MS || '500', 10),
    HEALTH_CACHE_TTL_SECONDS: parseInt(env.HEALTH_CACHE_TTL_SECONDS || '5', 10),
  };
}
