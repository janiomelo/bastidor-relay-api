import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import { carregarAmbiente } from './infra/config/ambiente.js';
import { criarPoolPostgres, criarClienteS3 } from './infra/db/conexoes.js';
import { ServicoSaude } from './modulos/saude/servico-saude.js';
import { registrarRotasSaude } from './modulos/saude/rota-saude.js';
import { Pool } from 'pg';

async function iniciar() {
  const ambiente = carregarAmbiente();

  const app = Fastify({
    logger: {
      level: ambiente.LOG_LEVEL,
    },
  });

  // Registra plugins de seguranca
  await app.register(fastifyHelmet);
  await app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // Inicializa conexoes
  let pool: Pool | null = null;
  try {
    pool = await criarPoolPostgres(ambiente.DATABASE_URL);
    app.log.info('PostgreSQL conectado');
  } catch (erro) {
    app.log.warn(erro, 'PostgreSQL indisponivel no boot; API iniciara com readiness degradada');
  }

  let clienteS3: ReturnType<typeof criarClienteS3> | null = null;

  try {
    clienteS3 = criarClienteS3(
      ambiente.S3_ENDPOINT,
      ambiente.S3_ACCESS_KEY_ID,
      ambiente.S3_SECRET_ACCESS_KEY,
      ambiente.S3_REGION
    );

    if (clienteS3) {
      app.log.info('S3-Compatible inicializado');
    }
  } catch (erro) {
    app.log.warn(erro, 'Aviso: S3 nao configurado, operacoes de storage serao desabilitadas');
  }

  // Instancia servico de saude
  const servicoSaude = new ServicoSaude(
    pool,
    clienteS3,
    ambiente.S3_BUCKET,
    ambiente.HEALTH_CHECK_TIMEOUT_MS,
    ambiente.HEALTH_CACHE_TTL_SECONDS
  );

  // Registra rotas
  await registrarRotasSaude(app, servicoSaude);

  // Graceful shutdown
  const shutdown = async (sinal: string) => {
    app.log.info(`Sinal ${sinal} recebido, fechando gracefully...`);

    await app.close();
    if (pool) {
      await pool.end();
    }

    if (clienteS3) {
      clienteS3.destroy();
    }

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Inicia servidor
  try {
    await app.listen({ port: ambiente.PORT, host: '0.0.0.0' });
    app.log.info(`Servidor rodando em http://0.0.0.0:${ambiente.PORT}`);
  } catch (erro) {
    app.log.error(erro);
    process.exit(1);
  }
}

iniciar().catch(erro => {
  console.error('Falha fatal na inicializacao:', erro);
  process.exit(1);
});
