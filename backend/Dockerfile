# Multi-stage build para otimizar tamanho da imagem final
# Usando node:20 (Debian) em vez de Alpine para compatibilidade com Prisma/OpenSSL

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar Prisma Client (usa DATABASE_URL temporária apenas para gerar o client)
# O Prisma precisa de uma URL válida para validar o schema, mas não conecta ao banco
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"
RUN npx prisma generate

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Instalar OpenSSL para Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instalar apenas dependências de produção
COPY package.json ./
RUN npm install --only=production

# Copiar Prisma (incluindo migrações)
COPY prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/

# Copiar código
COPY src ./src

# Criar pasta de uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar (aguarda banco, executa migrações e inicia servidor)
# A DATABASE_URL real será fornecida via variável de ambiente no runtime
CMD ["sh", "-c", "node src/wait-for-db.js && npx prisma migrate deploy && node src/server.js"]
