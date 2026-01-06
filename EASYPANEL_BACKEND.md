# 🚀 Deploy do Backend no EasyPanel

Guia completo para fazer deploy do backend MoneyNow no EasyPanel.

## 📋 Pré-requisitos

- EasyPanel instalado e rodando
- Acesso ao painel do EasyPanel
- Repositório GitHub configurado
- PostgreSQL disponível (pode ser criado no EasyPanel)

## 🔧 Passo a Passo

### 1. Criar Banco de Dados PostgreSQL

1. No EasyPanel, vá em **"New App"** ou **"Nova Aplicação"**
2. Selecione **"Database"** → **"PostgreSQL"**
3. Configure:
   - **Nome**: `moneynow-db`
   - **Versão**: `16` (ou mais recente)
   - **Database**: `moneynow`
   - **User**: `moneynow`
   - **Password**: (anote esta senha!)
4. Clique em **"Deploy"**
5. **Anote as informações de conexão**:
   - Host interno: `moneynow-db` (nome do serviço)
   - Porta: `5432`
   - Database: `moneynow`
   - User: `moneynow`
   - Password: (a que você criou)

### 2. Criar Aplicação Backend

1. No EasyPanel, vá em **"New App"** ou **"Nova Aplicação"**
2. Selecione **"App"** → **"Docker"**
3. Configure o repositório:
   - **Source**: `GitHub`
   - **Repository**: `Caique-Santos-Barbosa/MoneyNow`
   - **Branch**: `main`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Context**: `backend` (IMPORTANTE: pasta do backend)

### 3. Configurar Build

**Build Settings**:
- **Build Command**: (deixe vazio)
- **Dockerfile Path**: `backend/Dockerfile`
- **Context**: `backend`

**Build Args** (opcional):
```
NODE_ENV=production
```

### 4. Configurar Porta

- **Porta Interna**: `3001`
- **Porta Externa**: Deixe o EasyPanel configurar automaticamente
- **Protocol**: `HTTP`

### 5. Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente:

```env
# Database (use o host interno do PostgreSQL criado no passo 1)
DATABASE_URL=postgresql://moneynow:SUA_SENHA_AQUI@moneynow-db:5432/moneynow?schema=public

# JWT
JWT_SECRET=seu-jwt-secret-super-seguro-mude-isso-em-producao
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (URL do seu frontend no EasyPanel)
FRONTEND_URL=https://seu-dominio.com

# Email (opcional - para recuperação de senha)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=MoneyNow <noreply@moneynow.com>
```

**⚠️ IMPORTANTE**:
- Substitua `SUA_SENHA_AQUI` pela senha do PostgreSQL que você criou
- Substitua `seu-dominio.com` pela URL do seu frontend
- Mude o `JWT_SECRET` para algo seguro e único
- Para Gmail, use "Senha de App" (não a senha normal)

### 6. Volumes

Adicione um volume para uploads de fotos:

- **Path**: `/app/uploads`
- **Type**: `Volume` ou `Bind` (recomendado: Volume)

### 7. Health Check

O Dockerfile já inclui healthcheck, mas você pode configurar no EasyPanel:

- **Path**: `/health`
- **Interval**: `30s`
- **Timeout**: `3s`
- **Start Period**: `10s`
- **Retries**: `3`

### 8. Recursos (Resources)

Configurações recomendadas:

- **CPU**: `0.5 - 1 core`
- **RAM**: `512MB - 1GB`
- **Storage**: `2GB` (para uploads)

### 9. Deploy

1. Clique em **"Deploy"** ou **"Deploy Now"**
2. Aguarde o build completar (5-10 minutos na primeira vez)
3. Verifique os logs para garantir que não há erros

### 10. Executar Migrações

Após o deploy, você precisa executar as migrações do Prisma:

1. No EasyPanel, vá para o serviço do backend
2. Clique em **"Terminal"** ou **"Console"**
3. Execute:
```bash
npx prisma migrate deploy
```

Ou configure um comando de inicialização no Dockerfile (já incluído no docker-compose, mas para EasyPanel você pode precisar ajustar).

## 🔗 Conectar Backend ao Frontend

### Opção 1: Usar URL Interna (Recomendado)

No frontend, configure a URL do backend:

1. No serviço do frontend, adicione variável de ambiente:
```env
VITE_API_URL=http://moneynow-backend:3001
```

2. Atualize o frontend para usar essa variável nas requisições.

### Opção 2: Usar URL Externa

Se o backend tiver um domínio próprio, use:
```env
VITE_API_URL=https://api.seu-dominio.com
```

## 📝 Atualizar Frontend para Usar Backend

O frontend já está configurado para fazer requisições para `/api/auth/*`. O nginx do frontend precisa fazer proxy para o backend.

**Se o backend estiver em um serviço separado**, você precisa:

1. Configurar o nginx do frontend para fazer proxy
2. Ou atualizar as URLs no frontend para apontar para o backend

## ✅ Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ Container do backend está rodando
2. ✅ Health check retorna 200 (`/health`)
3. ✅ Logs não mostram erros
4. ✅ Banco de dados está conectado
5. ✅ Migrações foram executadas
6. ✅ Frontend consegue se conectar ao backend

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução**:
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` está correta
- Use o nome do serviço como host (ex: `moneynow-db`)
- Verifique se a senha está correta

### Erro: "Prisma Client not generated"

**Solução**:
- Execute no terminal do container: `npx prisma generate`
- Ou adicione ao Dockerfile (já está incluído)

### Erro: "Migration not applied"

**Solução**:
- Execute no terminal: `npx prisma migrate deploy`
- Verifique se o banco de dados está acessível

### Erro: "Port already in use"

**Solução**:
- Verifique se outro serviço está usando a porta 3001
- Mude a porta no `.env` e no Dockerfile se necessário

### Backend não responde

**Solução**:
- Verifique os logs no EasyPanel
- Confirme que a porta 3001 está exposta
- Teste o health check: `curl http://localhost:3001/health`

## 🔐 Segurança

1. **JWT_SECRET**: Use uma string longa e aleatória
2. **Database Password**: Use senha forte
3. **SMTP**: Não exponha credenciais
4. **HTTPS**: Configure SSL no EasyPanel
5. **CORS**: Já configurado para aceitar apenas o frontend

## 📊 Monitoramento

- Use os logs do EasyPanel para monitorar erros
- Configure alertas se disponível
- Monitore uso de recursos (CPU, RAM)

## 🔄 Atualizações

Para atualizar o backend:

1. Faça push das alterações para o GitHub
2. No EasyPanel, clique em **"Redeploy"**
3. Ou configure **"Auto Deploy"** para deploy automático

---

**Última atualização**: Configurações testadas para EasyPanel com PostgreSQL.

