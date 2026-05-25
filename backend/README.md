# Vitrine Bordados — Backend

## Como rodar

1. Entre na pasta backend:
```
cd backend
```

2. Instale as dependências:
```
npm install
```

3. Edite o arquivo `.env` e coloque sua senha do PostgreSQL em `DB_PASSWORD`

4. No pgAdmin, crie o banco `vitrine_bordados` e rode o script SQL da documentação

5. Inicie o servidor:
```
npm run dev
```

## Endpoints disponíveis

### Autenticação (públicos)
- POST `/api/auth/cadastro` — UC02
- POST `/api/auth/login` — UC01

### Produtos
- GET `/api/produtos/portfolio` — UC04 (público, sem login)
- GET `/api/produtos` — lista todos (admin)
- POST `/api/produtos` — criar produto (admin)
- PUT `/api/produtos/:id` — atualizar produto (admin)

### Pedidos (exigem login)
- GET `/api/pedidos/meus` — UC11 (cliente vê seus pedidos)
- POST `/api/pedidos` — UC07 (fazer encomenda)
- GET `/api/pedidos` — lista todos (admin)
- PUT `/api/pedidos/:id/status` — UC08 (atualizar status)
