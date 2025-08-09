# 📊 Banco de Dados TechBook Store

## Visão Geral

Este banco de dados foi criado especificamente para o site **TechBook Pro**, oferecendo um sistema completo para gerenciar produtos (notebooks) e contatos/leads de clientes interessados.

## 🗃️ Estrutura do Banco

### Tabela 1: `produtos`

Armazena informações completas dos notebooks disponíveis na loja.

**Campos principais:**

- `id` - Identificador único do produto
- `nome` - Nome comercial (ex: "TechBook Pro")
- `modelo` - Código do modelo (ex: "TBP-2025-I7")
- `descricao` - Descrição detalhada do produto
- `preco` - Preço em reais (DECIMAL)
- `processador` - Especificações do processador
- `placa_grafica` - Informações da placa gráfica
- `memoria_ram` - Capacidade e tipo de memória
- `armazenamento` - Tipo e capacidade de armazenamento
- `tela_*` - Especificações da tela (tamanho, resolução, tipo)
- `peso` / `espessura` - Dimensões físicas
- `portas` / `wireless` - Conectividade
- `estoque` - Quantidade disponível
- `status` - Status do produto (ativo/inativo/descontinuado)

### Tabela 2: `contatos`

Gerencia leads e contatos de clientes interessados.

**Campos principais:**

- `id` - Identificador único do contato
- `nome` - Nome completo do cliente
- `email` - Email de contato
- `telefone` - Número de telefone
- `mensagem` - Mensagem enviada pelo cliente
- `produto_interesse_id` - **FK** para produtos (relacionamento)
- `status_contato` - Status do atendimento
- `origem` - Canal de origem do contato
- `data_primeiro_contato` / `data_ultimo_contato` - Controle temporal

## 🔗 Relacionamento

- **1:N** - Um produto pode ter vários contatos interessados
- **N:1** - Cada contato pode demonstrar interesse em um produto específico
- Chave estrangeira: `contatos.produto_interesse_id → produtos.id`

## 📈 Funcionalidades Incluídas

### Procedures Armazenados

1. **`RegistrarContato`** - Registra novos leads do site
2. **`AtualizarEstoque`** - Gerencia estoque de produtos

### Views

1. **`produtos_destaque`** - Produtos ativos com estoque
2. **`relatorio_contatos`** - Relatório completo de contatos

### Consultas Úteis

- Lista de produtos ativos
- Contatos pendentes de atendimento
- Produtos mais procurados
- Relatórios de vendas

## 💻 Integração com o Site

### Exemplo de Conexão PHP

```php
<?php
// Configuração do banco
$host = 'localhost';
$dbname = 'techbook_store';
$username = 'seu_usuario';
$password = 'sua_senha';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}

// Função para processar formulário de contato
function processarContato($dados) {
    global $pdo;

    $stmt = $pdo->prepare("
        CALL RegistrarContato(?, ?, ?, ?, ?, ?, ?)
    ");

    return $stmt->execute([
        $dados['nome'],
        $dados['email'],
        $dados['telefone'],
        $dados['mensagem'],
        $dados['produto_id'] ?? null,
        $_SERVER['REMOTE_ADDR'],
        $_SERVER['HTTP_USER_AGENT']
    ]);
}

// Função para buscar produtos
function buscarProdutos() {
    global $pdo;

    $stmt = $pdo->query("SELECT * FROM produtos_destaque");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>
```

### Exemplo de API REST (Node.js + Express)

```javascript
const express = require("express");
const mysql = require("mysql2/promise");
const app = express();

// Configuração do banco
const dbConfig = {
  host: "localhost",
  user: "seu_usuario",
  password: "sua_senha",
  database: "techbook_store",
};

// Middleware
app.use(express.json());

// Endpoint para listar produtos
app.get("/api/produtos", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM produtos_destaque");
    await connection.end();

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Endpoint para registrar contato
app.post("/api/contatos", async (req, res) => {
  try {
    const { nome, email, telefone, mensagem, produto_id } = req.body;
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      "CALL RegistrarContato(?, ?, ?, ?, ?, ?, ?)",
      [
        nome,
        email,
        telefone,
        mensagem,
        produto_id,
        req.ip,
        req.get("User-Agent"),
      ]
    );

    await connection.end();

    res.json({
      success: true,
      message: "Contato registrado com sucesso!",
      contato_id: result[0].contato_id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("API rodando na porta 3000");
});
```

## 🚀 Como Usar

### 1. Instalação

```bash
# Execute o arquivo SQL no MySQL
mysql -u root -p < database.sql
```

### 2. Configuração no Site

Modifique o arquivo `script.js` para enviar dados do formulário para sua API:

```javascript
// No arquivo script.js, modificar a função de envio do formulário
const contactForm = document.querySelector(".contact-form");
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const dados = {
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    mensagem: formData.get("mensagem"),
    produto_id: 1, // TechBook Pro
  };

  try {
    const response = await fetch("/api/contatos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (result.success) {
      showNotification("Mensagem enviada com sucesso!", "success");
      contactForm.reset();
    } else {
      showNotification("Erro ao enviar mensagem.", "error");
    }
  } catch (error) {
    showNotification("Erro de conexão.", "error");
  }
});
```

## 📊 Exemplos de Consultas

### Relatório de Vendas por Produto

```sql
SELECT
    p.nome,
    p.preco,
    p.estoque,
    COUNT(c.id) as leads_gerados,
    COUNT(CASE WHEN c.status_contato = 'finalizado' THEN 1 END) as vendas_fechadas
FROM produtos p
LEFT JOIN contatos c ON p.id = c.produto_interesse_id
GROUP BY p.id
ORDER BY leads_gerados DESC;
```

### Top Produtos Mais Procurados

```sql
SELECT
    p.nome,
    COUNT(c.id) as total_contatos,
    AVG(p.preco) as preco_medio
FROM produtos p
INNER JOIN contatos c ON p.id = c.produto_interesse_id
WHERE c.data_primeiro_contato >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id, p.nome
ORDER BY total_contatos DESC
LIMIT 5;
```

### Análise de Conversão por Canal

```sql
SELECT
    origem,
    COUNT(*) as total_contatos,
    COUNT(CASE WHEN status_contato = 'finalizado' THEN 1 END) as conversoes,
    ROUND(
        (COUNT(CASE WHEN status_contato = 'finalizado' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as taxa_conversao
FROM contatos
GROUP BY origem
ORDER BY taxa_conversao DESC;
```

## 🔧 Manutenção

### Backup Regular

```bash
mysqldump -u root -p techbook_store > backup_$(date +%Y%m%d).sql
```

### Limpeza de Dados Antigos

```sql
-- Remover contatos antigos não respondidos (mais de 6 meses)
DELETE FROM contatos
WHERE status_contato = 'novo'
AND data_primeiro_contato < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

---

**Nota:** Este banco de dados está otimizado para o site TechBook Pro e pode ser facilmente expandido para suportar múltiplos produtos, categorias, usuários e funcionalidades de e-commerce completo.
