#!/bin/sh
set -e

# Substituir BACKEND_URL no nginx.conf ANTES de qualquer validação do Nginx
# Isso deve acontecer antes do entrypoint padrão do Nginx validar a configuração
if [ -n "$BACKEND_URL" ]; then
  echo "🔧 Configurando BACKEND_URL: $BACKEND_URL"
  # Substituir a URL do backend no arquivo de configuração
  # Substituir a variável $backend_upstream que será usada pelo proxy_pass
  sed -i "s|set \$backend_upstream http://backend:3001;|set \$backend_upstream $BACKEND_URL;|g" /etc/nginx/conf.d/default.conf
  echo "✅ BACKEND_URL configurado com sucesso: $BACKEND_URL"
else
  echo "⚠️  BACKEND_URL não definido, usando padrão: http://backend:3001"
fi

# Executar o entrypoint padrão do nginx (que valida e inicia o Nginx)
exec /docker-entrypoint.sh "$@"
