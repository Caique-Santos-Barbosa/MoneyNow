# 🔧 Configuração do MoneyNow no EasyPanel

## URLs dos Serviços

### Frontend
- **URL Externa:** https://projetos-pessoais-moneynow.mqtl34.easypanel.host/
- **URL Interna:** http://projetos_pessoais_moneynow:80/

### Backend
- **URL Externa:** https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host/
- **URL Interna:** http://projetos_pessoais_moneynow-backend:80/

## ⚠️ IMPORTANTE: Configurar BACKEND_URL no Frontend

O frontend precisa saber como se comunicar com o backend. Siga estes passos:

### Passo 1: Identificar o Nome do Serviço Backend

No EasyPanel, o nome do serviço backend pode ser:
- `projetos_pessoais_moneynow-backend` (com underscore e hífen)
- `projetos-pessoais-moneynow-backend` (apenas hífens)

**Como verificar:**
1. Vá para o serviço do **backend** no EasyPanel
2. Veja o nome exato do serviço (geralmente aparece no topo da página ou na URL)
3. Anote o nome exato

### Passo 2: Configurar Variável de Ambiente no Frontend

1. No EasyPanel, vá para o serviço do **frontend**
2. Vá em **Variáveis de Ambiente** ou **Environment Variables**
3. Adicione/atualize a variável:
   - **Nome:** `BACKEND_URL`
   - **Valor:** `http://NOME_DO_SERVICO_BACKEND:3001`
   
   **Exemplos:**
   - Se o nome for `projetos_pessoais_moneynow-backend`:
     ```
     BACKEND_URL=http://projetos_pessoais_moneynow-backend:3001
     ```
   - Se o nome for `projetos-pessoais-moneynow-backend`:
     ```
     BACKEND_URL=http://projetos-pessoais-moneynow-backend:3001
     ```

### Passo 3: Verificar Porta do Backend

⚠️ **IMPORTANTE:** O backend deve estar escutando na porta **3001**, não 80.

Verifique nos logs do backend se aparece:
```
🚀 Server running on port 3001
```

Se o backend estiver na porta 80, você precisa:
1. Verificar a variável `PORT` no backend (deve ser `3001`)
2. Ou ajustar a URL para usar a porta correta

### Passo 4: Redeploy do Frontend

Após configurar a variável:
1. **Salve** as configurações
2. Faça **redeploy** do frontend (ou aguarde o deploy automático)
3. Verifique os **logs** do frontend

### Passo 5: Verificar Logs

Nos logs do frontend, você deve ver:
```
🔧 Configurando BACKEND_URL: http://projetos_pessoais_moneynow-backend:3001
✅ BACKEND_URL configurado com sucesso: http://projetos_pessoais_moneynow-backend:3001
```

## 🔍 Troubleshooting

### Erro 502 Bad Gateway

Se ainda receber erro 502:

1. **Verifique se o backend está rodando:**
   - Vá para o serviço do backend
   - Verifique os logs
   - Deve aparecer: `🚀 Server running on port 3001`

2. **Verifique o nome do serviço:**
   - O nome deve ser **exatamente** como aparece no EasyPanel
   - Diferenças entre underscore (`_`) e hífen (`-`) importam

3. **Teste a URL interna:**
   - Tente usar a URL externa do backend temporariamente:
     ```
     BACKEND_URL=https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
     ```
   - Isso ajuda a identificar se o problema é de rede interna

4. **Verifique a porta:**
   - Confirme que o backend está na porta 3001
   - Se estiver em outra porta, ajuste a URL

### Backend não responde

Se o backend não estiver respondendo:

1. Verifique os logs do backend
2. Verifique se o backend conseguiu conectar ao banco de dados
3. Verifique se as migrações do Prisma foram executadas
4. Verifique se a variável `DATABASE_URL` está configurada corretamente

## 📝 Resumo da Configuração

### Frontend (Variáveis de Ambiente)
```
BACKEND_URL=http://projetos_pessoais_moneynow-backend:3001
```

### Backend (Variáveis de Ambiente)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=seu-jwt-secret-aqui
PORT=3001
FRONTEND_URL=https://projetos-pessoais-moneynow.mqtl34.easypanel.host
```

## ✅ Checklist Final

- [ ] Backend está rodando (status: Running)
- [ ] Frontend está rodando (status: Running)
- [ ] Variável `BACKEND_URL` configurada no frontend
- [ ] Nome do serviço backend está correto na URL
- [ ] Porta do backend está correta (3001)
- [ ] Logs do frontend mostram a URL sendo configurada
- [ ] Logs do backend mostram servidor rodando na porta 3001
- [ ] Teste de registro/login funciona

