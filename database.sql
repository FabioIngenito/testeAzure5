-- ====================================================
-- BANCO DE DADOS: TechBook Store
-- Descrição: Sistema de gerenciamento para loja de notebooks
-- Data: 09/08/2025
-- Configurado para Azure MySQL
-- ====================================================

-- Configurações para Azure MySQL
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criação do banco de dados (se não existir)
-- No Azure MySQL, o banco deve ser criado via portal ou CLI
-- CREATE DATABASE IF NOT EXISTS techbook_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE techbook_store;

-- Para Azure MySQL, assumimos que já estamos conectados ao banco correto
-- Verificar se estamos no banco correto
SELECT DATABASE() as current_database;

-- ====================================================
-- TABELA 1: produtos
-- Armazena informações dos notebooks disponíveis
-- ====================================================

DROP TABLE IF EXISTS produtos;

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    
    -- Especificações de Processamento
    processador VARCHAR(100),
    placa_grafica VARCHAR(100),
    
    -- Memória e Armazenamento
    memoria_ram VARCHAR(50),
    armazenamento VARCHAR(100),
    
    -- Display e Design
    tela_tamanho VARCHAR(20),
    tela_resolucao VARCHAR(30),
    tela_tipo VARCHAR(20),
    peso DECIMAL(3, 1),
    espessura DECIMAL(4, 1),
    
    -- Conectividade
    portas TEXT,
    wireless VARCHAR(100),
    
    -- Controle de estoque e status
    estoque INT DEFAULT 0,
    status ENUM('ativo', 'inativo', 'descontinuado') DEFAULT 'ativo',
    
    -- Metadados
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_nome (nome),
    INDEX idx_modelo (modelo),
    INDEX idx_preco (preco),
    INDEX idx_status (status)
);

-- ====================================================
-- TABELA 2: contatos
-- Armazena informações dos leads/clientes interessados
-- ====================================================

DROP TABLE IF EXISTS contatos;

CREATE TABLE contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    mensagem TEXT,
    
    -- Relacionamento com produto
    produto_interesse_id INT,
    
    -- Status do lead
    status_contato ENUM('novo', 'em_andamento', 'respondido', 'finalizado') DEFAULT 'novo',
    origem ENUM('site', 'email', 'telefone', 'loja_fisica', 'redes_sociais') DEFAULT 'site',
    
    -- Informações adicionais
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Controle de comunicação
    data_primeiro_contato TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_ultimo_contato TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    respondido_em TIMESTAMP NULL,
    respondido_por VARCHAR(100),
    
    -- Chave estrangeira
    FOREIGN KEY (produto_interesse_id) REFERENCES produtos(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_email (email),
    INDEX idx_nome (nome),
    INDEX idx_status (status_contato),
    INDEX idx_produto_interesse (produto_interesse_id),
    INDEX idx_data_contato (data_primeiro_contato)
);

-- ====================================================
-- INSERÇÃO DE DADOS DE EXEMPLO
-- ====================================================

-- Inserindo o produto principal do site: TechBook Pro
INSERT INTO produtos (
    nome, modelo, descricao, preco,
    processador, placa_grafica,
    memoria_ram, armazenamento,
    tela_tamanho, tela_resolucao, tela_tipo, peso, espessura,
    portas, wireless, estoque
) VALUES (
    'TechBook Pro',
    'TBP-2025-I7',
    'O notebook que redefine os padrões de performance, design e inovação. Projetado para profissionais que não aceitam limitações.',
    4999.00,
    'Intel Core i7-12700H (14 cores, 20 threads)',
    'NVIDIA GeForce RTX 4060 8GB GDDR6',
    '32GB DDR5-4800MHz (2x16GB)',
    'SSD NVMe M.2 1TB PCIe 4.0',
    '15.6"',
    '3840x2160',
    '4K OLED',
    1.8,
    18.9,
    '2x USB-C Thunderbolt 4, 2x USB 3.2, HDMI 2.1',
    'Wi-Fi 6E, Bluetooth 5.3',
    25
);

