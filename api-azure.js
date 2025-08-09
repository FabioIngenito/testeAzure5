// ====================================================
// API INTEGRADA COM AZURE MYSQL
// Versão para produção com banco de dados real
// ====================================================

const express = require("express");
const cors = require("cors");
const {
  executarConsulta,
  executarProcedure,
  testarConexao,
  inicializarBanco,
  fecharConexoes,
} = require("./database-config");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:5500", "*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ====================================================
// ENDPOINTS DA API
// ====================================================

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    const isConnected = await testarConexao();
    res.json({
      success: true,
      status: isConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      database: "Azure MySQL",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Listar todos os produtos
app.get("/api/produtos", async (req, res) => {
  try {
    console.log("🔍 Buscando produtos no banco...");

    const produtos = await executarConsulta(`
            SELECT 
                id, nome, modelo, descricao, preco,
                processador, placa_grafica, memoria_ram, armazenamento,
                tela_tamanho, tela_resolucao, tela_tipo, peso, espessura,
                portas, wireless, estoque, status,
                data_cadastro, data_atualizacao
            FROM produtos 
            WHERE status = 'ativo'
            ORDER BY 
                CASE WHEN modelo = 'TBP-2025-I7' THEN 0 ELSE 1 END,
                preco DESC
        `);

    console.log(`✅ Encontrados ${produtos.length} produtos`);

    res.json({
      success: true,
      data: produtos,
      total: produtos.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao buscar produtos:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produtos no banco de dados",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Buscar produto específico
app.get("/api/produtos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando produto ID: ${id}`);

    const produtos = await executarConsulta(
      `
            SELECT 
                id, nome, modelo, descricao, preco,
                processador, placa_grafica, memoria_ram, armazenamento,
                tela_tamanho, tela_resolucao, tela_tipo, peso, espessura,
                portas, wireless, estoque, status,
                data_cadastro, data_atualizacao
            FROM produtos 
            WHERE id = ? AND status = 'ativo'
        `,
      [parseInt(id)]
    );

    if (produtos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado ou inativo",
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`✅ Produto encontrado: ${produtos[0].nome}`);

    res.json({
      success: true,
      data: produtos[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao buscar produto:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produto no banco de dados",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Registrar contato usando procedure
app.post("/api/contatos", async (req, res) => {
  try {
    const { nome, email, telefone, mensagem, produto_id } = req.body;

    console.log(`📞 Registrando contato: ${nome} - ${email}`);

    // Validações básicas
    if (!nome || !email) {
      return res.status(400).json({
        success: false,
        message: "Nome e email são obrigatórios",
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar se o produto existe (se especificado)
    if (produto_id) {
      const produto = await executarConsulta(
        'SELECT id, nome FROM produtos WHERE id = ? AND status = "ativo"',
        [produto_id]
      );

      if (produto.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Produto não encontrado ou inativo",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Usar procedure para registrar contato
    const resultado = await executarProcedure("RegistrarContato", [
      nome,
      email,
      telefone || null,
      mensagem || "Contato via site TechBook",
      produto_id || null,
      req.ip || "N/A",
      req.get("User-Agent") || "N/A",
    ]);

    const contatoId =
      resultado[0] && resultado[0][0] ? resultado[0][0].contato_id : null;

    console.log(`✅ Contato registrado com ID: ${contatoId}`);

    res.json({
      success: true,
      message: "Contato registrado com sucesso",
      contato_id: contatoId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao registrar contato:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro ao registrar contato no banco de dados",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Estatísticas do sistema
app.get("/api/estatisticas", async (req, res) => {
  try {
    console.log("📊 Gerando estatísticas...");

    // Contar produtos
    const [contadorProdutos] = await executarConsulta(`
            SELECT COUNT(*) as total FROM produtos WHERE status = 'ativo'
        `);

    // Contar produtos em estoque
    const [produtosEstoque] = await executarConsulta(`
            SELECT COUNT(*) as total FROM produtos WHERE status = 'ativo' AND estoque > 0
        `);

    // Contar contatos
    const [contadorContatos] = await executarConsulta(`
            SELECT COUNT(*) as total FROM contatos
        `);

    // Produtos mais procurados
    const produtosProcurados = await executarConsulta(`
            SELECT 
                p.id,
                p.nome,
                p.modelo,
                p.preco,
                COUNT(c.id) as total_interessados
            FROM produtos p
            LEFT JOIN contatos c ON p.id = c.produto_interesse_id
            WHERE p.status = 'ativo'
            GROUP BY p.id, p.nome, p.modelo, p.preco
            ORDER BY total_interessados DESC, p.preco DESC
            LIMIT 3
        `);

    const stats = {
      total_produtos: contadorProdutos.total || 0,
      produtos_em_estoque: produtosEstoque.total || 0,
      total_interessados: contadorContatos.total || 0,
      produtos_mais_procurados: produtosProcurados || [],
    };

    console.log("✅ Estatísticas geradas:", stats);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao gerar estatísticas:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro ao gerar estatísticas",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Listar contatos (para admin)
app.get("/api/contatos", async (req, res) => {
  try {
    console.log("📋 Buscando contatos...");

    const contatos = await executarConsulta(`
            SELECT 
                c.id,
                c.nome,
                c.email,
                c.telefone,
                c.mensagem,
                c.status_contato,
                c.origem,
                c.data_primeiro_contato,
                p.nome as produto_interesse_nome,
                p.modelo as produto_interesse_modelo,
                p.preco as produto_interesse_preco
            FROM contatos c
            LEFT JOIN produtos p ON c.produto_interesse_id = p.id
            ORDER BY c.data_primeiro_contato DESC
            LIMIT 50
        `);

    console.log(`✅ Encontrados ${contatos.length} contatos`);

    res.json({
      success: true,
      data: contatos,
      total: contatos.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao buscar contatos:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar contatos no banco de dados",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Atualizar estoque de produto
app.put("/api/produtos/:id/estoque", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, operacao } = req.body;

    console.log(
      `📦 Atualizando estoque do produto ${id}: ${operacao} ${quantidade}`
    );

    if (!["adicionar", "remover"].includes(operacao)) {
      return res.status(400).json({
        success: false,
        message: 'Operação deve ser "adicionar" ou "remover"',
        timestamp: new Date().toISOString(),
      });
    }

    const resultado = await executarProcedure("AtualizarEstoque", [
      parseInt(id),
      parseInt(quantidade),
      operacao,
    ]);

    const produtoAtualizado =
      resultado[0] && resultado[0][0] ? resultado[0][0] : null;

    console.log(`✅ Estoque atualizado:`, produtoAtualizado);

    res.json({
      success: true,
      message: "Estoque atualizado com sucesso",
      data: produtoAtualizado,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar estoque:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar estoque no banco de dados",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("❌ Erro não tratado:", err.stack);
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.path} não encontrado`,
    timestamp: new Date().toISOString(),
  });
});

// Inicializar servidor
async function iniciarServidor() {
  try {
    console.log("🚀 Iniciando API TechBook...");

    // Testar conexão com banco
    const conexaoOk = await testarConexao();
    if (!conexaoOk) {
      console.log("⚠️  Continuando sem conexão com banco (modo fallback)");
    }

    // Verificar estrutura do banco
    if (conexaoOk) {
      const bancoOk = await inicializarBanco();
      if (!bancoOk) {
        console.log("⚠️  Estrutura do banco não verificada");
      }
    }

    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(`✅ API TechBook rodando em http://localhost:${PORT}`);
      console.log(
        `🔗 Conectado ao Azure MySQL: marketingdbfabioi2.mysql.database.azure.com:3389`
      );
      console.log(`📊 Endpoints disponíveis:`);
      console.log(`   GET  /api/health - Health check`);
      console.log(`   GET  /api/produtos - Listar produtos`);
      console.log(`   GET  /api/produtos/:id - Buscar produto específico`);
      console.log(`   POST /api/contatos - Registrar contato`);
      console.log(`   GET  /api/contatos - Listar contatos`);
      console.log(`   GET  /api/estatisticas - Estatísticas`);
      console.log(`   PUT  /api/produtos/:id/estoque - Atualizar estoque`);
      console.log(`\n💡 Para testar a API:`);
      console.log(`   curl http://localhost:${PORT}/api/health`);
      console.log(`   curl http://localhost:${PORT}/api/produtos`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n👋 Encerrando API TechBook...");

      server.close(async () => {
        console.log("🔌 Servidor HTTP fechado");
        await fecharConexoes();
        console.log("✅ Shutdown completo");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("👋 Recebido SIGTERM, encerrando graciosamente...");
      server.close(async () => {
        await fecharConexoes();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error.message);
    process.exit(1);
  }
}

// Iniciar a aplicação
iniciarServidor();
