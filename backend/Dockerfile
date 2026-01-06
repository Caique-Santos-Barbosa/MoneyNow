# Multi-stage build para otimizar tamanho da imagem final

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install

# Gerar Prisma Client
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

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

# Expor porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar (executa migrações antes de iniciar)
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]

