# Checklist: Deploy em Produção

## 0. Decisões Pré-Deploy
- [ ] Escolher provedor de hospedagem (Railway confirmado?)
- [ ] Definir domínio/URL base
- [ ] Escolher region (São Paulo recomendado para latência BR)
- [ ] Decidir banco PostgreSQL gerenciado ou container

## 1. Infraestrutura de Banco de Dados
- [ ] Criar instância PostgreSQL em produção
- [ ] Gerar senha forte e segura
- [ ] Configurar backup automático
- [ ] Configurar firewall para aceitar apenas da API

## 2. Storage S3-Compatible
- [ ] Criar bucket em Cloudflare R2 ou MinIO gerenciado
- [ ] Gerar chaves de acesso e segredo
- [ ] Configurar CORS se necessário
- [ ] Configurar retenção/lifecycle policies

## 3. Variáveis de Ambiente
- [ ] Criar arquivo de secrets em produção
- [ ] Cada provider tem forma diferente:
  - Railway: Railway.app Dashboard > Environment
  - Fly.io: flyctl secrets set
  - Docker: --env-file ou secrets

## 4. CI/CD (GitHub Actions)
- [ ] Criar .github/workflows/deploy.yml
- [ ] Testar contra prod database (opcional, usar container de teste)
- [ ] Build Docker
- [ ] Push para registry (GitHub Container Registry, DockerHub)
- [ ] Deploy automático ao merge em main

## 5. Observabilidade Mínima
- [ ] Configurar logs estruturados
- [ ] Adicionar APM (Datadog, New Relic) ou apenas cloudflare logs
- [ ] Alertas básicos (disk, CPU, erros 5xx)

## 6. SSL/HTTPS
- [ ] Certificado SSL (auto com Let's Encrypt ou Cloudflare)
- [ ] Redirecionar HTTP → HTTPS

## 7. Healthcheck em Produção
- [ ] Configurar healthcheck do provider
- [ ] Apontar para GET /saude
- [ ] Configurar restart policy

## 8. Segurança Mínima
- [ ] Rate limiting (implementar @fastify/rate-limit)
- [ ] CORS configurado corretamente
- [ ] Helmet headers (já tem, mas validar)
- [ ] Remover logs sensíveis

## 9. Migrations/Ingestão de Dados
- [ ] Se usar PostgreSQL em produção, criar schema inicial
- [ ] Decidir: rodar migrations automaticamente ou manual?

## 10. Rollback Plan
- [ ] Decidir estratégia (blue-green, canary, instant rollback)
- [ ] Testar rollback em staging

---

## Por Onde Começar (ordem recomendada)

1. **Provisionar Banco PostgreSQL** (pode levar 5-10min)
2. **Provisionar S3 Bucket**
3. **Criar workflow GitHub Actions** (build + test)
4. **Configurar secrets no provider**
5. **Fazer primeiro deploy manual** e testar
6. **Automação:** configurar deploy automático em main

---

## Antes de Commitar
Recomendo criar:
- [ ] `docker-compose.prod.yml` (ou Procfile se Railway)
- [ ] `.github/workflows/deploy.yml`
- [ ] Documentação de como fazer deploy manual

Quer que eu crie essas configurações?
