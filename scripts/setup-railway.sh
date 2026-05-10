#!/bin/bash

set -e

echo "=== Setup Infraestrutura Railway com Terraform ==="
echo ""
echo "Pré-requisitos:"
echo "  ✓ Terraform instalado (https://www.terraform.io/downloads)"
echo "  ✓ Railway CLI instalado (npm install -g @railway/cli)"
echo "  ✓ GitHub account com token (Settings > Developer settings > Personal access tokens)"
echo ""
echo "Passos:"
echo ""

echo "1. Gerar Railway API Token"
echo "   Acesse: https://railway.app/account/tokens"
echo "   Crie um novo token e anote o valor"
echo ""

echo "2. Gerar GitHub Personal Access Token"
echo "   Acesse: https://github.com/settings/tokens/new"
echo "   Scopes: repo, read:user"
echo "   Anote o valor"
echo ""

echo "3. Configurar Cloudflare R2 (ou S3)"
echo "   Se R2: https://dash.cloudflare.com/profile/api-tokens"
echo "   Gere access key + secret"
echo "   Anote endpoint e bucket name"
echo ""

echo "4. Copiar e editar terraform.tfvars"
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
echo "   Abra terraform/terraform.tfvars e preencha os valores"
echo ""

echo "5. Inicializar Terraform"
cd terraform
terraform init
echo "   ✓ Terraform inicializado"
echo ""

echo "6. Validar configuração"
terraform validate
echo "   ✓ Configuração validada"
echo ""

echo "7. Visualizar plano de deploy"
terraform plan -out=tfplan
echo ""

echo "8. Aplicar infraestrutura"
read -p "Pressione ENTER para confirmar deploy (Ctrl+C para cancelar)..."
terraform apply tfplan
echo "   ✓ Infraestrutura criada!"
echo ""

echo "9. Configurar GitHub Secrets"
echo "   Vá para: https://github.com/seu-usuario/bastidor-relay-api/settings/secrets/actions"
echo "   Adicione os seguintes secrets:"
echo ""
echo "   RAILWAY_API_TOKEN = <seu_railway_api_token>"
echo "   RAILWAY_PROJECT_ID = $(terraform output -raw project_id)"
echo "   RAILWAY_SERVICE_DOMAIN = $(terraform output -raw api_url | sed 's|https://||')"
echo ""

echo "10. Fazer push do código"
echo "    git add -A"
echo "    git commit -m 'Infraestrutura como codigo: Terraform + GitHub Actions'"
echo "    git push origin main"
echo ""
echo "    GitHub Actions vai:"
echo "    → Rodar testes"
echo "    → Buildar Docker image"
echo "    → Fazer deploy automático no Railway"
echo ""

echo "=== Setup completo! ==="
