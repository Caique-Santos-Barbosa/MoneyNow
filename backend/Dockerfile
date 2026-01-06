# Multi-stage build para otimizar tamanho da imagem final

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl1.1-compat

# Copiar arquivos de dependências
COPY package.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar Prisma Client (usa DATABASE_URL temporária apenas para gerar o client)
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL e PostgreSQL client para aguardar banco
RUN apk add --no-cache openssl1.1-compat postgresql-client

# Instalar apenas dependências de produção
COPY package.json ./
RUN npm install --only=production

# Copiar Prisma
COPY prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/

# Copiar código
COPY src ./src

# Criar pasta de uploads
RUN mkdir -p uploads

# Criar script para aguardar banco estar disponível
RUN echo '#!/bin/sh\n\
set -e\n\
\n\
host="$1"\n\
user="$2"\n\
shift 2\n\
cmd="$@"\n\
\n\
until pg_isready -h "$host" -p 5432 -U "$user"; do\n\
  >&2 echo "PostgreSQL is unavailable - sleeping"\n\
  sleep 2\n\
done\n\
\n\
>&2 echo "PostgreSQL is up - executing command"\n\
exec $cmd' > /wait-for-postgres.sh && chmod +x /wait-for-postgres.sh

# Expor porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar (aguarda banco, executa migrações e inicia servidor)
# A DATABASE_URL real será fornecida via variável de ambiente no runtime
CMD ["sh", "-c", "/wait-for-postgres.sh projetos_pessoais_moneynow-db moneynow npx prisma migrate deploy && node src/server.js"]

