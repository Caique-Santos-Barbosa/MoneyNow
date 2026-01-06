# 🚀 Guia de Deploy no EasyPanel

Este guia detalha o processo completo de deploy da aplicação MoneyNow no EasyPanel.

## 📋 Checklist Pré-Deploy

- [ ] Projeto commitado e enviado para GitHub
- [ ] Dockerfile testado localmente
- [ ] Variáveis de ambiente documentadas
- [ ] README atualizado

## 🔧 Passo a Passo no EasyPanel

### 1. Acessar EasyPanel

1. Faça login no painel do EasyPanel
2. Navegue até o projeto ou crie um novo

### 2. Criar Nova Aplicação

1. Clique em **"New App"** ou **"Nova Aplicação"**
2. Selecione **"GitHub"** como fonte do código
3. Autorize o acesso ao GitHub (se necessário)

### 3. Configurar Repositório

- **Repository**: Selecione `seu-usuario/MoneyNow`
- **Branch**: `main` ou `master`
- **Dockerfile Path**: `Dockerfile`
- **Context**: `.` (ponto, raiz do projeto)

### 4. Configurações de Build

O EasyPanel deve detectar automaticamente:
- ✅ Dockerfile na raiz
- ✅ Build automático via Dockerfile
- ✅ Porta 80 (nginx)

**Configurações recomendadas:**
- **Build Timeout**: 15 minutos
- **Auto Deploy**: Habilitado (opcional)
- **Build on Push**: Habilitado (recomendado)

### 5. Variáveis de Ambiente

**IMPORTANTE**: Como o Vite faz substituição em build-time, as variáveis `VITE_*` precisam estar disponíveis durante o build.

No EasyPanel, adicione em **"Environment Variables"**:

```
VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8
```

**Nota**: Se você mudar essa variável depois do primeiro deploy, será necessário fazer rebuild da aplicação.

### 6. Configuração de Porta

- **Porta Interna**: `80` (nginx)
- **Porta Externa**: Deixe o EasyPanel configurar automaticamente
- **Protocol**: HTTP (ou HTTPS se configurado)

### 7. Health Check

O Dockerfile já inclui healthcheck configurado:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

O EasyPanel deve detectar automaticamente.

### 8. Volumes (NÃO NECESSÁRIO)

⚠️ **Este projeto NÃO requer volumes** porque:
- Os dados são armazenados no Base44 (nuvem)
- Não há banco de dados local
- Não há necessidade de persistência de arquivos

**Se quiser persistir logs do nginx** (opcional):
- Path: `/var/log/nginx`
- Volume: Criar volume nomeado `moneynow-logs`

### 9. Recursos (Resources)

Configurações recomendadas:
- **CPU**: 0.5 - 1 core
- **RAM**: 512MB - 1GB
- **Storage**: 1GB (suficiente para a aplicação)

### 10. Deploy

1. Revise todas as configurações
2. Clique em **"Deploy"** ou **"Deploy Now"**
3. Aguarde o build completar (pode levar 5-10 minutos na primeira vez)
4. Monitore os logs durante o build

### 11. Verificação Pós-Deploy

Após o deploy:

1. ✅ Verifique se o container está rodando
2. ✅ Acesse a URL fornecida pelo EasyPanel
3. ✅ Teste a aplicação:
   - Login/Registro
   - Navegação entre páginas
   - Criação de transações
   - Verificação de dados persistidos

## 🔍 Troubleshooting

### Build Falha

**Erro**: `npm ci` falha
- Verifique se o `package.json` está correto
- Confirme que todas as dependências estão no repositório

**Erro**: Build do Vite falha
- Verifique os logs completos
- Confirme que não há erros de sintaxe no código

### Aplicação não Carrega

**Erro 502 Bad Gateway**
- Verifique se o container está rodando
- Confirme que a porta 80 está exposta
- Verifique os logs do container

**Erro 404 em Rotas**
- Confirme que `nginx.conf` está sendo copiado
- Verifique se o arquivo está na raiz do projeto
- Confirme que o nginx.conf tem a configuração `try_files`

### Erro de Conexão com Base44

**Erro**: `Failed to connect to Base44`
- Verifique se `VITE_BASE44_APP_ID` está correto
- Confirme que o appId está ativo no Base44
- Se mudou a variável, faça rebuild completo

### Dados Não Persistem

⚠️ **IMPORTANTE**: Se os dados não estão persistindo:
- Isso NÃO é um problema do deploy
- Os dados estão no Base44, não no container
- Verifique:
  - Se está logado com a conta correta
  - Se o appId está correto
  - Se há problemas de conexão com Base44

## 🔄 Atualizações Futuras

### Deploy Automático

Com "Build on Push" habilitado:
1. Faça commit e push para GitHub
2. O EasyPanel detecta automaticamente
3. Faz rebuild e redeploy

### Deploy Manual

1. No EasyPanel, vá em "Deployments"
2. Clique em "Redeploy"
3. Ou faça push para trigger automático

### Mudança de Variáveis

Se precisar mudar `VITE_BASE44_APP_ID`:
1. Atualize a variável no EasyPanel
2. **Faça rebuild completo** (não apenas restart)
3. As variáveis VITE_* são substituídas no build-time

## 📊 Monitoramento

### Logs

- Acesse "Logs" no EasyPanel
- Monitore erros e warnings
- Logs do nginx estão disponíveis no container

### Métricas

- CPU e RAM usage
- Request count
- Response time

## 🔐 Segurança

- ✅ Aplicação serve apenas frontend estático
- ✅ Autenticação gerenciada pelo Base44
- ✅ Dados não são armazenados localmente
- ✅ HTTPS recomendado (configure no EasyPanel)

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no EasyPanel
2. Teste localmente com Docker
3. Consulte a documentação do EasyPanel
4. Entre em contato com suporte Base44: app@base44.com

---

**Última atualização**: Configurado para deploy no EasyPanel com persistência de dados no Base44.

