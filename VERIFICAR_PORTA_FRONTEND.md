# 🔍 Verificação de Porta do Frontend

## ⚠️ Problema: Erro 404 no Frontend

O erro 404 pode ser causado por configuração incorreta de porta no domínio do EasyPanel.

## 📋 Configuração Correta

### Frontend (Nginx)
- **Porta Interna:** `80` (Nginx escuta na porta 80)
- **Porta Externa:** `80` (ou a porta configurada no domínio)

### Backend
- **Porta Interna:** `3001`
- **Porta Externa:** `3001` (ou a porta configurada no domínio)

## 🔧 Verificar Configuração do Domínio no EasyPanel

### 1. Verificar Domínio do Frontend

No EasyPanel:
1. Vá para o serviço do **frontend** (`moneynow-frontend`)
2. Vá em **"Domínios"**
3. Verifique a configuração do domínio:
   - **Host:** `projetos-pessoais-moneynow.mqtl34.easypanel.host`
   - **Protocolo:** `HTTP` ou `HTTPS`
   - **Porta:** Deve ser `80` (não 3001!)
   - **Destino:** Deve apontar para o serviço `moneynow-frontend`
   - **Caminho:** `/`

### 2. Configuração Esperada

**Domínio do Frontend:**
```
Host: projetos-pessoais-moneynow.mqtl34.easypanel.host
Protocolo: HTTP (ou HTTPS se configurado)
Porta: 80
Destino: moneynow-frontend
Caminho: /
```

**Domínio do Backend:**
```
Host: projetos-pessoais-moneynow-backend.mqtl34.easypanel.host
Protocolo: HTTP (ou HTTPS se configurado)
Porta: 3001
Destino: moneynow-backend
Caminho: /
```

## 🐛 Problemas Comuns

### Problema 1: Porta Errada no Domínio
- ❌ Domínio do frontend apontando para porta 3001
- ✅ Deve ser porta 80

### Problema 2: Serviço Errado
- ❌ Domínio do frontend apontando para `moneynow-backend`
- ✅ Deve apontar para `moneynow-frontend`

### Problema 3: Caminho Errado
- ❌ Caminho configurado como `/api` ou outro
- ✅ Deve ser `/`

## 🔧 Correção

### Se a Porta Estiver Errada:

1. **No EasyPanel, vá para o serviço do frontend**
2. **Vá em "Domínios"**
3. **Clique em "Editar" no domínio**
4. **Verifique/Corrija:**
   - **Porta:** `80` (não 3001!)
   - **Destino:** `moneynow-frontend` (não backend!)
   - **Caminho:** `/`
5. **Salve**

## ✅ Verificação

Após corrigir:
1. Aguarde alguns segundos
2. Acesse: https://projetos-pessoais-moneynow.mqtl34.easypanel.host/
3. Deve abrir a página de login (não mais 404)

## 📝 Resumo

- **Frontend:** Porta 80 (Nginx)
- **Backend:** Porta 3001 (Node.js)
- **Domínio Frontend:** Deve apontar para porta 80
- **Domínio Backend:** Deve apontar para porta 3001

