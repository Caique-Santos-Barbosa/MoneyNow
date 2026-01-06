# Multi-stage build para otimizar tamanho da imagem final

# Stage 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production=false

# Copiar código fonte
COPY . .

# Build args para variáveis de ambiente (Vite precisa em build-time)
ARG VITE_BASE44_APP_ID
ENV VITE_BASE44_APP_ID=$VITE_BASE44_APP_ID

# Build da aplicação
RUN npm run build

# Stage 2: Servir aplicação com Nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]