-- Inserindo produtos adicionais para demonstrar a flexibilidade do banco
INSERT INTO produtos (
    nome, modelo, descricao, preco,
    processador, placa_grafica,
    memoria_ram, armazenamento,
    tela_tamanho, tela_resolucao, tela_tipo, peso, espessura,
    portas, wireless, estoque
) VALUES 
(
    'TechBook Air',
    'TBA-2025-I5',
    'Notebook ultraleve para produtividade e mobilidade. Ideal para trabalho e estudos.',
    2999.00,
    'Intel Core i5-12500H (12 cores, 16 threads)',
    'Intel Iris Xe Graphics',
    '16GB DDR5-4800MHz (2x8GB)',
    'SSD NVMe M.2 512GB PCIe 4.0',
    '14"',
    '1920x1080',
    'IPS',
    1.2,
    14.8,
    '2x USB-C Thunderbolt 4, 1x USB 3.2, HDMI 2.1',
    'Wi-Fi 6E, Bluetooth 5.3',
    40
),
(
    'TechBook Gaming',
    'TBG-2025-I9',
    'Notebook gamer de alta performance para jogos e criação de conteúdo profissional.',
    7999.00,
    'Intel Core i9-12900H (16 cores, 24 threads)',
    'NVIDIA GeForce RTX 4070 12GB GDDR6',
    '64GB DDR5-5200MHz (2x32GB)',
    'SSD NVMe M.2 2TB PCIe 4.0',
    '17.3"',
    '2560x1440',
    'QHD IPS 165Hz',
    2.8,
    22.5,
    '3x USB-C Thunderbolt 4, 2x USB 3.2, HDMI 2.1, RJ45',
    'Wi-Fi 6E, Bluetooth 5.3',
    15
);

-- Inserindo contatos de exemplo
INSERT INTO contatos (
    nome, email, telefone, mensagem, produto_interesse_id, origem
) VALUES 
(
    'Ana Silva',
    'ana.silva@email.com',
    '(11) 98765-4321',
    'Gostaria de mais informações sobre o TechBook Pro. Trabalho com design gráfico e preciso de um notebook potente.',
    1,
    'site'
),
(
    'Carlos Santos',
    'carlos.santos@empresa.com',
    '(11) 91234-5678',
    'Estou interessado no TechBook Air para trabalho. Preciso saber sobre garantia e suporte técnico.',
    2,
    'site'
),
(
    'Maria Oliveira',
    'maria.oliveira@gmail.com',
    '(21) 99876-5432',
    'Procuro um notebook para jogos. O TechBook Gaming seria adequado para streaming também?',
    3,
    'site'
),
(
    'João Costa',
    'joao.costa@outlook.com',
    '(11) 95555-1111',
    'Qual é o prazo de entrega do TechBook Pro? Preciso urgente para um projeto.',
    1,
    'site'
),
(
    'Fernanda Lima',
    'fernanda.lima@yahoo.com',
    '(31) 94444-2222',
    'Gostaria de agendar uma demonstração dos produtos TechBook.',
    NULL,
    'site'
);

-- ====================================================
-- CONSULTAS ÚTEIS PARA O SISTEMA
-- ====================================================

-- Visualizar todos os produtos ativos
SELECT 
    id,
    nome,
    modelo,
    CONCAT('R$ ', FORMAT(preco, 2, 'de_DE')) as preco_formatado,
    processador,
    memoria_ram,
    estoque,
    status
FROM produtos 
WHERE status = 'ativo'
ORDER BY preco DESC;

-- Visualizar contatos pendentes com informações do produto
SELECT 
    c.id,
    c.nome,
    c.email,
    c.telefone,
    c.status_contato,
    c.data_primeiro_contato,
    p.nome as produto_interesse,
    p.modelo
