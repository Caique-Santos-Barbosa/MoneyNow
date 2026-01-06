# 🧪 Testar Docker Localmente

Antes de fazer deploy no EasyPanel, é recomendado testar o Docker localmente.

## 📋 Pré-requisitos

- Docker instalado e rodando
- Docker Compose (opcional, mas recomendado)

## 🚀 Teste Rápido

### 1. Build da Imagem

```bash
# Build com variável de ambiente
docker build --build-arg VITE_BASE44_APP_ID=695b2ab55b0764f0c9f239e8 -t moneynow:test .
```

### 2. Executar Container

```bash
# Executar em background
docker run -d -p 3000:80 --name moneynow-test moneynow:test

# Ou executar e ver logs
docker run -p 3000:80 --name moneynow-test moneynow:test
```

### 3. Testar Aplicação

Abra no navegador: `http://localhost:3000`

### 4. Verificar Logs

```bash
# Ver logs do container
docker logs moneynow-test

# Seguir logs em tempo real
docker logs -f moneynow-test
```

### 5. Verificar Health

```bash
# Verificar status do healthcheck
docker inspect --format='{{.State.Health.Status}}' moneynow-test
```

### 6. Parar e Remover

```bash
# Parar container
docker stop moneynow-test

# Remover container
docker rm moneynow-test

# Remover imagem (opcional)
docker rmi moneynow:test
```

## 🐳 Usando Docker Compose

### 1. Build e Iniciar

```bash
# Build e iniciar
docker-compose up --build

# Ou em background
docker-compose up -d --build
```

### 2. Ver Logs

```bash
docker-compose logs -f
```

### 3. Parar

```bash
docker-compose down
```

## ✅ Checklist de Testes

Antes de fazer deploy, verifique:

- [ ] Build completa sem erros
- [ ] Container inicia corretamente
- [ ] Aplicação carrega em `http://localhost:3000`
- [ ] Rotas funcionam (não dá 404)
- [ ] Healthcheck está funcionando
- [ ] Logs não mostram erros críticos
- [ ] Conexão com Base44 funciona
- [ ] Login/Registro funciona
- [ ] Dados são salvos corretamente

## 🐛 Troubleshooting

### Erro: "Cannot find module"

- Verifique se `npm ci` foi executado corretamente
- Confirme que `package.json` está correto
- Limpe cache: `docker builder prune`

### Erro: "Port already in use"

```bash
# Use outra porta
docker run -p 3001:80 --name moneynow-test moneynow:test
```

### Erro: "nginx: [emerg]"

- Verifique se `nginx.conf` está correto
- Confirme que o arquivo está na raiz do projeto

### Container para imediatamente

```bash
# Ver logs para identificar o problema
docker logs moneynow-test

# Executar interativamente para debug
docker run -it --entrypoint /bin/sh moneynow:test
```

## 📊 Verificar Tamanho da Imagem

```bash
# Ver tamanho da imagem
docker images moneynow:test

# Deve ser relativamente pequena (< 100MB) devido ao multi-stage build
```

## 🔍 Inspecionar Container

```bash
# Ver todas as informações
docker inspect moneynow-test

# Ver variáveis de ambiente
docker exec moneynow-test env

# Acessar shell do container
docker exec -it moneynow-test /bin/sh
```

---

**Dica**: Se tudo funcionar localmente, o deploy no EasyPanel deve funcionar também!

