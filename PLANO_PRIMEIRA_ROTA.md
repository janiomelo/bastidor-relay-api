# Plano da Primeira Rota do Relay API

## Objetivo da Primeira Entrega
A primeira rota sera GET /saude.

Ela deve responder o estado do servico e das dependencias criticas, com duas garantias ao mesmo tempo:
- sem gerar sobrecarga por checagens caras em toda requisicao
- sem esconder degradacoes reais

## Decisoes que Precisamos Fechar
Este plano traz opcoes para voce decidir antes da implementacao.

### 1. Stack e Framework HTTP
Opcao A: Node.js + Fastify
- Vantagens: rapido, simples para API pequena, bom ecossistema de plugins
- Risco: exige disciplina para manter arquitetura limpa conforme crescer

Opcao B: Node.js + NestJS (Fastify adapter)
- Vantagens: organizacao forte por modulos, DI nativa, padroes corporativos
- Risco: mais boilerplate para um inicio pequeno

Opcao C: Go + chi/fiber
- Vantagens: footprint baixo, latencia excelente, binario unico
- Risco: aumenta custo de velocidade inicial se o time estiver mais forte em JS/TS

Recomendacao para este projeto agora: Opcao A.
Motivo: velocidade de entrega + boa base para evolucao do relay.

### 2. Runtime e Linguagem
Opcao A: TypeScript estrito
- Vantagens: contrato forte, reduz erro em producao
- Risco: setup inicial um pouco maior

Opcao B: JavaScript puro
- Vantagens: inicio muito rapido
- Risco: maior risco de regressao quando crescer

Recomendacao: Opcao A (TypeScript estrito).

### 3. Armazenamento para Estado de Saude
Opcao A: sem persistencia, apenas checks em tempo real
- Vantagens: simples
- Risco: pode custar caro e oscilar sob carga

Opcao B: snapshot em memoria com TTL curto
- Vantagens: reduz custo por requisicao e evita tempestade de checks
- Risco: exige politica clara de expirar e atualizar

Recomendacao: Opcao B com TTL de 5 segundos para checks caros.

### 4. Modelo da Rota de Saude
Opcao A: endpoint unico GET /saude com visao completa
- Vantagens: simples para observabilidade e debug
- Risco: pode expor detalhes demais em ambiente publico

Opcao B: dois niveis
- GET /saude: liveness leve (processo no ar)
- GET /saude/detalhe: readiness com dependencias
- Vantagens: separa uso de load balancer e diagnostico
- Risco: um endpoint extra

Recomendacao: Opcao B.

## Dependencias a Verificar
Nivel critico (readiness):
- Banco PostgreSQL (ping curto com timeout)
- Storage de blob: Cloudflare R2 em producao, MinIO em desenvolvimento (validar head/list minima)
- Relogio do sistema (desvio maximo aceitavel, se houver requisito de assinatura/expiracao)

Nivel informativo (nao derruba readiness por padrao):
- DNS para provedores externos
- Integracao de email transacional

## Estrategia para Nao Sobrecarregar
- Timeout curto por dependencia (exemplo: 150ms a 500ms)
- Execucao paralela das checagens
- Cache de resultado por TTL curto para checks caros
- Circuit breaker simples por dependencia para falhas repetidas
- Limite de concorrencia para refresh de health (single-flight)

## Estrategia para Nao Esconder Problemas
- Retornar status por dependencia, nao apenas um boolean geral
- Incluir latencia por dependencia
- Incluir timestamp da ultima checagem real
- Se check estiver em cache, indicar explicitamente cached: true
- Em caso de timeout, marcar degraded com motivo

## Contrato Sugerido
GET /saude
- 200 quando processo esta vivo
- payload leve

GET /saude/detalhe
- 200 quando tudo critico ok
- 503 quando qualquer dependencia critica falhar
- payload detalhado por dependencia

Exemplo de resposta de /saude/detalhe:
- status_geral: ok | degradado | indisponivel
- servico: nome, versao, ambiente, uptime_segundos
- dependencias:
  - postgres: status, latencia_ms, ultima_verificacao, detalhe
  - storage: status, latencia_ms, ultima_verificacao, detalhe
  - email: status, latencia_ms, ultima_verificacao, detalhe
- cached: true | false
- gerado_em: timestamp

## Organizacao de Arquivos Sugerida
Se adotarmos Node.js + Fastify + TypeScript:
- src/app.ts
- src/server.ts
- src/modulos/saude/rota-saude.ts
- src/modulos/saude/servico-saude.ts
- src/modulos/saude/checks/check-postgres.ts
- src/modulos/saude/checks/check-storage.ts
- src/modulos/saude/tipos-saude.ts
- src/infra/config/ambiente.ts
- src/infra/http/plugins/observabilidade.ts
- tests/e2e/saude.spec.ts
- tests/unit/modulos/saude/servico-saude.spec.ts

## Plano de Implementacao
Fase 1: base do servico
- subir servidor HTTP
- registrar rota GET /saude
- retornar liveness simples

Fase 2: readiness detalhado
- criar GET /saude/detalhe
- adicionar check de postgres com timeout
- retornar 503 se dependencia critica falhar

Fase 3: resiliencia e custo
- adicionar cache TTL curto
- adicionar single-flight para evitar checagem duplicada em pico
- incluir latencia e ultima verificacao por dependencia

Fase 4: testes
- unitarios para agregacao de status
- e2e para 200 e 503
- e2e para comportamento com cache

## Criterios de Aceite
- /saude responde rapido e estavel
- /saude/detalhe expõe falhas reais de dependencia critica
- sem tempestade de checks sob carga
- cobertura de testes para cenarios ok, degradado e indisponivel
- logs estruturados sem ruido excessivo

## Decisoes para Voce Escolher Agora
1. Framework: Fastify, NestJS, ou Go
2. Linguagem: TypeScript estrito ou JavaScript
3. Modelo de endpoints: unico (/saude) ou duplo (/saude e /saude/detalhe)
4. TTL inicial do cache: 3s, 5s, ou 10s
5. Dependencias criticas do dia 1: apenas Postgres, ou Postgres + Storage

Depois que voce escolher, eu implemento imediatamente com a estrutura fechada.
