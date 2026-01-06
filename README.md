# MoneyNow - Aplicação de Gestão Financeira

Aplicação React/Vite para gestão financeira pessoal, desenvolvida com Base44 SDK.

## 🚀 Tecnologias

- **React 18** - Framework UI
- **Vite 6** - Build tool
- **Base44 SDK** - Backend as a Service
- **Tailwind CSS** - Estilização
- **Docker** - Containerização

## 📋 Pré-requisitos

- Node.js 20+ 
- npm ou yarn
- Docker (opcional, para containerização)

## 🛠️ Desenvolvimento Local

### Instalação

```bash
# Instalar dependências
npm install
```

### Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8
```

### Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build de Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

## 🐳 Docker

### Build da Imagem

```bash
docker build -t moneynow:latest .
```

### Executar Container

```bash
docker run -d -p 3000:80 --name moneynow-app moneynow:latest
```

A aplicação estará disponível em `http://localhost:3000`

### Usando Docker Compose

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f
```

## 📦 Deploy no EasyPanel

### Preparação

1. **Certifique-se de que o projeto está no GitHub**
   - Faça commit de todos os arquivos
   - Faça push para o repositório

2. **Arquivos necessários no repositório:**
   - `Dockerfile`
   - `nginx.conf`
   - `.dockerignore`
   - `package.json`
   - Todo o código fonte

### Configuração no EasyPanel

1. **Criar Nova Aplicação**
   - Acesse o painel do EasyPanel
   - Clique em "New App" ou "Nova Aplicação"
   - Selecione "GitHub" como fonte

2. **Configurar Repositório**
   - Conecte sua conta GitHub (se necessário)
   - Selecione o repositório `MoneyNow`
   - Branch: `main` ou `master`

3. **Configurações de Build**
   - **Build Command**: (deixe vazio, o Dockerfile já faz o build)
   - **Dockerfile Path**: `Dockerfile` (raiz do projeto)
   - **Context**: `.` (raiz do projeto)

4. **Variáveis de Ambiente**
   - No EasyPanel, vá em "Environment Variables"
   - Adicione as seguintes variáveis (se necessário para build):
     ```
     VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8
     ```
   - **Nota**: Como o Vite faz build-time replacement, você pode precisar rebuildar a imagem se mudar essa variável

5. **Porta**
   - Porta interna: `80` (nginx)
   - Porta externa: Deixe o EasyPanel configurar automaticamente

6. **Volumes** (Opcional)
   - Este projeto não requer volumes, pois os dados são armazenados no Base44
   - Se precisar de logs persistentes, pode configurar um volume para `/var/log/nginx`

7. **Health Check**
   - O Dockerfile já inclui healthcheck
   - EasyPanel deve detectar automaticamente

8. **Deploy**
   - Clique em "Deploy" ou "Deploy Now"
   - Aguarde o build e deploy completarem
   - Verifique os logs se houver erros

### ⚠️ Importante sobre Persistência de Dados

**Este projeto usa Base44 SDK como backend**, o que significa:
- ✅ **Os dados NÃO são armazenados localmente**
- ✅ **Todos os dados estão no Base44 (nuvem)**
- ✅ **Não há necessidade de volumes Docker para dados**
- ✅ **Reiniciar/recriar o container NÃO afeta os dados**
- ✅ **O frontend pode ser editado e redeployado sem perder dados**

### Troubleshooting

**Problema**: Aplicação não carrega após deploy
- Verifique os logs no EasyPanel
- Confirme que a porta 80 está exposta
- Verifique se o build foi concluído com sucesso

**Problema**: Erro 404 em rotas
- Confirme que o `nginx.conf` está sendo copiado corretamente
- Verifique se o arquivo está na raiz do projeto

**Problema**: Erro de conexão com Base44
- Verifique se `VITE_BASE44_APP_ID` está correto
- Se mudou a variável, faça rebuild da imagem

## 📝 Estrutura do Projeto

```
MoneyNow/
├── src/
│   ├── api/           # Cliente Base44 e entidades
│   ├── components/    # Componentes React
│   ├── pages/         # Páginas da aplicação
│   └── ...
├── Dockerfile         # Configuração Docker
├── docker-compose.yml # Compose para desenvolvimento
├── nginx.conf         # Configuração Nginx
└── package.json       # Dependências
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa ESLint

## 📚 Documentação Base44

Para mais informações sobre o Base44 SDK, visite: https://base44.com

## 📄 Licença

Este projeto é privado.

---

**Desenvolvido com ❤️ usando Base44**
