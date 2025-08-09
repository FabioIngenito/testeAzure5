// ====================================================
// EXEMPLO DE API SIMPLES PARA INTEGRAÇÃO COM O BANCO
// Para testar o site localmente sem banco real
// ====================================================

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados de exemplo (simulando consulta ao banco de dados)
const produtosExemplo = [
  {
    id: 1,
    nome: "TechBook Pro",
    modelo: "TBP-2025-I7",
    descricao:
      "O notebook que redefine os padrões de performance, design e inovação. Projetado para profissionais que não aceitam limitações.",
    preco: 4999.0,
    processador: "Intel Core i7-12700H (14 cores, 20 threads)",
    placa_grafica: "NVIDIA GeForce RTX 4060 8GB GDDR6",
    memoria_ram: "32GB DDR5-4800MHz (2x16GB)",
    armazenamento: "SSD NVMe M.2 1TB PCIe 4.0",
    tela_tamanho: '15.6"',
    tela_resolucao: "3840x2160",
    tela_tipo: "4K OLED",
    peso: 1.8,
    espessura: 18.9,
    portas: "2x USB-C Thunderbolt 4, 2x USB 3.2, HDMI 2.1",
    wireless: "Wi-Fi 6E, Bluetooth 5.3",
    estoque: 25,
    status: "ativo",
  },
  {
    id: 2,
    nome: "TechBook Air",
    modelo: "TBA-2025-I5",
    descricao:
      "Notebook ultraleve para produtividade e mobilidade. Ideal para trabalho e estudos.",
    preco: 2999.0,
    processador: "Intel Core i5-12500H (12 cores, 16 threads)",
    placa_grafica: "Intel Iris Xe Graphics",
    memoria_ram: "16GB DDR5-4800MHz (2x8GB)",
    armazenamento: "SSD NVMe M.2 512GB PCIe 4.0",
    tela_tamanho: '14"',
    tela_resolucao: "1920x1080",
    tela_tipo: "IPS",
    peso: 1.2,
    espessura: 14.8,
    portas: "2x USB-C Thunderbolt 4, 1x USB 3.2, HDMI 2.1",
    wireless: "Wi-Fi 6E, Bluetooth 5.3",
    estoque: 40,
    status: "ativo",
  },
  {
    id: 3,
    nome: "TechBook Gaming",
    modelo: "TBG-2025-I9",
    descricao:
      "Notebook gamer de alta performance para jogos e criação de conteúdo profissional.",
    preco: 7999.0,
    processador: "Intel Core i9-12900H (16 cores, 24 threads)",
    placa_grafica: "NVIDIA GeForce RTX 4070 12GB GDDR6",
    memoria_ram: "64GB DDR5-5200MHz (2x32GB)",
    armazenamento: "SSD NVMe M.2 2TB PCIe 4.0",
    tela_tamanho: '17.3"',
    tela_resolucao: "2560x1440",
    tela_tipo: "QHD IPS 165Hz",
    peso: 2.8,
    espessura: 22.5,
    portas: "3x USB-C Thunderbolt 4, 2x USB 3.2, HDMI 2.1, RJ45",
    wireless: "Wi-Fi 6E, Bluetooth 5.3",
    estoque: 15,
    status: "ativo",
  },
  {
    id: 4,
    nome: "TechBook Student",
    modelo: "TBS-2025-I3",
    descricao: "Notebook acessível para estudantes e uso básico do dia a dia.",
    preco: 1899.0,
    processador: "Intel Core i3-12100U (4 cores, 8 threads)",
    placa_grafica: "Intel UHD Graphics",
    memoria_ram: "8GB DDR4-3200MHz (1x8GB)",
    armazenamento: "SSD NVMe M.2 256GB PCIe 3.0",
    tela_tamanho: '15.6"',
    tela_resolucao: "1366x768",
    tela_tipo: "TN",
    peso: 2.1,
    espessura: 19.8,
    portas: "1x USB-C, 2x USB 3.0, HDMI 1.4",
    wireless: "Wi-Fi 5, Bluetooth 4.2",
    estoque: 3,
    status: "ativo",
  },
  {
    id: 5,
    nome: "TechBook Workstation",
    modelo: "TBW-2025-I9",
    descricao:
      "Estação de trabalho móvel para profissionais de engenharia e design.",
    preco: 12999.0,
    processador: "Intel Core i9-12950HX (16 cores, 24 threads)",
    placa_grafica: "NVIDIA RTX A4000 16GB",
    memoria_ram: "128GB DDR5-5600MHz (4x32GB)",
    armazenamento: "SSD NVMe M.2 4TB PCIe 4.0",
    tela_tamanho: '17"',
    tela_resolucao: "3840x2400",
    tela_tipo: "4K IPS",
    peso: 3.2,
    espessura: 25.4,
    portas: "4x USB-C Thunderbolt 4, 2x USB 3.2, HDMI 2.1, RJ45, SD Card",
    wireless: "Wi-Fi 6E, Bluetooth 5.3",
    estoque: 0,
    status: "ativo",
  },
];

