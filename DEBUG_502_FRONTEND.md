# 🔍 Debug: Erro 502 no Frontend

## Problema
O frontend está recebendo erro 502 ao tentar fazer requisições para `/api/auth/register`, mesmo que o backend esteja funcionando.

## Diagnóstico

### 1. Verificar Variável BACKEND_URL no Frontend

**No EasyPanel:**
1. Vá para o serviço do **frontend**
2. Vá em **Variáveis de Ambiente**
3. Verifique se existe a variável:
   - **Nome:** `BACKEND_URL`
   - **Valor:** `http://projetos_pessoais_moneynow-backend:3001`

### 2. Verificar Logs do Frontend

Nos logs do frontend, você deve ver:
```
🔧 Configurando BACKEND_URL: http://projetos_pessoais_moneynow-backend:3001
✅ BACKEND_URL configurado com sucesso: http://projetos_pessoais_moneynow-backend:3001
```

**Se NÃO aparecer essa mensagem:**
- A variável `BACKEND_URL` não está configurada
- Ou o script não está sendo executado

### 3. Verificar Nome do Serviço Backend

O nome do serviço backend deve ser **exatamente**:
- `projetos_pessoais_moneynow-backend` (com underscore e hífen)

**Como verificar:**
1. Vá para o serviço do backend no EasyPanel
2. Veja o nome exato do serviço (geralmente no topo da página)
3. Use esse nome exato na variável `BACKEND_URL`

### 4. Testar URL Interna

Se a URL interna não funcionar, tente usar a URL externa temporariamente:

**No frontend, configure:**
```
BACKEND_URL=https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
```

Isso ajuda a identificar se o problema é de rede interna ou configuração.

## Soluções

### Solução 1: Configurar BACKEND_URL (Mais Provável)

1. **No EasyPanel, vá para o serviço do frontend**
2. **Vá em Variáveis de Ambiente**
3. **Adicione/Atualize:**
   - **Nome:** `BACKEND_URL`
   - **Valor:** `http://projetos_pessoais_moneynow-backend:3001`
4. **Salve e faça redeploy do frontend**

### Solução 2: Usar URL Externa (Temporário)

Se a URL interna não funcionar:

1. **No frontend, configure:**
   ```
   BACKEND_URL=https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
   ```
2. **Salve e faça redeploy**

### Solução 3: Verificar Nome do Serviço

1. **Verifique o nome exato do serviço backend no EasyPanel**
2. **Use esse nome exato na variável BACKEND_URL**
3. **Diferenças entre underscore (`_`) e hífen (`-`) importam!**

## Verificação Passo a Passo

### Passo 1: Verificar Variável
```
✅ BACKEND_URL está configurada no frontend?
✅ O valor está correto?
✅ O nome do serviço está correto?
```

### Passo 2: Verificar Logs
```
✅ Logs do frontend mostram "Configurando BACKEND_URL"?
✅ Logs mostram a URL correta?
```

### Passo 3: Verificar Backend
```
✅ Backend está rodando?
✅ Health check funciona: /health
✅ Backend está na porta 3001?
```

### Passo 4: Testar Comunicação
```
✅ Frontend consegue acessar backend diretamente?
✅ Nginx está fazendo proxy corretamente?
```

## Checklist de Correção

- [ ] Variável `BACKEND_URL` configurada no frontend
- [ ] Nome do serviço backend está correto
- [ ] Porta está correta (3001)
- [ ] Logs do frontend mostram BACKEND_URL configurado
- [ ] Frontend foi redeployado após configurar variável
- [ ] Backend está rodando e acessível

## Próximos Passos

1. **Configure a variável `BACKEND_URL` no frontend**
2. **Faça redeploy do frontend**
3. **Verifique os logs do frontend**
4. **Teste novamente o registro**

