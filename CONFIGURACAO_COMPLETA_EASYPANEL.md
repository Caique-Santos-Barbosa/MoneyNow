# 🔧 Configuração Completa do MoneyNow no EasyPanel

## 📋 Informações dos Serviços

### Frontend
- **URL Externa:** https://projetos-pessoais-moneynow.mqtl34.easypanel.host/
- **URL Interna:** http://projetos_pessoais_moneynow:80/

### Backend
- **URL Externa:** https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host/
- **URL Interna:** http://projetos_pessoais_moneynow-backend:80/
- **Porta Interna:** 3001

### Banco de Dados PostgreSQL
- **Host Interno:** `projetos_pessoais_moneynow-db`
- **Porta:** `5432`
- **Usuário:** `moneynow`
- **Senha:** `Gds2024aa@@`
- **Banco:** `moneynow`

---

## 🔧 Configuração do Backend

### Variáveis de Ambiente do Backend

No serviço do **backend** no EasyPanel, configure as seguintes variáveis:

```bash
# Database (use o host interno correto!)
DATABASE_URL=postgresql://moneynow:Gds2024aa@@@projetos_pessoais_moneynow-db:5432/moneynow?schema=public

# JWT
JWT_SECRET=MoneyNow2024JWTSecretKey!@#$%^&*()_+SecureRandomString123456789
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (CORRIGIDO - estava mqt134, deve ser mqtl34)
FRONTEND_URL=https://projetos-pessoais-moneynow.mqtl34.easypanel.host
```

### ⚠️ Correções Necessárias

1. **FRONTEND_URL:** Está com typo `mqt134`, deve ser `mqtl34`
   - ❌ `https://projetos-pessoais-moneynow.mqt134.easypanel.host`
   - ✅ `https://projetos-pessoais-moneynow.mqtl34.easypanel.host`

2. **DATABASE_URL:** Verifique se está usando `postgresql://` (não `postgres://`)
   - ✅ Formato correto: `postgresql://usuario:senha@host:porta/banco?schema=public`

---

## 🔧 Configuração do Frontend

### Variáveis de Ambiente do Frontend

No serviço do **frontend** no EasyPanel, adicione:

```bash
# Backend URL (use o nome do serviço backend)
BACKEND_URL=http://projetos_pessoais_moneynow-backend:3001
```

### ⚠️ IMPORTANTE

- O nome do serviço backend é: `projetos_pessoais_moneynow-backend` (com underscore e hífen)
- A porta do backend é: `3001` (não 80)
- Use a URL interna (não a externa) para comunicação entre serviços

---

## 📝 Passo a Passo

### 1. Configurar Backend

1. Vá para o serviço do **backend** no EasyPanel
2. Vá em **Variáveis de Ambiente**
3. Verifique/corrija as variáveis acima
4. **Corrija o FRONTEND_URL** (mude `mqt134` para `mqtl34`)
5. Clique em **Salvar**

### 2. Configurar Frontend

1. Vá para o serviço do **frontend** no EasyPanel
2. Vá em **Variáveis de Ambiente**
3. Adicione a variável:
   - **Nome:** `BACKEND_URL`
   - **Valor:** `http://projetos_pessoais_moneynow-backend:3001`
4. Clique em **Salvar**

### 3. Verificar Deploy

1. **Backend:**
   - Verifique os logs
   - Deve aparecer: `🚀 Server running on port 3001`
   - Deve aparecer: `✅ Database connection successful!`

2. **Frontend:**
   - Verifique os logs
   - Deve aparecer: `🔧 Configurando BACKEND_URL: http://projetos_pessoais_moneynow-backend:3001`
   - Deve aparecer: `✅ BACKEND_URL configurado com sucesso`

### 4. Testar

1. Acesse: https://projetos-pessoais-moneynow.mqtl34.easypanel.host/
2. Tente fazer registro de uma nova conta
3. Verifique se não há mais erro 502

---

## 🔍 Troubleshooting

### Backend não conecta ao banco

**Erro:** `Error: P1001: Can't reach database server`

**Solução:**
1. Verifique se o `DATABASE_URL` está correto
2. Verifique se o host é `projetos_pessoais_moneynow-db` (com underscore e hífen)
3. Verifique se a senha está correta: `Gds2024aa@@`
4. Verifique se o banco de dados está rodando

### Frontend não conecta ao backend

**Erro:** `502 Bad Gateway`

**Solução:**
1. Verifique se a variável `BACKEND_URL` está configurada no frontend
2. Verifique se o nome do serviço está correto: `projetos_pessoais_moneynow-backend`
3. Verifique se a porta está correta: `3001`
4. Verifique os logs do frontend para ver qual URL está sendo usada

### CORS Error

**Erro:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solução:**
1. Verifique se o `FRONTEND_URL` no backend está correto
2. Deve ser: `https://projetos-pessoais-moneynow.mqtl34.easypanel.host`
3. Faça redeploy do backend após corrigir

---

## ✅ Checklist Final

### Backend
- [ ] `DATABASE_URL` configurada corretamente
- [ ] `JWT_SECRET` configurado
- [ ] `PORT=3001` configurado
- [ ] `FRONTEND_URL` corrigido (mqtl34, não mqt134)
- [ ] Backend está rodando
- [ ] Logs mostram conexão com banco bem-sucedida

### Frontend
- [ ] `BACKEND_URL` configurada
- [ ] URL usa o nome correto do serviço backend
- [ ] Porta está correta (3001)
- [ ] Frontend está rodando
- [ ] Logs mostram BACKEND_URL configurado

### Teste
- [ ] Acesso ao frontend funciona
- [ ] Registro de conta funciona
- [ ] Login funciona
- [ ] Sem erros 502 ou CORS

---

## 📞 URLs de Referência

- **Frontend:** https://projetos-pessoais-moneynow.mqtl34.easypanel.host/
- **Backend:** https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host/
- **Backend Health Check:** https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host/health

