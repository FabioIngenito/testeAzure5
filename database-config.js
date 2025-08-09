// ====================================================
// CONFIGURAÇÃO DO BANCO DE DADOS AZURE MYSQL
// Suporte a variáveis de ambiente
// ====================================================

const mysql = require("mysql2/promise");

// Tentar carregar variáveis de ambiente (opcional)
try {
  require("dotenv").config();
} catch (err) {
  // dotenv não instalado, usar valores hardcoded
  console.log("💡 dotenv não encontrado, usando configuração direta");
}

// Configuração da conexão com Azure MySQL
const dbConfig = {
  host: process.env.DB_HOST || "marketingdbfabioi2.mysql.database.azure.com",
  port: parseInt(process.env.DB_PORT) || 3389,
  user: process.env.DB_USER || "azureuser",
  password: process.env.DB_PASSWORD || "12qwaszxQWASZX",
  database: process.env.DB_DATABASE || "techbook_store",
  ssl: {
    rejectUnauthorized:
      process.env.DB_SSL_REJECT_UNAUTHORIZED === "true" ? true : false,
    // Azure MySQL requer SSL
    require: process.env.DB_SSL_REQUIRED !== "true",
  },
  connectTimeout: parseInt(process.env.DB_TIMEOUT) || 60000,
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
  timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
  reconnect: true,
  charset: "utf8mb4",
};

// Pool de conexões para melhor performance
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Função para testar conexão
async function testarConexao() {
  try {
    console.log("🔄 Testando conexão com Azure MySQL...");
    const connection = await pool.getConnection();

    // Teste simples
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log("✅ Conexão com Azure MySQL estabelecida com sucesso!");
    console.log(`📊 Resultado do teste: ${JSON.stringify(rows)}`);

    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com Azure MySQL:", error.message);
    console.error("💡 Verifique se:");
    console.error("   - O banco de dados existe");
    console.error("   - As credenciais estão corretas");
    console.error("   - O firewall do Azure permite sua conexão");
    console.error("   - A porta 3389 está acessível");
    return false;
  }
}

// Função para executar consultas
async function executarConsulta(sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ Erro na consulta SQL:", error.message);
    console.error("🔍 SQL:", sql);
    console.error("📋 Parâmetros:", params);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Função para executar procedure
async function executarProcedure(procedureName, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const placeholders = params.map(() => "?").join(", ");
    const sql = `CALL ${procedureName}(${placeholders})`;
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ Erro ao executar procedure:", error.message);
    console.error("🔍 Procedure:", procedureName);
    console.error("📋 Parâmetros:", params);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Função para inicializar o banco (criar tabelas se não existirem)
async function inicializarBanco() {
  try {
    console.log("🔄 Inicializando estrutura do banco...");

    // Verificar se as tabelas existem
    const tabelas = await executarConsulta(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'techbook_store'
        `);

    const tabelasExistentes = tabelas.map((t) => t.TABLE_NAME);
    console.log("📋 Tabelas encontradas:", tabelasExistentes);

    // Se não existir a tabela produtos, criar estrutura
    if (!tabelasExistentes.includes("produtos")) {
      console.log(
        "⚠️  Tabelas não encontradas. Execute o script database.sql primeiro."
      );
      console.log("💡 Para criar as tabelas, execute:");
      console.log(
        "   mysql -h marketingdbfabioi2.mysql.database.azure.com -P 3389 -u azureuser -p --ssl-mode=REQUIRED < database.sql"
      );
      return false;
    }

    console.log("✅ Estrutura do banco verificada com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error.message);
    return false;
  }
}

// Fechar pool de conexões graciosamente
async function fecharConexoes() {
  try {
    await pool.end();
    console.log("👋 Pool de conexões fechado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao fechar conexões:", error.message);
  }
}

module.exports = {
  pool,
  executarConsulta,
  executarProcedure,
  testarConexao,
  inicializarBanco,
  fecharConexoes,
  dbConfig,
};
