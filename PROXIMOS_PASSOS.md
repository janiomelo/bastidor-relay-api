# 🚀 Próximos Passos: Do Local para Produção (Railway)

## O que foi criado:

✅ **Terraform** (IaC) — provisiona PostgreSQL + API + integrações no Railway  
✅ **GitHub Actions** — CI/CD automático: test → build Docker → deploy  
✅ **Scripts auxiliares** — setup guiado e deploy manual  
✅ **Segurança** — GitHub Secrets, terraform.tfvars no .gitignore  

## Para colocar em produção, são 3 passos:

### 1️⃣ Executar Setup (5 minutos)

```bash
bash scripts/setup-railway.sh
```

O script vai pedir:
- **Railway API Token** (gera em https://railway.app/account/tokens)
- **GitHub Personal Token** (gera em https://github.com/settings/tokens/new)
- **Cloudflare R2 credentials** (account ID, access key, secret key, nome do bucket)
- **GitHub username**

Isso vai criar toda infraestrutura via Terraform.

### 2️⃣ Configurar GitHub Secrets (2 minutos)

Após o script, ele vai exibir 3 valores para copiar em:
```
https://github.com/SEU_USUARIO/bastidor-relay-api/settings/secrets/actions
```

### 3️⃣ Fazer Push (30 segundos)

```bash
git push origin main
```

Pronto. GitHub Actions vai:
- ✓ Rodar testes
- ✓ Compilar Docker
- ✓ Fazer deploy automático
- ✓ Validar healthcheck

Você vai ver o progress em: `https://github.com/SEU_USUARIO/bastidor-relay-api/actions`

## Documentação Completa:

- **[INFRA_COMO_CODIGO.md](INFRA_COMO_CODIGO.md)** — Tudo sobre Terraform + GitHub Actions
- **[DEPLOY_PRODUCAO.md](DEPLOY_PRODUCAO.md)** — Checklist de deploy (preenchida conforme avançar)
- **[COMO_INICIAR.md](COMO_INICIAR.md)** — Setup local com docker-compose

## Arquitetura Atual

```
┌─────────────────────────────────────────────┐
│         GitHub (este repositório)           │
│  ┌─────────────────────────────────────┐    │
│  │   .github/workflows/deploy.yml      │    │
│  │  (CI/CD: test → build → deploy)     │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │   terraform/                        │    │
│  │  (IaC: PostgreSQL + API + integrações)  │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
              ↓ push main
┌─────────────────────────────────────────────┐
│      GitHub Actions (CI/CD Pipeline)        │
│  1. npm test (testes passam?)               │
│  2. docker build (compila Dockerfile)       │
│  3. docker push (envia para registry)       │
│  4. railway deploy (dispara atualização)    │
│  5. curl /saude (valida healthcheck)        │
└─────────────────────────────────────────────┘
              ↓ deploy success
┌─────────────────────────────────────────────┐
│         Railway (Produção)                  │
│  ┌──────────────┐    ┌──────────────────┐   │
│  │  Node.js API │    │  PostgreSQL 16   │   │
│  │   (Fastify)  │←→→→│  (gerenciado)     │   │
│  └──────────────┘    └──────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  Cloudflare R2 (produção)             │   │
│  │  MinIO (desenvolvimento local)        │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Tudo Está em Código

Não há cliques no console. Tudo é:
- **Versionado** (no git)
- **Reproducível** (rodar setup de novo = mesmo resultado)
- **Auditável** (quem mudou quê, quando)
- **Reversível** (git revert leva para versão anterior)

## Custos

Railway oferece plano **Hobby** (gratuito até certos limites):
- PostgreSQL: incluído
- API Node.js: incluído
- Cloudflare R2: gratuito até 10 GB/mês, depois ~$0.015/GB

Depois você escala conforme necessário.

---

**Dúvidas?** Rode `bash scripts/setup-railway.sh` e veja as instruções passo-a-passo.
