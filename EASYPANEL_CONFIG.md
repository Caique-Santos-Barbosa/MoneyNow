# ⚙️ Configuração Específica para EasyPanel

Este documento contém as configurações exatas que você precisa usar no EasyPanel.

## 📋 Configurações no EasyPanel

### 1. Informações Básicas

- **Nome da Aplicação**: `moneynow` (ou o nome que preferir)
- **Tipo**: `Docker`
- **Fonte**: `GitHub`

### 2. Repositório GitHub

- **Repository**: `Caique-Santos-Barbosa/MoneyNow`
- **Branch**: `main`
- **Dockerfile Path**: `Dockerfile`
- **Context**: `.` (ponto, raiz do projeto)

### 3. Build Settings

**Build Command**: (deixe vazio - o Dockerfile já faz tudo)

**Build Args** (opcional, se quiser customizar):
```
VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8
```

**Nota**: O Dockerfile já tem um valor padrão para `VITE_BASE44_APP_ID`, então você não precisa configurar isso a menos que queira usar um appId diferente.

### 4. Portas

- **Porta Interna**: `80`
- **Porta Externa**: Deixe o EasyPanel configurar automaticamente
- **Protocol**: `HTTP` (ou HTTPS se configurado)

### 5. Variáveis de Ambiente

**IMPORTANTE**: Como o Vite faz substituição em build-time, se você quiser mudar o `VITE_BASE44_APP_ID`, precisa fazer rebuild completo.

Variáveis opcionais (se necessário):
```
VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8
```

### 6. Volumes

**NÃO é necessário configurar volumes** porque:
- Os dados são armazenados no Base44 (nuvem)
- Não há banco de dados local
- Não há necessidade de persistência de arquivos

### 7. Health Check

O Dockerfile já inclui healthcheck configurado. O EasyPanel deve detectar automaticamente:
- **Interval**: 30s
- **Timeout**: 3s
- **Start Period**: 5s
- **Retries**: 3

### 8. Recursos (Resources)

Configurações recomendadas:
- **CPU**: 0.5 - 1 core
- **RAM**: 512MB - 1GB
- **Storage**: 1GB (suficiente)

### 9. Auto Deploy

Recomendado:
- ✅ **Build on Push**: Habilitado
- ✅ **Auto Deploy**: Habilitado (opcional)

## 🔧 Passo a Passo no EasyPanel

1. **Criar Nova Aplicação**
   - Clique em "New App" ou "Nova Aplicação"
   - Selecione "GitHub" como fonte

2. **Conectar GitHub**
   - Autorize acesso ao GitHub (se necessário)
   - Selecione o repositório `Caique-Santos-Barbosa/MoneyNow`
   - Branch: `main`

3. **Configurar Build**
   - Dockerfile Path: `Dockerfile`
   - Context: `.`
   - Build Command: (deixe vazio)

4. **Configurar Porta**
   - Porta Interna: `80`
   - Deixe o EasyPanel configurar a porta externa

5. **Variáveis de Ambiente** (opcional)
   - Se quiser customizar o appId, adicione:
     ```
     VITE_BASE44_APP_ID=seu-app-id-aqui
     ```
   - **Lembre-se**: Se mudar essa variável, precisa fazer rebuild completo

6. **Deploy**
   - Clique em "Deploy" ou "Deploy Now"
   - Aguarde o build completar (5-10 minutos na primeira vez)

## ✅ Verificação Pós-Deploy

Após o deploy, verifique:

1. ✅ Container está rodando
2. ✅ Aplicação carrega na URL fornecida
3. ✅ Rotas funcionam (não dá 404)
4. ✅ Login/Registro funciona
5. ✅ Dados são salvos corretamente

## 🐛 Troubleshooting

### Build Falha com "npm ci"

**Solução**: Já corrigido no Dockerfile - agora usa `npm install`

### Erro 404 em Rotas

**Solução**: Verifique se o `nginx.conf` está sendo copiado corretamente

### Erro de Conexão com Base44

**Solução**: 
- Verifique se o appId está correto
- Se mudou a variável, faça rebuild completo

### Container Para Imediatamente

**Solução**: 
- Verifique os logs no EasyPanel
- Confirme que a porta 80 está exposta
- Verifique se o nginx.conf está correto

## 📝 Notas Importantes

1. **Dados Persistem**: Todos os dados estão no Base44, não no container. Reiniciar o container não afeta os dados.

2. **Frontend Editável**: Você pode editar o frontend e fazer redeploy sem problemas.

3. **Backend Intocável**: O Base44 gerencia tudo, não precisa mexer.

4. **Variáveis Build-time**: Variáveis `VITE_*` são substituídas no build-time, não em runtime. Se mudar, precisa rebuildar.

---

**Última atualização**: Configurações testadas e validadas para EasyPanel.

