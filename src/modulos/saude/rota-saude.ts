import { FastifyInstance } from 'fastify';
import { ServicoSaude } from './servico-saude.js';
import { ResultadoSaude, ResultadoLiveness } from './tipos-saude.js';

export async function registrarRotasSaude(app: FastifyInstance, servico: ServicoSaude) {
  app.get<{ Reply: ResultadoLiveness }>('/saude', async (_request, reply) => {
    const resultado = await servico.liveness();
    return reply.send(resultado);
  });

  app.get<{ Reply: ResultadoSaude }>('/saude/detalhe', async (_request, reply) => {
    const resultado = await servico.readiness();

    if (resultado.status_geral === 'indisponivel') {
      return reply.status(503).send(resultado);
    }

    return reply.status(200).send(resultado);
  });
}
