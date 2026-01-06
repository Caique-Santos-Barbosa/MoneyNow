# 🚀 Deploy Completo MoneyNow no EasyPanel

Guia completo para fazer deploy do frontend E backend no EasyPanel.

## 📋 Visão Geral

O MoneyNow precisa de **3 serviços** no EasyPanel:

1. **PostgreSQL** - Banco de dados
2. **Backend API** - Autenticação (Node.js + Express)
3. **Frontend** - Interface React (Nginx)

## 🔧 Passo a Passo Completo

### 1️⃣ Criar Banco de Dados PostgreSQL

1. **EasyPanel** → **"New App"** → **"Database"** → **"PostgreSQL"**
2. Configure:
   - **Nome**: `moneynow-db`
   - **Versão**: `16`
   - **Database**: `moneynow`
   - **User**: `moneynow`
   - **Password**: `AnoteEstaSenha123!` (ou crie uma senha forte)
3. Clique em **"Deploy"**
4. **Anote**: Host interno será `moneynow-db`

### 2️⃣ Criar Backend API

1. **EasyPanel** → **"New App"** → **"App"** → **"Docker"**
2. Configure repositório:
   - **Source**: `GitHub`
   - **Repository**: `Caique-Santos-Barbosa/MoneyNow`
   - **Branch**: `main`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Context**: `backend` ⚠️ **IMPORTANTE**
3. **Porta**:
   - **Interna**: `3001`
   - **Externa**: Auto
4. **Variáveis de Ambiente**:
```env
DATABASE_URL=postgresql://moneynow:AnoteEstaSenha123!@moneynow-db:5432/moneynow?schema=public
JWT_SECRET=seu-jwt-secret-super-seguro-mude-isso-123456789
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://seu-dominio.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=MoneyNow <noreply@moneynow.com>
```
5. **Volume**:
   - **Path**: `/app/uploads`
   - **Type**: `Volume`
6. Clique em **"Deploy"**

### 3️⃣ Criar Frontend

1. **EasyPanel** → **"New App"** → **"App"** → **"Docker"**
2. Configure repositório:
   - **Source**: `GitHub`
   - **Repository**: `Caique-Santos-Barbosa/MoneyNow`
   - **Branch**: `main`
   - **Dockerfile Path**: `Dockerfile` (raiz)
   - **Context**: `.` (ponto)
3. **Porta**:
   - **Interna**: `80`
   - **Externa**: Auto
4. **Variáveis de Ambiente**:
```env
VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8
```
5. **Build Args** (opcional):
```
VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8
```
6. Clique em **"Deploy"**

### 4️⃣ Configurar Nginx do Frontend para Proxy

O `nginx.conf` já está configurado para fazer proxy de `/api` para o backend. Mas você precisa ajustar a URL do backend.

**Opção A: Backend no mesmo projeto (recomendado)**

Se o backend estiver no mesmo projeto do EasyPanel, o nginx já deve funcionar. O proxy está configurado para `http://backend:3001`.

**Opção B: Backend em projeto separado**

Se o backend estiver em outro projeto, você precisa:

1. Obter a URL interna do backend (ex: `http://moneynow-backend:3001`)
2. Atualizar o `nginx.conf`:
```nginx
location /api {
    proxy_pass http://moneynow-backend:3001;
    # ... resto da configuração
}
```

Ou criar um arquivo de configuração específico para EasyPanel.

## 🔗 Ordem de Dependências

1. **PostgreSQL** deve ser criado primeiro
2. **Backend** depende do PostgreSQL
3. **Frontend** depende do Backend

## ✅ Verificação

Após todos os deploys:

1. ✅ PostgreSQL está rodando
2. ✅ Backend está rodando e conectado ao banco
3. ✅ Frontend está rodando
4. ✅ Health check do backend: `http://backend-url/health`
5. ✅ Frontend carrega corretamente
6. ✅ Registro de usuário funciona
7. ✅ Login funciona

## 🔄 Atualizar Nginx para EasyPanel

Se necessário, crie um `nginx.conf` específico para EasyPanel:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Proxy para API backend
    location /api {
        # Use o nome do serviço do backend no EasyPanel
        proxy_pass http://moneynow-backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA - redirecionar todas as rotas para index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Error pages
    error_page 404 /index.html;
}
```

## 🐛 Troubleshooting

### Backend não conecta ao banco

- Verifique se o PostgreSQL está rodando
- Confirme o nome do serviço (deve ser `moneynow-db`)
- Verifique a `DATABASE_URL`

### Frontend não conecta ao backend

- Verifique se o backend está rodando
- Confirme o nome do serviço no nginx.conf
- Teste a URL do backend diretamente

### Erro 502 Bad Gateway

- Backend não está rodando
- Nome do serviço incorreto no nginx
- Porta incorreta

### Migrações não executadas

- Execute manualmente no terminal do backend:
```bash
npx prisma migrate deploy
```

## 📝 Notas Importantes

1. **Nomes dos Serviços**: No EasyPanel, use nomes consistentes:
   - PostgreSQL: `moneynow-db`
   - Backend: `moneynow-backend`
   - Frontend: `moneynow-frontend`

2. **URLs Internas**: Serviços no mesmo projeto se comunicam pelo nome do serviço

3. **Variáveis de Ambiente**: Não exponha senhas em logs

4. **SSL**: Configure HTTPS no EasyPanel para produção

---

**Última atualização**: Guia completo para deploy no EasyPanel.