let contatos = [];

// ====================================================
// ENDPOINTS DA API
// ====================================================

// Listar todos os produtos
app.get("/api/produtos", (req, res) => {
  try {
    // Simular delay de rede
    setTimeout(() => {
      res.json({
        success: true,
        data: produtosExemplo.filter((p) => p.status === "ativo"),
        total: produtosExemplo.length,
      });
    }, 500);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Buscar produto específico
app.get("/api/produtos/:id", (req, res) => {
  try {
    const { id } = req.params;
    const produto = produtosExemplo.find((p) => p.id === parseInt(id));

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: "Produto não encontrado",
      });
    }

    res.json({
      success: true,
      data: produto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Registrar contato
app.post("/api/contatos", (req, res) => {
  try {
    const { nome, email, telefone, mensagem, produto_id } = req.body;

    // Validações básicas
    if (!nome || !email) {
      return res.status(400).json({
        success: false,
        message: "Nome e email são obrigatórios",
      });
    }

    // Verificar se o produto existe (se especificado)
    if (produto_id) {
      const produto = produtosExemplo.find((p) => p.id === produto_id);
      if (!produto) {
        return res.status(400).json({
          success: false,
          message: "Produto não encontrado",
        });
      }
    }

    // Criar novo contato
    const novoContato = {
      id: contatos.length + 1,
      nome,
      email,
      telefone: telefone || null,
      mensagem: mensagem || "",
      produto_interesse_id: produto_id || null,
      status_contato: "novo",
      origem: "site",
      data_primeiro_contato: new Date().toISOString(),
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    };

    contatos.push(novoContato);

    res.json({
      success: true,
      message: "Contato registrado com sucesso",
      contato_id: novoContato.id,
      data: novoContato,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Estatísticas simples
app.get("/api/estatisticas", (req, res) => {
  try {
    const stats = {
      total_produtos: produtosExemplo.length,
      produtos_em_estoque: produtosExemplo.filter((p) => p.estoque > 0).length,
      total_interessados: contatos.length,
      produtos_mais_procurados: produtosExemplo
        .map((p) => ({
          ...p,
          interessados: contatos.filter((c) => c.produto_interesse_id === p.id)
            .length,
        }))
        .sort((a, b) => b.interessados - a.interessados)
        .slice(0, 3),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Listar contatos (para admin)
app.get("/api/contatos", (req, res) => {
  try {
    const contatosComProdutos = contatos.map((contato) => {
      const produto = produtosExemplo.find(
        (p) => p.id === contato.produto_interesse_id
      );
      return {
        ...contato,
        produto_interesse: produto
          ? {
              nome: produto.nome,
              modelo: produto.modelo,
              preco: produto.preco,
            }
          : null,
      };
    });

    res.json({
      success: true,
      data: contatosComProdutos,
      total: contatos.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message,
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Algo deu errado!",
    error: err.message,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API TechBook rodando em http://localhost:${PORT}`);
  console.log(`📊 Endpoints disponíveis:`);
  console.log(`   GET  /api/produtos - Listar produtos`);
  console.log(`   GET  /api/produtos/:id - Buscar produto específico`);
  console.log(`   POST /api/contatos - Registrar contato`);
  console.log(`   GET  /api/contatos - Listar contatos`);
  console.log(`   GET  /api/estatisticas - Estatísticas`);
  console.log(`\n💡 Para testar a API:`);
  console.log(`   curl http://localhost:${PORT}/api/produtos`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Encerrando API TechBook...");
  process.exit(0);
});
