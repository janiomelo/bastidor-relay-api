import { Pool } from 'pg';
import { S3Client } from '@aws-sdk/client-s3';
import { verificarPostgres } from './checks/check-postgres';
import { verificarStorage } from './checks/check-storage';
import { ResultadoSaude, ResultadoLiveness, StatusGeral } from './tipos-saude';

interface CacheResultado {
  resultado: ResultadoSaude;
  expira_em: number;
}

export class ServicoSaude {
  private cacheResultado: CacheResultado | null = null;
  private checando = false;

  constructor(
    private pool: Pool,
    private clienteS3: S3Client | null,
    private bucket: string,
    private timeout_ms: number,
    private ttl_cache_segundos: number
  ) {}

  async liveness(): Promise<ResultadoLiveness> {
    return {
      status: 'vivo',
      timestamp: new Date().toISOString(),
    };
  }

  async readiness(): Promise<ResultadoSaude> {
    const agora = Date.now();

    // Single-flight: se ja tem checagem em andamento, espera
    if (this.checando) {
      // Retorna cache se valido, senao espera
      if (this.cacheResultado && agora < this.cacheResultado.expira_em) {
        return {
          ...this.cacheResultado.resultado,
          cached: true,
        };
      }

      // Aguarda checagem em andamento
      while (this.checando && agora < (this.cacheResultado?.expira_em ?? 0)) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      if (this.cacheResultado && agora < this.cacheResultado.expira_em) {
        return {
          ...this.cacheResultado.resultado,
          cached: true,
        };
      }
    }

    // Se cache valido, retorna
    if (this.cacheResultado && agora < this.cacheResultado.expira_em) {
      return {
        ...this.cacheResultado.resultado,
        cached: true,
      };
    }

    // Executa nova checagem
    this.checando = true;
    try {
      const resultado = await this.executarChecagem();

      this.cacheResultado = {
        resultado,
        expira_em: agora + this.ttl_cache_segundos * 1000,
      };

      return resultado;
    } finally {
      this.checando = false;
    }
  }

  private async executarChecagem(): Promise<ResultadoSaude> {
    const agora = new Date();
    const uptime = Math.floor(process.uptime());

    // Executa checks em paralelo
    const [postgres, storage] = await Promise.all([
      verificarPostgres(this.pool, this.timeout_ms),
      verificarStorage(this.clienteS3, this.bucket, this.timeout_ms),
    ]);

    // Determina status geral
    const dependencias_criticas_com_falha = [postgres, storage].filter(
      dep => dep.status === 'indisponivel'
    );

    const status_geral: StatusGeral =
      dependencias_criticas_com_falha.length > 0 ? 'indisponivel' : 'ok';

    return {
      status_geral,
      servico: {
        nome: 'Bastidor Relay API',
        versao: '0.1.0',
        ambiente: process.env.NODE_ENV || 'development',
        uptime_segundos: uptime,
      },
      dependencias: {
        postgres: {
          status: postgres.status === 'ok' ? 'ok' : 'indisponivel',
          latencia_ms: postgres.latencia_ms,
          ultima_verificacao: agora.toISOString(),
          detalhe: postgres.detalhe,
        },
        storage: {
          status:
            storage.status === 'nao_configurado'
              ? 'ok'
              : storage.status === 'ok'
                ? 'ok'
                : 'degradado',
          latencia_ms: storage.latencia_ms,
          ultima_verificacao: agora.toISOString(),
          detalhe: storage.detalhe,
        },
      },
      cached: false,
      gerado_em: agora.toISOString(),
    };
  }
}
