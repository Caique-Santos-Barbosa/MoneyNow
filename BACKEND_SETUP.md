# 🚀 Guia de Configuração do Backend

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL instalado e rodando
- npm ou yarn

## 🔧 Configuração Local

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e configure:

```bash
cp env.example .env
```

Edite o `.env` com suas configurações:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/moneynow?schema=public"
JWT_SECRET="sua-chave-secreta-super-segura"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Email (opcional - para recuperação de senha)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="MoneyNow <noreply@moneynow.com>"
```

### 3. Configurar Banco de Dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar banco de dados (se ainda não existir)
createdb moneynow

# Executar migrações
npm run prisma:migrate
```

### 4. Iniciar Servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 🐳 Configuração com Docker

### Opção 1: Docker Compose (Recomendado)

Na raiz do projeto:

```bash
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL (porta 5432)
- Backend API (porta 3001)
- Frontend (porta 3000)

### Opção 2: Docker Individual

```bash
cd backend

# Build
docker build -t moneynow-backend .

# Run
docker run -p 3001:3001 --env-file .env moneynow-backend
```

## 📡 Endpoints da API

### Autenticação

- **POST** `/api/auth/register` - Registrar novo usuário
  ```json
  {
    "name": "Nome Completo",
    "email": "email@example.com",
    "password": "SenhaSegura123",
    "cpf": "12345678900" // opcional
  }
  ```

- **POST** `/api/auth/login` - Login
  ```json
  {
    "email": "email@example.com",
    "password": "SenhaSegura123",
    "rememberMe": false // opcional
  }
  ```

- **GET** `/api/auth/me` - Obter usuário atual (requer token)
  ```
  Headers: Authorization: Bearer <token>
  ```

- **POST** `/api/auth/forgot-password` - Solicitar recuperação
  ```json
  {
    "email": "email@example.com"
  }
  ```

- **POST** `/api/auth/validate-reset-token` - Validar token
  ```json
  {
    "token": "uuid-token"
  }
  ```

- **POST** `/api/auth/reset-password` - Redefinir senha
  ```json
  {
    "token": "uuid-token",
    "password": "NovaSenhaSegura123"
  }
  ```

### Health Check

- **GET** `/health` - Status do servidor

## 🔐 Segurança

- Senhas são hasheadas com bcrypt (10 rounds)
- Tokens JWT com expiração configurável
- Tokens de reset expiram em 1 hora
- Validação de senha forte (mínimo 8 caracteres, maiúscula, minúscula, número)
- CORS configurado para aceitar apenas o frontend

## 📧 Email

Em modo desenvolvimento, se SMTP não estiver configurado, os links de recuperação serão logados no console.

Para produção, configure SMTP com suas credenciais.

## 🗄️ Banco de Dados

O Prisma gerencia o schema do banco. Para fazer alterações:

1. Edite `prisma/schema.prisma`
2. Execute `npm run prisma:migrate` para criar uma nova migração
3. Execute `npm run prisma:generate` para atualizar o Prisma Client

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando
- Confirme a `DATABASE_URL` no `.env`
- Teste a conexão: `psql $DATABASE_URL`

### Erro ao gerar Prisma Client
```bash
npm run prisma:generate
```

### Erro de migração
```bash
npm run prisma:migrate
```

### Porta já em uso
Altere a `PORT` no `.env` ou pare o processo que está usando a porta 3001

## 📝 Notas Importantes

- O backend gerencia **apenas autenticação**
- Dados financeiros (contas, transações, etc.) são gerenciados pelo **Base44 SDK** no frontend
- O frontend faz requisições para `/api/auth/*` que são proxyadas para o backend
- Em produção, configure variáveis de ambiente seguras

