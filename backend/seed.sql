-- ============================================================
-- SCRIPT DE DADOS DE TESTE — Sistema de Vendas de Artesanatos
-- Execute no pgAdmin > Query Tool no banco "artesanato"
-- SEGURO: pode rodar várias vezes (usa DELETE antes de inserir)
-- ============================================================

-- Limpa dados de teste anteriores (ordem inversa das dependências)
DELETE FROM LogsAuditoria;
DELETE FROM TransacaoFinanceira;
DELETE FROM ConsumoProducao;
DELETE FROM ItemPedido;
DELETE FROM Pedido;
DELETE FROM RegistroCompra;
DELETE FROM Cliente;
DELETE FROM MateriaPrima;
DELETE FROM Fornecedor;
DELETE FROM Produto;
DELETE FROM Usuario;

-- Reset das sequences (IDs voltam ao 1)
ALTER SEQUENCE usuario_id_seq RESTART WITH 1;
ALTER SEQUENCE cliente_id_seq RESTART WITH 1;
ALTER SEQUENCE produto_id_seq RESTART WITH 1;
ALTER SEQUENCE fornecedor_id_seq RESTART WITH 1;
ALTER SEQUENCE materiaprima_id_seq RESTART WITH 1;
ALTER SEQUENCE pedido_id_seq RESTART WITH 1;
ALTER SEQUENCE itempedido_id_seq RESTART WITH 1;
ALTER SEQUENCE registrocompra_id_seq RESTART WITH 1;
ALTER SEQUENCE transacaofinanceira_id_seq RESTART WITH 1;
ALTER SEQUENCE logsauditoria_id_seq RESTART WITH 1;

-- ============================================================
-- 1. USUÁRIOS
-- Admin   → email: admin@bordados.com   | senha: admin123
-- Cliente → email: cliente@teste.com    | senha: cliente123
-- ============================================================
INSERT INTO Usuario (nome, email, senha_hash, nivel_acesso) VALUES
('Cleonice Admin',      'admin@bordados.com',   '$2a$10$PfatEo/7egaAdGIhbYrx3O7BDoglg9HR5100YfCHnmvGs9Ywb7OPm', 'Administrador'),
('Maria Silva',         'cliente@teste.com',    '$2a$10$PfNQNzFhcXjvgXzAB4u5yO5Ppl8RFAjsq70GmB1.R/lJe48eoaLUe', 'Cliente'),
('João Pereira',        'joao@teste.com',       '$2a$10$PfNQNzFhcXjvgXzAB4u5yO5Ppl8RFAjsq70GmB1.R/lJe48eoaLUe', 'Cliente'),
('Ana Costa',           'ana@teste.com',        '$2a$10$PfNQNzFhcXjvgXzAB4u5yO5Ppl8RFAjsq70GmB1.R/lJe48eoaLUe', 'Cliente'),
('Carlos Souza',        'carlos@teste.com',     '$2a$10$PfNQNzFhcXjvgXzAB4u5yO5Ppl8RFAjsq70GmB1.R/lJe48eoaLUe', 'Cliente'),
('Fernanda Lima',       'fernanda@teste.com',   '$2a$10$PfNQNzFhcXjvgXzAB4u5yO5Ppl8RFAjsq70GmB1.R/lJe48eoaLUe', 'Cliente');

-- ============================================================
-- 2. CLIENTES (perfis vinculados aos usuários)
-- ============================================================
INSERT INTO Cliente (usuario_id, nome_completo, cpf_cnpj, telefone, endereco, aceitou_lgpd, data_aceite_lgpd) VALUES
(2, 'Maria Silva',    '123.456.789-00', '(18) 99101-1111', 'Rua das Flores, 123 - Assis/SP',   true, NOW()),
(3, 'João Pereira',   '234.567.890-11', '(18) 99202-2222', 'Av. Brasil, 456 - Assis/SP',       true, NOW()),
(4, 'Ana Costa',      '345.678.901-22', '(18) 99303-3333', 'Rua XV de Novembro, 78 - Assis/SP',true, NOW()),
(5, 'Carlos Souza',   '456.789.012-33', '(18) 99404-4444', 'Rua Dom Pedro II, 321 - Assis/SP', true, NOW()),
(6, 'Fernanda Lima',  '567.890.123-44', '(18) 99505-5555', 'Rua Sete de Setembro, 654 - Assis/SP', true, NOW());

