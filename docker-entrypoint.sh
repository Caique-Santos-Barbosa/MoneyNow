#!/bin/sh
set -e

# Substituir BACKEND_URL no nginx.conf se a variável de ambiente estiver definida
if [ -n "$BACKEND_URL" ]; then
  echo "🔧 Configurando BACKEND_URL: $BACKEND_URL"
  sed -i "s|http://backend:3001|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf
fi

# Executar o entrypoint padrão do nginx
exec /docker-entrypoint.sh "$@"

