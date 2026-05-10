import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import Fastify, { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { registrarRotasSaude } from '../../../src/modulos/saude/rota-saude';
import { ServicoSaude } from '../../../src/modulos/saude/servico-saude';

let app: FastifyInstance;
let poolMock: Pool;

async function setupTeste() {
  // Mock minimo do pool para testes
  poolMock = {
    query: async () => {
      return { rows: [{ now: new Date() }] };
    },
  } as unknown as Pool;

  app = Fastify();
  const servico = new ServicoSaude(poolMock, null, 'test-bucket', 500, 5);

  await registrarRotasSaude(app, servico);
}

void test('GET /saude retorna status vivo', async () => {
  await setupTeste();

  const resposta = await app.inject({
    method: 'GET',
    url: '/saude',
  });

  assert.equal(resposta.statusCode, 200);
  const body = JSON.parse(resposta.body);
  assert.equal(body.status, 'vivo');
  assert(body.timestamp);
});

void test('GET /saude/detalhe retorna status ok quando postgres esta disponivel', async () => {
  await setupTeste();

  const resposta = await app.inject({
    method: 'GET',
    url: '/saude/detalhe',
  });

  assert.equal(resposta.statusCode, 200);
  const body = JSON.parse(resposta.body);
  assert.equal(body.status_geral, 'ok');
  assert(body.servico);
  assert(body.dependencias.postgres);
  assert(body.dependencias.storage);
});

void test('GET /saude/detalhe retorna 503 quando postgres falha', async () => {
  // Mock com pool que falha
  const poolFalho = {
    query: async () => {
      throw new Error('Conexao recusada');
    },
  } as unknown as Pool;

  const app2 = Fastify();
  const servico = new ServicoSaude(poolFalho, null, 'test-bucket', 500, 5);

  await registrarRotasSaude(app2, servico);

  const resposta = await app2.inject({
    method: 'GET',
    url: '/saude/detalhe',
  });

  assert.equal(resposta.statusCode, 503);
  const body = JSON.parse(resposta.body);
  assert.equal(body.status_geral, 'indisponivel');
  assert.equal(body.dependencias.postgres.status, 'indisponivel');
});

void test('GET /saude/detalhe respeita cache com TTL curto', async () => {
  await setupTeste();

  const poolComContador = {
    query: async () => {
      return { rows: [{ now: new Date() }] };
    },
  } as unknown as Pool;

  const servico = new ServicoSaude(poolComContador, null, 'test-bucket', 500, 1);
  const appComCache = Fastify();
  await registrarRotasSaude(appComCache, servico);

  // Primeira chamada
  const resp1 = await appComCache.inject({
    method: 'GET',
    url: '/saude/detalhe',
  });
  assert.equal(resp1.statusCode, 200);
  const body1 = JSON.parse(resp1.body);

  // Segunda chamada deve estar em cache
  const resp2 = await appComCache.inject({
    method: 'GET',
    url: '/saude/detalhe',
  });
  assert.equal(resp2.statusCode, 200);
  const body2 = JSON.parse(resp2.body);

  assert.equal(body1.gerado_em, body2.gerado_em);
  assert.equal(body2.cached, true);
});
