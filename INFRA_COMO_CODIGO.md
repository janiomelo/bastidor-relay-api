# Deploy no Railway: Tudo em Código

Toda infraestrutura de produção está versionada neste repositório usando **Terraform** + **GitHub Actions**.

## Fluxo

```
Commit → Push main → GitHub Actions → Test → Build Docker → Deploy no Railway
```

## Arquivos Importantes

- **terraform/** — Declaração da infraestrutura (PostgreSQL, API Service, integrações)
- **.github/workflows/deploy.yml** — CI/CD automático: testes, build, deploy
- **railway.toml** — Configuração nativa do Railway
- **scripts/setup-railway.sh** — Setup guiado de chaves e Terraform
- **scripts/deploy-manual.sh** — Deploy manual sob demanda
- **scripts/setup-secrets.sh** — Configuração de segredos

## Pré-requisitos

- [ ] Conta Railway (https://railway.app)
- [ ] Terraform instalado (https://www.terraform.io/downloads)
- [ ] GitHub account com este repo
- [ ] Cloudflare R2 (para armazenamento) ou AWS S3

## Setup Inicial (Uma Vez)

### 1. Executar Setup Guiado

```bash
bash scripts/setup-railway.sh
```

Isso vai:
- Pedir seus tokens (Railway API, GitHub)
- Pedir config do S3 (Cloudflare R2)
- Criar arquivo `terraform/terraform.tfvars` com seus dados
- Executar `terraform init` e `terraform plan`
- Mostrar o que vai ser criado
- Pedir confirmação
- **Criar automaticamente:**
  - Projeto no Railway
  - PostgreSQL gerenciado
  - API Service
  - Integrações entre eles

### 2. Configurar GitHub Secrets

Após o script terminar, ele vai mostrar os valores para copiar em:
```
https://github.com/SEU_USUARIO/bastidor-relay-api/settings/secrets/actions
```

Adicione:
- `RAILWAY_API_TOKEN`
- `RAILWAY_PROJECT_ID`
- `RAILWAY_SERVICE_DOMAIN`

### 3. Fazer Push do Código

```bash
git add -A
git commit -m "Infra como codigo: Terraform + Railway + GitHub Actions"
git push origin main
```

GitHub Actions vai automaticamente:
1. Rodar testes
2. Compilar Docker
3. Fazer push para GitHub Container Registry
4. Disparar deploy no Railway
5. Validar healthcheck

## Deploy Normal (Depois que tá setup)

Agora é só commitar e fazer push:

```bash
git push origin main
```

GitHub Actions cuida de tudo automaticamente. Você vai ver o progresso em:
```
https://github.com/SEU_USUARIO/bastidor-relay-api/actions
```

## Deploy Manual (Emergência)

Se precisar fazer deploy manual sem passar por GitHub:

```bash
export RAILWAY_TOKEN="seu_token"
export RAILWAY_PROJECT_ID="seu_project_id"
bash scripts/deploy-manual.sh
```

## Checagem de Status

```bash
# Ver URL da API em produção
terraform output api_url

# Ver connection string do banco
terraform output postgres_connection_string

# Healthcheck
curl https://SEU_SERVICE_NAME.railway.app/saude
curl https://SEU_SERVICE_NAME.railway.app/saude/detalhe
```

## Estrutura Terraform

```
terraform/
├── main.tf           # Recurso principal: project, environment
├── providers.tf      # PostgreSQL, API Service, integrações
├── variables.tf      # Variáveis sensíveis (S3, etc)
└── terraform.tfvars  # Valores (NÃO commitar)
```

Cada recurso é:
- Declarativo (você descreve o que quer)
- Idempotente (rodar 2x = mesmo resultado)
- Versionado (no git)
- Facilmente reproducível

## Secrets & Segurança

**Nunca commitar:**
- `terraform.tfvars`
- `.env.production`
- Qualquer token ou senha

**Usar GitHub Secrets para:**
- `RAILWAY_API_TOKEN`
- `RAILWAY_PROJECT_ID`
- `RAILWAY_SERVICE_DOMAIN`

GitHub Actions injeta esses valores automaticamente nos workflows.

## Rollback

Se precisar voltar:

```bash
git revert <commit_ruim>
git push origin main
```

GitHub Actions vai automatically:
1. Detectar revert
2. Rodar tests
3. Build nova imagem
4. Deploy versão anterior

## Troubleshooting

**"Terraform apply falhou"**
- Valide terraform.tfvars está correto
- Verifique tokens do Railway e GitHub
- Rode `terraform destroy` se precisar limpar e começar de novo

**"Healthcheck timeout"**
- API leva alguns segundos para startar
- Verifique logs no Railway dashboard

**"GitHub Actions falha no deploy"**
- Verifique GitHub Secrets estão settados
- Rode workflow manualmente: Actions > Deploy > Run workflow

## Próximos Passos

1. ✅ Setup inicial e primeiro deploy
2. Configurar alertas no Railway (CPU, RAM, disk)
3. Adicionar backup automático do PostgreSQL
4. Configurar CDN para assets no Cloudflare
5. Adicionar auto-scaling (conforme demanda)

## Links Úteis

- Railway Dashboard: https://railway.app/dashboard
- Terraform Registry: https://registry.terraform.io
- GitHub Actions: https://github.com/SEU_USUARIO/bastidor-relay-api/actions
