import { Pool } from 'pg';
import { S3Client } from '@aws-sdk/client-s3';

export async function criarPoolPostgres(url: string): Promise<Pool> {
  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Testa conexao inicial
  await pool.query('SELECT NOW()');

  return pool;
}

export function criarClienteS3(
  endpoint: string,
  acessoChave: string,
  chaveSecreta: string,
  regiao: string
): S3Client | null {
  if (!acessoChave || !chaveSecreta) {
    console.warn('S3 nao configurado: credenciais ausentes');
    return null;
  }

  return new S3Client({
    region: regiao,
    endpoint: endpoint,
    credentials: {
      accessKeyId: acessoChave,
      secretAccessKey: chaveSecreta,
    },
  });
}
