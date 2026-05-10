## Instalacao

```bash
npm install
```

## Desenvolvimento Local

### Com Docker Compose

```bash
docker-compose up
```

Isso vai iniciar:
- PostgreSQL na porta 5432
- MinIO (S3-Compatible) na porta 9000 (console em 9001)
- API em desenvolvimento na porta 3000

### Sem Docker (local)

```bash
# Cria arquivo .env com variaveis locais
cp .env.example .env

# Inicia em modo desenvolvimento
npm run dev
```

## Rotas de Saude

### Liveness (processo vivo)
```bash
curl http://localhost:3000/saude
```

Resposta:
```json
{
  "status": "vivo",
  "timestamp": "2026-05-10T14:30:00.000Z"
}
```

### Readiness (dependencias criticas)
```bash
curl http://localhost:3000/saude/detalhe
```

Resposta (200 OK):
```json
{
  "status_geral": "ok",
  "servico": {
    "nome": "Bastidor Relay API",
    "versao": "0.1.0",
    "ambiente": "development",
    "uptime_segundos": 15
  },
  "dependencias": {
    "postgres": {
      "status": "ok",
      "latencia_ms": 45,
      "ultima_verificacao": "2026-05-10T14:30:00.000Z"
    },
    "storage": {
      "status": "ok",
      "latencia_ms": 120,
      "ultima_verificacao": "2026-05-10T14:30:00.000Z"
    }
  },
  "cached": false,
  "gerado_em": "2026-05-10T14:30:00.000Z"
}
```

Resposta (503 Service Unavailable) quando alguma dependencia critica falha:
```json
{
  "status_geral": "indisponivel",
  "servico": { ... },
  "dependencias": {
    "postgres": {
      "status": "indisponivel",
      "latencia_ms": 505,
      "ultima_verificacao": "2026-05-10T14:30:00.000Z",
      "detalhe": "Falha ao conectar: Conexao recusada"
    },
    ...
  },
  "cached": false,
  "gerado_em": "2026-05-10T14:30:00.000Z"
}
```

## Build

```bash
npm run build
```

## Testes

```bash
npm test
```

Testes E2E:
```bash
npm run test:e2e
```

Testes em modo watch:
```bash
npm run test:watch
```

## Producao (Docker)

```bash
docker build -t bastidor-relay:latest .
docker run -e DATABASE_URL=postgresql://... -p 3000:3000 bastidor-relay:latest
```

## Stack Decidido

- **Engine:** Fastify + Node.js 22+
- **Linguagem:** TypeScript (Strict Mode)
- **Infra:** Docker (Multi-stage build)
- **DB:** PostgreSQL
- **Storage:** S3-Compatible (Cloudflare R2 ou MinIO)
- **Health:** /saude (liveness) e /saude/detalhe (readiness)

## Proximas Rotas

Apos validar /saude em producao, implementar:
- POST /auth/signup
- POST /auth/login
- GET /sync
- POST /sync

Ver [PLANO_PRIMEIRA_ROTA.md](PLANO_PRIMEIRA_ROTA.md) para decisoes de arquitetura.