-- ============================================================
-- 3. FORNECEDORES
-- ============================================================
INSERT INTO Fornecedor (razao_social, telefone, email) VALUES
('Armarinho Central Ltda',   '(18) 3322-1111', 'contato@armarinhocentral.com.br'),
('Tecidos & Cia',            '(18) 3333-2222', 'vendas@tecidosecia.com.br'),
('Linhas do Sul Distribuidora', '(11) 4444-3333', 'pedidos@linhasdosul.com.br'),
('Casa do Bordado SP',       '(11) 5555-4444', 'comercial@casadobordado.com.br');

-- ============================================================
-- 4. MATÉRIAS-PRIMAS
-- ============================================================
INSERT INTO MateriaPrima (nome, quantidade_atual, unidade_medida, estoque_minimo) VALUES
('Linha de Bordar Branca',    45.00, 'rolos',  10),
('Linha de Bordar Azul',      12.00, 'rolos',  10),
('Linha de Bordar Rosa',       8.00, 'rolos',  10),
('Linha de Bordar Vermelha',   3.00, 'rolos',  10),  -- estoque crítico
('Tecido Aida 14ct Branco',   25.00, 'metros',  5),
('Tecido Aida 14ct Creme',     4.00, 'metros',  5),  -- estoque crítico
('Bastidor Plástico 15cm',    30.00, 'un',      5),
('Bastidor Plástico 20cm',    18.00, 'un',      5),
('Agulha para Bordado nº24',  90.00, 'un',     20),
('Fita de Cetim 5mm',         20.00, 'metros',  8);

-- ============================================================
-- 5. PRODUTOS (catálogo)
-- ============================================================
INSERT INTO Produto (nome, categoria, preco_venda, visivel_portfolio, estoque_atual, estoque_minimo) VALUES
('Toalha de Batizado Bordada',     'Enxoval Bebê',   85.00,  true,  5, 2),
('Kit Fraldas Bordadas (3un)',     'Enxoval Bebê',   120.00, true,  3, 2),
('Babador Personalizado',          'Enxoval Bebê',   35.00,  true,  8, 3),
('Quadro Bordado Família',         'Decoração',      150.00, true,  2, 1),
('Quadro Bordado Frase',           'Decoração',      90.00,  true,  4, 2),
('Uniforme Bordado (Camisa)',      'Uniformes',       55.00,  true,  0, 3),
('Uniforme Bordado (Jaleco)',      'Uniformes',       70.00,  true,  0, 3),
('Porta-Copos Bordados (4un)',     'Casa',            60.00,  true,  6, 2),
('Toalha de Mesa Bordada 6 Lugares','Casa',           200.00, true,  1, 1),
('Almofada Bordada Personalizada', 'Decoração',      95.00,  true,  3, 2),
('Kit Nascimento Bordado',         'Enxoval Bebê',   180.00, true,  2, 1),
('Pano de Prato Bordado (2un)',    'Casa',            45.00,  true,  7, 3),
('Touca Bordada para Bebê',        'Enxoval Bebê',   30.00,  false, 0, 0); -- oculto do portfólio

-- ============================================================
-- 6. PEDIDOS E ITENS
-- ============================================================

