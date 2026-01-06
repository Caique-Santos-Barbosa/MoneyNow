# MoneyNow Backend API

Backend API para autenticação e gerenciamento de usuários do MoneyNow.

## 🚀 Tecnologias

- **Node.js 20+** - Runtime
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Nodemailer** - Envio de emails

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL
- npm ou yarn

## 🛠️ Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. Configurar banco de dados:
```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrações
npm run prisma:migrate
```

4. Iniciar servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📡 Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual (protegido)
- `POST /api/auth/forgot-password` - Solicitar recuperação de senha
- `POST /api/auth/validate-reset-token` - Validar token de reset
- `POST /api/auth/reset-password` - Redefinir senha

### Health Check

- `GET /health` - Status do servidor

## 🔐 Variáveis de Ambiente

Veja `.env.example` para todas as variáveis necessárias.

## 🐳 Docker

```bash
# Build
docker build -t moneynow-backend .

# Run
docker run -p 3001:3001 --env-file .env moneynow-backend
```

## 📝 Notas

- O backend gerencia apenas autenticação
- Dados financeiros são gerenciados pelo Base44 SDK no frontend
- Em desenvolvimento, emails são logados no console se SMTP não estiver configurado

