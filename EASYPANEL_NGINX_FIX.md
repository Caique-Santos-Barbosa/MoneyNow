# 🔧 Correção do Erro Nginx "host not found in upstream 'backend'"

## Problema
O Nginx estava tentando fazer proxy para `http://backend:3001`, mas no EasyPanel os serviços não compartilham a mesma rede Docker por padrão, causando o erro:
```
nginx: [emerg] host not found in upstream "backend" in /etc/nginx/conf.d/default.conf:21
```

## Solução Implementada

Foi criado um script `docker-entrypoint.sh` que substitui dinamicamente a URL do backend no `nginx.conf` usando a variável de ambiente `BACKEND_URL`.

## Configuração no EasyPanel

### 1. Frontend - Variável de Ambiente

No serviço do **frontend** no EasyPanel, adicione a variável de ambiente:

**Nome:** `BACKEND_URL`  
**Valor:** A URL do seu backend. Use uma das opções abaixo:

#### Opção A: Backend no mesmo projeto (recomendado)
Se o backend está no mesmo projeto do EasyPanel, use o nome do serviço:
```
BACKEND_URL=http://moneynow-backend:3001
```
*(Substitua `moneynow-backend` pelo nome exato do seu serviço backend no EasyPanel)*

#### Opção B: Backend em projeto separado ou URL externa
Se o backend está em outro projeto ou tem um domínio próprio:
```
BACKEND_URL=https://api.seu-dominio.com
```
ou
```
BACKEND_URL=http://IP_DO_BACKEND:3001
```

### 2. Verificar Nome do Serviço Backend

1. No EasyPanel, vá para o serviço do backend
2. Verifique o nome do serviço (geralmente aparece no topo da página)
3. Use esse nome exato na variável `BACKEND_URL`

### 3. Deploy

Após configurar a variável de ambiente:

1. **Salve as configurações** do serviço frontend
2. **Faça o deploy** (ou aguarde o deploy automático)
3. **Verifique os logs** do frontend - você deve ver:
   ```
   🔧 Configurando BACKEND_URL: http://moneynow-backend:3001
   ```

## Como Funciona

1. O `Dockerfile` copia o `nginx.conf` com a URL padrão `http://backend:3001`
2. O script `docker-entrypoint.sh` é executado antes do Nginx iniciar
3. O script substitui `http://backend:3001` pela variável `BACKEND_URL` no `nginx.conf`
4. O Nginx inicia com a configuração correta

## Teste

Após o deploy, teste se o frontend consegue se comunicar com o backend:

1. Acesse o frontend no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Tente fazer login ou registrar uma conta
4. Verifique se as requisições para `/api/auth/*` estão funcionando

## Troubleshooting

### Erro persiste
- Verifique se a variável `BACKEND_URL` está configurada corretamente
- Verifique se o nome do serviço backend está correto
- Verifique os logs do frontend para ver qual URL está sendo usada

### Backend não responde
- Verifique se o backend está rodando
- Teste a URL do backend diretamente (ex: `curl http://moneynow-backend:3001/health`)
- Verifique se o backend está na mesma rede/projeto do frontend

### URL externa não funciona
- Verifique se a URL externa está acessível
- Verifique se há firewall bloqueando a conexão
- Use a URL completa com protocolo (http:// ou https://)

