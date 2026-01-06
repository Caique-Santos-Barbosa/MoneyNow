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

# Copiar configuração do nginx como template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Variável de ambiente padrão para desenvolvimento local (Docker Compose)
# No EasyPanel, configure BACKEND_URL com a URL do seu backend
# Exemplo: BACKEND_URL=http://moneynow-backend:3001
ENV BACKEND_URL=http://backend:3001

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx (o nginx:alpine já processa templates automaticamente)
CMD ["nginx", "-g", "daemon off;"]
