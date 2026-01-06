# 🔍 Debug Final: Erro 502 no Registro

## ✅ Progresso
- ✅ Frontend está funcionando (não é mais 404)
- ❌ Ainda dá erro 502 ao tentar registrar

## 🔍 Diagnóstico

O erro 502 significa que o Nginx do frontend não consegue se comunicar com o backend.

### Verificações Necessárias

#### 1. Verificar BACKEND_URL no Frontend

**No EasyPanel:**
1. Vá para o serviço do **frontend** (`moneynow-frontend`)
2. Vá em **"Ambiente"** → **"Variáveis de Ambiente"**
3. Verifique se existe:
   ```
   BACKEND_URL=https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
   ```
   
   ⚠️ **IMPORTANTE:** Deve ser `mqtl34` (com 'l'), não `mqt134` (com '1')!

#### 2. Verificar Logs do Frontend

Após verificar a variável, veja os logs do frontend. Você deve ver:

```
🔧 Configurando BACKEND_URL: https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
✅ BACKEND_URL configurado com sucesso: https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
```

**Se NÃO aparecer essa mensagem:**
- A variável não está configurada
- Ou o nome está incorreto

#### 3. Testar Backend Diretamente

Teste se o backend está acessível:

1. Acesse: https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host/health
2. Deve retornar: `{"status":"ok", "timestamp":"..."}`

**Se não funcionar:**
- O backend pode não estar rodando
- Ou a URL está incorreta

#### 4. Verificar Nome do Serviço Backend

O nome do serviço backend pode ser:
- `moneynow-backend` (sem prefixo)
- `projetos_pessoais_moneynow-backend` (com prefixo)

**Como verificar:**
1. Vá para o serviço do backend no EasyPanel
2. Veja o nome exato do serviço
3. Use esse nome na URL interna (se usar URL interna)

## 🔧 Soluções

### Solução 1: Verificar e Corrigir BACKEND_URL

1. **No EasyPanel, vá para o serviço do frontend**
2. **Vá em "Ambiente" → "Variáveis de Ambiente"**
3. **Verifique se existe:**
   ```
   BACKEND_URL=https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
   ```
4. **Se não existir ou estiver incorreto:**
   - Adicione/Corrija a variável
   - Certifique-se que é `mqtl34` (com 'l'), não `mqt134`
5. **Salve e faça redeploy do frontend**

### Solução 2: Usar URL Interna (Alternativa)

Se a URL externa não funcionar, tente a URL interna:

```
BACKEND_URL=http://moneynow-backend:3001
```

Ou:

```
BACKEND_URL=http://projetos_pessoais_moneynow-backend:3001
```

**Depende do nome exato do serviço backend no EasyPanel.**

### Solução 3: Verificar Backend

1. **Verifique se o backend está rodando:**
   - EasyPanel → Serviço backend → Verificar status
   - Deve estar "Running"

2. **Verifique os logs do backend:**
   - Deve aparecer: `🚀 Server running on port 3001`

3. **Teste o health check:**
   - https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host/health
   - Deve retornar JSON com status "ok"

## 📝 Checklist

- [ ] BACKEND_URL configurada no frontend
- [ ] URL está correta (`mqtl34` não `mqt134`)
- [ ] Frontend foi redeployado após configurar variável
- [ ] Logs do frontend mostram BACKEND_URL configurado
- [ ] Backend está rodando
- [ ] Health check do backend funciona
- [ ] Teste de registro funciona

## 🎯 Próximos Passos

1. **Verifique a variável BACKEND_URL no frontend**
2. **Corrija se necessário** (especialmente o `mqtl34`)
3. **Faça redeploy do frontend**
4. **Verifique os logs**
5. **Teste o registro novamente**

