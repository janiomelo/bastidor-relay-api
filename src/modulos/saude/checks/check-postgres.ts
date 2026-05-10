import { Pool } from 'pg';

export interface ResultadoCheckPostgres {
  status: 'ok' | 'indisponivel';
  latencia_ms: number;
  detalhe?: string;
}

export async function verificarPostgres(
  pool: Pool,
  timeout_ms: number
): Promise<ResultadoCheckPostgres> {
  const inicio = Date.now();

  try {
    const promise = pool.query('SELECT NOW()');
    const resultado = await Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout_ms)
      ),
    ]);

    const latencia = Date.now() - inicio;
    return {
      status: 'ok',
      latencia_ms: latencia,
    };
  } catch (erro) {
    const latencia = Date.now() - inicio;
    const mensagem = erro instanceof Error ? erro.message : String(erro);

    return {
      status: 'indisponivel',
      latencia_ms: latencia,
      detalhe: `Falha ao conectar: ${mensagem}`,
    };
  }
}
