import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

export interface ResultadoCheckStorage {
  status: 'ok' | 'indisponivel' | 'nao_configurado';
  latencia_ms: number;
  detalhe?: string;
}

export async function verificarStorage(
  cliente: S3Client | null,
  bucket: string,
  timeout_ms: number
): Promise<ResultadoCheckStorage> {
  if (!cliente) {
    return {
      status: 'nao_configurado',
      latencia_ms: 0,
      detalhe: 'Cliente S3 nao configurado',
    };
  }

  const inicio = Date.now();

  try {
    const comando = new HeadBucketCommand({ Bucket: bucket });
    const promise = cliente.send(comando);

    await Promise.race([
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
      detalhe: `Falha ao acessar bucket: ${mensagem}`,
    };
  }
}
