# 🧵 Sistema de Vendas de Artesanatos/Bordados

**FEMA — Engenharia de Software I — 2026**
**Dupla:** João Carlos Vinhato Batista da Silva & Hugo Pecoraro da Silva

Este projeto consiste no desenvolvimento de um software aplicando metodologias de engenharia de software, com o objetivo de criar um sistema organizado, estruturado e funcional na prática, seguindo padrões e processos utilizados no ambiente profissional.

--- Fase Inicial (Levantamento de requisitos, mapas mentais, diagramas de casos de uso, modelagem de Banco de Dados)

*Mapa Mental*
<img width="954" height="344" alt="Sistema de Gestão-vendas - Bordados" src="https://github.com/user-attachments/assets/6bfb1a1b-5525-4774-b9c9-b3782ed51a85" />

*Prototipação das Interfaces*
<img width="1919" height="897" alt="image" src="https://github.com/user-attachments/assets/d5f6e6fa-7787-4436-af9e-cb33583e21e9" />
Link para acesso ao protótipo: https://www.figma.com/make/by9O09B6aHu2y8eMFCwNz6/Sistema-de-Vendas-de-Bordados--Prot%C3%B3tipo-das-interfaces-?t=OymS2oUYvLZd4U5Z-20&fullscreen=1 

*Modelagem do Banco de Dados*
<img width="1361" height="1237" alt="Modelo BD 1 (1)" src="https://github.com/user-attachments/assets/a1254a0b-ae24-4985-80f3-531767837c78" />
[Modelo BD 1.pdf](https://github.com/user-attachments/files/27070890/Modelo.BD.1.pdf)

Link para acesso da modelagem visual: 
[https://dbdiagram.io/d/Modelo-BD-1-69e169810f7c9ef2c019e64c](https://dbdiagram.io/d/Modelo-BD-1-69e169810f7c9ef2c019e64c) 

*Diagrama de Casos de Uso*


--- Desenvolvimento

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React.js + Vite + React Router |
| Backend | Node.js + Express |
| Banco de Dados | PostgreSQL |
| Autenticação | JWT + bcrypt |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |
| Deploy Banco | Supabase (PostgreSQL gratuito) |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js (v18+)
- PostgreSQL instalado e rodando

### 1. Clonar o repositório
```bash
git clone https://github.com/joaocarlosvbs/Projeto-1---Primeiro-software-Engenharia-de-Software-I-.git
cd Projeto-1---Primeiro-software-Engenharia-de-Software-I-
```

### 2. Configurar o Backend
```bash
cd backend
npm install
```

Edite o arquivo `.env` com suas credenciais:
```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=artesanato
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=chave_super_secreta_bordados_2026
```

Crie o banco e rode o script SQL:
- Abra o pgAdmin 4
- Crie o banco `artesanato`
- Abra o Query Tool e rode o script DDL da documentação

Inicie o backend:
```bash
npm run dev
```
Backend rodando em: http://localhost:3001

### 3. Configurar o Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend rodando em: http://localhost:5173

---

## 🌐 Deploy em Produção

### Banco de Dados — Supabase
1. Crie conta em supabase.com
2. Crie novo projeto
3. Vá em SQL Editor e cole o script DDL
4. Copie a connection string (Settings → Database)

### Backend — Render
1. Crie conta em render.com
2. New → Web Service → conecte o GitHub
3. Configure as variáveis de ambiente com os dados do Supabase
4. Deploy automático a cada push

### Frontend — Vercel
1. Crie conta em vercel.com
2. Import do GitHub
3. Configure a variável `VITE_API_URL` com a URL do Render
4. Deploy automático a cada push

---

## 📋 Casos de Uso Implementados

| UC | Descrição | Status |
|---|---|---|
| UC01 | Login com JWT | ✅ |
| UC02 | Cadastro de usuário | ✅ |
| UC03 | Gestão de clientes | ✅ |
| UC04 | Catálogo de produtos | ✅ |
| UC07 | Fazer encomenda | ✅ |
| UC08 | Atualizar status do pedido | ✅ |
| UC11 | Cliente acompanha pedidos | ✅ |
| UC15 | Log de auditoria | ✅ |
| UC17 | Exclusão LGPD | ✅ |