-- Pedido 1 — Maria (Entregue)
INSERT INTO Pedido (cliente_id, usuario_id, data_pedido, data_entrega, status, valor_total, valor_pago_sinal)
VALUES (1, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days', 'Entregue', 205.00, 100.00);

INSERT INTO ItemPedido (pedido_id, produto_id, quantidade, personalizacao, subtotal) VALUES
(1, 1, 1, 'Bordar nome "Beatriz" em azul cursivo', 85.00),
(1, 3, 1, 'Bordar "BB" em rosa', 35.00),
(1, 8, 1, '', 60.00),
(1, 12, 1, 'Bordar "Família Silva"', 45.00);

-- Pedido 2 — João (Finalizado)
INSERT INTO Pedido (cliente_id, usuario_id, data_pedido, data_entrega, status, valor_total, valor_pago_sinal)
VALUES (2, 1, NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days', 'Finalizado', 125.00, 60.00);

INSERT INTO ItemPedido (pedido_id, produto_id, quantidade, personalizacao, subtotal) VALUES
(2, 6, 1, 'Logo empresa "Padaria São João" em vermelho', 55.00),
(2, 7, 1, 'Logo empresa "Padaria São João" em vermelho', 70.00);

-- Pedido 3 — Ana (Em Produção)
INSERT INTO Pedido (cliente_id, usuario_id, data_pedido, data_entrega, status, valor_total, valor_pago_sinal)
VALUES (3, 1, NOW() - INTERVAL '10 days', NOW() + INTERVAL '5 days', 'Em Produção', 240.00, 120.00);

INSERT INTO ItemPedido (pedido_id, produto_id, quantidade, personalizacao, subtotal) VALUES
(3, 4, 1, 'Bordar "Costa Family" com moldura de flores', 150.00),
(3, 10, 1, 'Bordar "Lar Doce Lar" em rosa e dourado', 90.00);

-- Pedido 4 — Carlos (Aguardando)
INSERT INTO Pedido (cliente_id, usuario_id, data_pedido, data_entrega, status, valor_total, valor_pago_sinal)
VALUES (4, 1, NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 days', 'Aguardando', 120.00, 0.00);

INSERT INTO ItemPedido (pedido_id, produto_id, quantidade, personalizacao, subtotal) VALUES
(4, 2, 1, 'Bordar nome "Lucas" em azul royal', 120.00);

-- Pedido 5 — Fernanda (Aguardando)
INSERT INTO Pedido (cliente_id, usuario_id, data_pedido, data_entrega, status, valor_total, valor_pago_sinal)
VALUES (5, 1, NOW() - INTERVAL '1 day', NOW() + INTERVAL '14 days', 'Aguardando', 275.00, 130.00);

INSERT INTO ItemPedido (pedido_id, produto_id, quantidade, personalizacao, subtotal) VALUES
(5, 9, 1, 'Bordar monograma "FL" nas pontas', 200.00),
(5, 12, 2, 'Bordar "Lima" em cada pano', 75.00);

-- Pedido 6 — Maria (segundo pedido — Aguardando)
INSERT INTO Pedido (cliente_id, usuario_id, data_pedido, data_entrega, status, valor_total, valor_pago_sinal)
VALUES (1, 1, NOW(), NOW() + INTERVAL '10 days', 'Aguardando', 180.00, 90.00);

INSERT INTO ItemPedido (pedido_id, produto_id, quantidade, personalizacao, subtotal) VALUES
(6, 11, 1, 'Bordar nome "Pedro" com estrelinhas', 180.00);

-- ============================================================
-- 7. COMPRAS DE INSUMOS
-- ============================================================
INSERT INTO RegistroCompra (fornecedor_id, materia_prima_id, quantidade, valor_custo_total, data_compra) VALUES
(1, 1, 50.00, 125.00, NOW() - INTERVAL '45 days'),
(1, 2, 20.00,  60.00, NOW() - INTERVAL '45 days'),
(2, 5, 30.00, 210.00, NOW() - INTERVAL '40 days'),
(3, 3, 15.00,  45.00, NOW() - INTERVAL '30 days'),
(3, 4, 10.00,  30.00, NOW() - INTERVAL '15 days'),
(4, 9,100.00,  50.00, NOW() - INTERVAL '20 days');

-- ============================================================
-- 8. TRANSAÇÕES FINANCEIRAS
-- ============================================================

-- Receitas (pedidos entregues/finalizados)
INSERT INTO TransacaoFinanceira (tipo, descricao, valor, data_pagamento, pedido_id) VALUES
('Receita', 'Venda - Pedido #1 (Maria Silva)',    205.00, NOW() - INTERVAL '15 days', 1),
('Receita', 'Venda - Pedido #2 (João Pereira)',   125.00, NOW() - INTERVAL '5 days',  2),
('Receita', 'Sinal - Pedido #3 (Ana Costa)',      120.00, NOW() - INTERVAL '10 days', 3),
('Receita', 'Sinal - Pedido #5 (Fernanda Lima)',  130.00, NOW() - INTERVAL '1 day',   5),
('Receita', 'Sinal - Pedido #6 (Maria Silva)',     90.00, NOW(),                       6);

-- Despesas (compras de insumos)
INSERT INTO TransacaoFinanceira (tipo, descricao, valor, data_pagamento, compra_id) VALUES
('Despesa', 'Compra: Linha Branca — Armarinho Central',  125.00, NOW() - INTERVAL '45 days', 1),
('Despesa', 'Compra: Linha Azul — Armarinho Central',     60.00, NOW() - INTERVAL '45 days', 2),
('Despesa', 'Compra: Tecido Aida Branco — Tecidos & Cia',210.00, NOW() - INTERVAL '40 days', 3),
('Despesa', 'Compra: Linha Rosa — Linhas do Sul',         45.00, NOW() - INTERVAL '30 days', 4),
('Despesa', 'Compra: Linha Vermelha — Linhas do Sul',     30.00, NOW() - INTERVAL '15 days', 5),
('Despesa', 'Compra: Agulhas — Casa do Bordado SP',       50.00, NOW() - INTERVAL '20 days', 6);

-- ============================================================
-- 9. LOG DE AUDITORIA
-- ============================================================
INSERT INTO LogsAuditoria (usuario_id, acao, detalhes, data_hora) VALUES
(1, 'LOGIN',           'Administrador autenticado no sistema',             NOW() - INTERVAL '30 days'),
(1, 'ATUALIZAR_PEDIDO','Pedido #1 atualizado para status: Entregue',       NOW() - INTERVAL '15 days'),
(1, 'ATUALIZAR_PEDIDO','Pedido #2 atualizado para status: Em Produção',    NOW() - INTERVAL '18 days'),
(1, 'ATUALIZAR_PEDIDO','Pedido #2 atualizado para status: Finalizado',     NOW() - INTERVAL '5 days'),
(1, 'ATUALIZAR_PEDIDO','Pedido #3 atualizado para status: Em Produção',    NOW() - INTERVAL '8 days');

-- ============================================================
-- RESUMO FINAL
-- ============================================================
SELECT 'Usuários'       AS tabela, COUNT(*) AS registros FROM Usuario
UNION ALL
SELECT 'Clientes',       COUNT(*) FROM Cliente
UNION ALL
SELECT 'Produtos',       COUNT(*) FROM Produto
UNION ALL
SELECT 'Fornecedores',   COUNT(*) FROM Fornecedor
UNION ALL
SELECT 'Matérias-Primas',COUNT(*) FROM MateriaPrima
UNION ALL
SELECT 'Pedidos',        COUNT(*) FROM Pedido
UNION ALL
SELECT 'Itens de Pedido',COUNT(*) FROM ItemPedido
UNION ALL
SELECT 'Compras',        COUNT(*) FROM RegistroCompra
UNION ALL
SELECT 'Transações',     COUNT(*) FROM TransacaoFinanceira
UNION ALL
SELECT 'Logs',           COUNT(*) FROM LogsAuditoria;
