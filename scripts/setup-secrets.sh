#!/bin/bash

set -e

echo "Criando arquivo .gitignore.secrets para não commitar dados sensíveis..."

cat > .gitignore.secrets << 'EOF'
# Terraform
terraform.tfvars
terraform/.terraform/
terraform/.terraform.lock.hcl
terraform/tfplan
terraform/terraform.tfstate
terraform/terraform.tfstate.backup

# Secrets
.env
.env.local
.env.production
.env.*.local

# Railway
.railway/
EOF

echo "✓ Arquivo criado"
echo ""
echo "Lembrete: Nunca commite:"
echo "  - terraform.tfvars (contém senhas)"
echo "  - .env production (contém API tokens)"
echo "  - GitHub secrets (deixar apenas no GitHub Actions)"
echo ""
echo "Use GitHub Secrets para armazenar dados sensíveis:"
echo "  https://github.com/seu-usuario/bastidor-relay-api/settings/secrets/actions"
