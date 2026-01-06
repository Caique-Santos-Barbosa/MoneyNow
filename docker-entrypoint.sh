#!/bin/sh
set -e

echo "🚀 Iniciando docker-entrypoint customizado..."

# Substituir BACKEND_URL no nginx.conf ANTES de qualquer validação do Nginx
# Isso deve acontecer antes do entrypoint padrão do Nginx validar a configuração
if [ -n "$BACKEND_URL" ]; then
  # Remover https:// duplicado se existir
  BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|https://https://|https://|g')
  BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|http://http://|http://|g')
  
  # Remover barra final se existir
  BACKEND_URL=$(echo "$BACKEND_URL" | sed 's|/$||')
  
  echo "🔧 Configurando BACKEND_URL: $BACKEND_URL"
  
  # Verificar se o arquivo de configuração existe
  if [ ! -f /etc/nginx/conf.d/default.conf ]; then
    echo "❌ ERRO: Arquivo /etc/nginx/conf.d/default.conf não encontrado!"
    exit 1
  fi
  
  # Substituir a URL do backend no arquivo de configuração
  # Substituir a variável $backend_upstream que será usada pelo proxy_pass
  sed -i "s|set \$backend_upstream http://backend:3001;|set \$backend_upstream $BACKEND_URL;|g" /etc/nginx/conf.d/default.conf
  
  # Verificar se a substituição foi bem-sucedida
  if grep -q "set \$backend_upstream $BACKEND_URL" /etc/nginx/conf.d/default.conf; then
    echo "✅ BACKEND_URL configurado com sucesso: $BACKEND_URL"
    echo "📋 Verificação da configuração:"
    grep "set \$backend_upstream" /etc/nginx/conf.d/default.conf || true
  else
    echo "⚠️  AVISO: Não foi possível verificar a substituição da URL"
  fi
else
  echo "⚠️  BACKEND_URL não definido, usando padrão: http://backend:3001"
  echo "💡 Dica: Configure a variável BACKEND_URL no EasyPanel para o serviço do frontend"
fi

# Executar o entrypoint padrão do nginx (que valida e inicia o Nginx)
echo "🔄 Iniciando Nginx..."
exec /docker-entrypoint.sh "$@"
