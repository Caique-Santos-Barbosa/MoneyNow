# 🔧 Troubleshooting: Erro 502 Bad Gateway

## Problema
O frontend está recebendo erro **502 Bad Gateway** ao tentar se comunicar com o backend através do Nginx.

## Causas Possíveis

### 1. Backend não está rodando
O backend pode não estar iniciado ou pode ter falhado ao iniciar.

**Solução:**
1. No EasyPanel, vá para o serviço do **backend**
2. Verifique os **logs** do backend
3. Verifique se o backend está com status **Running**
4. Se não estiver rodando, verifique os logs para identificar o erro

### 2. URL do backend incorreta no Nginx
O Nginx pode estar tentando se conectar a uma URL incorreta do backend.

**Solução:**
1. No EasyPanel, vá para o serviço do **frontend**
2. Verifique a variável de ambiente `BACKEND_URL`
3. Verifique o **nome exato** do serviço backend no EasyPanel
4. A URL deve ser: `http://NOME_DO_SERVICO_BACKEND:3001`
   - Exemplo: `http://moneynow-backend:3001`
5. Verifique os logs do frontend - você deve ver:
   ```
   🔧 Configurando BACKEND_URL: http://moneynow-backend:3001
   ✅ BACKEND_URL configurado com sucesso: http://moneynow-backend:3001
   ```

### 3. Backend e Frontend em projetos diferentes
Se o backend e frontend estão em projetos diferentes no EasyPanel, eles não podem se comunicar usando o nome do serviço.

**Solução:**
1. Use a **URL externa** do backend (se tiver domínio configurado)
   - Exemplo: `BACKEND_URL=https://api.seu-dominio.com`
2. Ou use o **IP interno** do backend (se disponível)
3. Ou mova ambos os serviços para o **mesmo projeto** no EasyPanel

### 4. Backend não está escutando na porta correta
O backend pode não estar escutando na porta 3001.

**Solução:**
1. Verifique os logs do backend
2. Você deve ver: `🚀 Server running on port 3001`
3. Se estiver em outra porta, atualize a variável `BACKEND_URL` no frontend

### 5. Backend não está acessível na rede
O backend pode estar rodando, mas não está acessível na rede interna.

**Solução:**
1. Verifique se o backend tem **porta exposta** no EasyPanel
2. Verifique se o backend está na **mesma rede** do frontend
3. Teste a URL do backend diretamente (se possível)

## Passos de Diagnóstico

### Passo 1: Verificar logs do Backend
```
1. EasyPanel → Serviço Backend → Logs
2. Procure por erros ou mensagens de inicialização
3. Verifique se aparece: "🚀 Server running on port 3001"
```

### Passo 2: Verificar logs do Frontend
```
1. EasyPanel → Serviço Frontend → Logs
2. Procure por: "🔧 Configurando BACKEND_URL"
3. Verifique qual URL está sendo usada
```

### Passo 3: Verificar variável BACKEND_URL
```
1. EasyPanel → Serviço Frontend → Variáveis de Ambiente
2. Verifique se `BACKEND_URL` está configurada
3. Verifique se o valor está correto
```

### Passo 4: Testar conexão do backend
Se possível, teste a URL do backend diretamente:
```bash
# Se o backend tiver domínio
curl https://api.seu-dominio.com/health

# Ou se tiver IP
curl http://IP_DO_BACKEND:3001/health
```

## Solução Rápida

### Se o backend está no mesmo projeto:
1. No EasyPanel, vá para o serviço do **frontend**
2. Adicione/atualize a variável de ambiente:
   - **Nome:** `BACKEND_URL`
   - **Valor:** `http://NOME_DO_SERVICO_BACKEND:3001`
   - *(Substitua `NOME_DO_SERVICO_BACKEND` pelo nome exato do seu serviço backend)*
3. Salve e faça **redeploy** do frontend

### Se o backend está em projeto diferente:
1. Use a **URL externa** do backend:
   - **Nome:** `BACKEND_URL`
   - **Valor:** `https://api.seu-dominio.com` ou `http://IP:3001`
2. Salve e faça **redeploy** do frontend

## Verificação Final

Após configurar, verifique:

1. ✅ Backend está rodando (status: Running)
2. ✅ Frontend está rodando (status: Running)
3. ✅ Variável `BACKEND_URL` está configurada no frontend
4. ✅ Logs do frontend mostram a URL correta sendo configurada
5. ✅ Logs do backend mostram que está escutando na porta 3001

## Ainda com problemas?

Se o erro persistir:
1. Verifique os logs completos do frontend e backend
2. Verifique se há erros de conexão no backend
3. Verifique se o backend está conseguindo conectar ao banco de dados
4. Verifique se há firewall bloqueando a comunicação entre serviços

