# Multi-stage build para otimizar tamanho da imagem final

# Stage 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package.json ./

# Instalar dependências (incluindo devDependencies necessárias para build)
RUN npm install

# Copiar código fonte
COPY . .

# Build args para variáveis de ambiente (Vite precisa em build-time)
ARG VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8
ENV VITE_BASE44_APP_ID=$VITE_BASE44_APP_ID

# Build da aplicação
RUN npm run build

# Stage 2: Servir aplicação com Nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de entrada customizado
COPY docker-entrypoint.sh /docker-entrypoint-custom.sh
RUN chmod +x /docker-entrypoint-custom.sh

# Variável de ambiente padrão para desenvolvimento local (Docker Compose)
# No EasyPanel, configure BACKEND_URL com a URL do seu backend
# Exemplo: BACKEND_URL=http://moneynow-backend:3001
# Ou use a URL externa: BACKEND_URL=https://api.seu-dominio.com
ENV BACKEND_URL=http://backend:3001

# Instalar wget e sed para healthcheck e substituição
RUN apk add --no-cache wget sed

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Usar script de entrada customizado
ENTRYPOINT ["/docker-entrypoint-custom.sh"]
CMD ["nginx", "-g", "daemon off;"]
