# 📤 Guia de Upload para GitHub

Este guia explica como fazer upload do projeto MoneyNow para o GitHub.

## 📋 Pré-requisitos

- Conta no GitHub
- Git instalado localmente
- Projeto configurado localmente

## 🚀 Passo a Passo

### 1. Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha:
   - **Repository name**: `MoneyNow` (ou o nome que preferir)
   - **Description**: "Aplicação de gestão financeira pessoal"
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO** marque "Initialize with README" (já temos um)
5. Clique em **"Create repository"**

### 2. Inicializar Git Localmente (se ainda não foi feito)

```bash
# Navegue até a pasta do projeto
cd C:\MoneyNow

# Inicialize o repositório Git (se ainda não foi feito)
git init

# Verifique o status
git status
```

### 3. Adicionar Arquivos ao Git

```bash
# Adicionar todos os arquivos (exceto os ignorados pelo .gitignore)
git add .

# Verificar o que será commitado
git status
```

### 4. Fazer Primeiro Commit

```bash
# Fazer commit inicial
git commit -m "Initial commit: MoneyNow app with Docker configuration"
```

### 5. Conectar com o Repositório GitHub

```bash
# Adicionar remote (substitua SEU-USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU-USUARIO/MoneyNow.git

# Verificar se foi adicionado corretamente
git remote -v
```

### 6. Enviar para o GitHub

```bash
# Enviar para o branch main
git branch -M main
git push -u origin main
```

Se solicitado, faça login no GitHub via navegador ou use um Personal Access Token.

## 📁 Arquivos que Serão Enviados

✅ **Serão enviados:**
- Todo o código fonte (`src/`)
- Arquivos de configuração (`package.json`, `vite.config.js`, etc.)
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `.dockerignore`
- `README.md`
- `DEPLOY.md`
- `GITHUB.md` (este arquivo)

❌ **NÃO serão enviados** (devido ao `.gitignore`):
- `node_modules/`
- `dist/`
- `.env`
- Arquivos de log
- Arquivos do editor (`.vscode/`, `.idea/`)

## 🔄 Atualizações Futuras

Após fazer alterações no código:

```bash
# Verificar mudanças
git status

# Adicionar arquivos modificados
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Enviar para GitHub
git push
```

## 🔐 Autenticação GitHub

### Opção 1: Personal Access Token (Recomendado)

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Selecione escopos: `repo` (acesso completo aos repositórios)
4. Copie o token
5. Use o token como senha ao fazer `git push`

### Opção 2: SSH Key

1. Gere uma chave SSH: `ssh-keygen -t ed25519 -C "seu-email@example.com"`
2. Adicione a chave pública ao GitHub: Settings → SSH and GPG keys
3. Use a URL SSH: `git@github.com:SEU-USUARIO/MoneyNow.git`

## ✅ Verificação

Após o push, verifique no GitHub:
1. Acesse seu repositório
2. Confirme que todos os arquivos estão presentes
3. Verifique especialmente:
   - ✅ `Dockerfile` está na raiz
   - ✅ `nginx.conf` está na raiz
   - ✅ `.dockerignore` está na raiz
   - ✅ `package.json` está presente

## 🐛 Troubleshooting

### Erro: "remote origin already exists"

```bash
# Remover remote existente
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/SEU-USUARIO/MoneyNow.git
```

### Erro: "Authentication failed"

- Verifique suas credenciais
- Use Personal Access Token em vez de senha
- Configure SSH keys

### Erro: "Permission denied"

- Verifique se você tem acesso ao repositório
- Confirme que o nome do repositório está correto
- Verifique se você é o dono ou tem permissão de escrita

## 📝 Próximos Passos

Após fazer upload para o GitHub:

1. ✅ Verifique se o repositório está completo
2. ✅ Siga o guia `DEPLOY.md` para fazer deploy no EasyPanel
3. ✅ Configure o EasyPanel para usar este repositório

---

**Dica**: Mantenha o repositório atualizado com commits frequentes e mensagens descritivas!