FROM contatos c
LEFT JOIN produtos p ON c.produto_interesse_id = p.id
WHERE c.status_contato IN ('novo', 'em_andamento')
ORDER BY c.data_primeiro_contato DESC;

-- Relatório de produtos mais procurados
SELECT 
    p.nome,
    p.modelo,
    COUNT(c.id) as total_interessados,
    CONCAT('R$ ', FORMAT(p.preco, 2, 'de_DE')) as preco
FROM produtos p
LEFT JOIN contatos c ON p.id = c.produto_interesse_id
GROUP BY p.id, p.nome, p.modelo, p.preco
ORDER BY total_interessados DESC, p.preco DESC;

-- ====================================================
-- PROCEDIMENTOS ARMAZENADOS ÚTEIS
-- ====================================================

DELIMITER $$

-- Procedure para registrar novo contato
CREATE PROCEDURE RegistrarContato(
    IN p_nome VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_telefone VARCHAR(20),
    IN p_mensagem TEXT,
    IN p_produto_id INT,
    IN p_ip VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    INSERT INTO contatos (
        nome, email, telefone, mensagem, 
        produto_interesse_id, ip_address, user_agent
    ) VALUES (
        p_nome, p_email, p_telefone, p_mensagem,
        p_produto_id, p_ip, p_user_agent
    );
    
    SELECT LAST_INSERT_ID() as contato_id;
END$$

-- Procedure para atualizar estoque
CREATE PROCEDURE AtualizarEstoque(
    IN p_produto_id INT,
    IN p_quantidade INT,
    IN p_operacao ENUM('adicionar', 'remover')
)
BEGIN
    IF p_operacao = 'adicionar' THEN
        UPDATE produtos 
        SET estoque = estoque + p_quantidade,
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = p_produto_id;
    ELSE
        UPDATE produtos 
        SET estoque = GREATEST(0, estoque - p_quantidade),
            data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = p_produto_id;
    END IF;
    
    SELECT id, nome, estoque 
    FROM produtos 
    WHERE id = p_produto_id;
END$$

DELIMITER ;

-- ====================================================
-- VIEWS ÚTEIS
-- ====================================================

-- View para produtos em destaque (com estoque e ativos)
CREATE VIEW produtos_destaque AS
SELECT 
    id,
    nome,
    modelo,
    descricao,
    preco,
    processador,
    memoria_ram,
    tela_tamanho,
    tela_tipo,
    estoque
FROM produtos 
WHERE status = 'ativo' AND estoque > 0
ORDER BY preco DESC;

-- View para relatório de contatos
CREATE VIEW relatorio_contatos AS
SELECT 
    c.id,
    c.nome,
    c.email,
    c.telefone,
    c.status_contato,
    c.origem,
    c.data_primeiro_contato,
    p.nome as produto_interesse,
    CONCAT('R$ ', FORMAT(p.preco, 2, 'de_DE')) as valor_produto
FROM contatos c
LEFT JOIN produtos p ON c.produto_interesse_id = p.id
ORDER BY c.data_primeiro_contato DESC;

-- ====================================================
-- COMENTÁRIOS FINAIS
-- ====================================================

/*
Este banco de dados foi projetado para suportar o site TechBook e inclui:

1. TABELA PRODUTOS:
   - Armazena todas as especificações técnicas dos notebooks
   - Controla estoque e status dos produtos
   - Permite expansão para novos modelos

2. TABELA CONTATOS:
   - Gerencia leads e interessados
   - Relaciona contatos com produtos específicos
   - Controla status de atendimento

3. RECURSOS ADICIONAIS:
   - Procedures para operações comuns
   - Views para consultas frequentes
   - Índices para performance
   - Relacionamento 1:N entre produtos e contatos

Para usar este banco com o site, você pode criar uma API REST
que conecte o formulário de contato HTML com essas tabelas.
*/
