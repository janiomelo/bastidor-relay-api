#!/bin/bash

set -e

RAILWAY_TOKEN="${RAILWAY_TOKEN:-}"
RAILWAY_PROJECT_ID="${RAILWAY_PROJECT_ID:-}"

if [ -z "$RAILWAY_TOKEN" ] || [ -z "$RAILWAY_PROJECT_ID" ]; then
  echo "Erro: Defina RAILWAY_TOKEN e RAILWAY_PROJECT_ID"
  exit 1
fi

echo "Fazendo deploy manual para Railway..."
echo ""

echo "1. Validando Dockerfile..."
docker build --dry-run . > /dev/null
echo "   ✓ Dockerfile válido"
echo ""

echo "2. Buildando imagem local..."
docker build -t bastidor-relay:latest .
echo "   ✓ Build completo"
echo ""

echo "3. Fazendo push para GitHub Container Registry..."
echo "   Nota: Configure credenciais antes:"
echo "   echo \$GITHUB_TOKEN | docker login ghcr.io -u \$GITHUB_USERNAME --password-stdin"
echo ""

docker push ghcr.io/$GITHUB_REPOSITORY:latest || echo "   ⚠ Push opcional, Railway vai buildar via GitHub"
echo ""

echo "4. Triggerando deploy no Railway..."
railway up --service api --environment production
echo "   ✓ Deploy iniciado!"
echo ""

echo "5. Aguardando deploy..."
sleep 10
echo "   Verificando healthcheck..."

if curl -f https://bastidor-relay.railway.app/saude > /dev/null 2>&1; then
  echo "   ✓ API respondendo!"
  curl https://bastidor-relay.railway.app/saude | jq .
else
  echo "   ⚠ API ainda não respondendo, aguarde alguns segundos"
fi

echo ""
echo "Deploy completo!"
