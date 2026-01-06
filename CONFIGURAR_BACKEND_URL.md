# 🔧 Como Configurar BACKEND_URL no Frontend

## 📝 Passo a Passo

### 1. No campo "Variáveis de Ambiente"

No campo de texto que está vazio, adicione:

```
BACKEND_URL=http://projetos_pessoais_moneynow-backend:3001
```

### 2. Formato Correto

O formato é simples: uma variável por linha, no formato `NOME=VALOR`

```
BACKEND_URL=http://projetos_pessoais_moneynow-backend:3001
```

### 3. Nome do Serviço Backend

O nome do serviço backend é: `projetos_pessoais_moneynow-backend`
- Com underscore (`_`) antes de `moneynow`
- Com hífen (`-`) antes de `backend`
- Porta: `3001`

### 4. Salvar

1. Após adicionar a variável, clique no botão **"Salvar"** (verde, no canto inferior direito)
2. O EasyPanel fará o deploy automaticamente

### 5. Verificar Logs

Após salvar, verifique os logs do frontend. Você deve ver:

```
🔧 Configurando BACKEND_URL: http://projetos_pessoais_moneynow-backend:3001
✅ BACKEND_URL configurado com sucesso: http://projetos_pessoais_moneynow-backend:3001
```

## ⚠️ Importante

- **Não use espaços** antes ou depois do `=`
- **Use o nome exato** do serviço backend
- **A porta é 3001**, não 80

## 🔄 Alternativa (Se URL Interna Não Funcionar)

Se após configurar ainda der erro 502, tente usar a URL externa:

```
BACKEND_URL=https://projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
```

## ✅ Após Configurar

1. Salve as configurações
2. Aguarde o deploy automático (ou clique em "Implantar")
3. Verifique os logs
4. Teste o registro de conta novamente

