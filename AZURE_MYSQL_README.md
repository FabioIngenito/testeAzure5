# 🔗 Configuração Azure MySQL - TechBook Store

## 📋 Informações da Conexão

### **Servidor Azure MySQL**

- **Host**: `marketingdbfabioi2.mysql.database.azure.com`
- **Porta**: `3389`
- **Usuário**: `azureuser`
- **Senha**: `12qwaszxQWASZX`
- **SSL**: Obrigatório
- **Banco de dados**: `techbook_store`

## 🚀 Configuração Inicial

### **1. Instalar Dependências**

```bash
npm install
```

### **2. Criar Banco de Dados no Azure**

Se o banco `techbook_store` ainda não existe, crie-o via:

**Portal Azure:**

1. Acesse o servidor MySQL no portal Azure
2. Vá em "Databases"
3. Clique em "Add" e crie `techbook_store`

**Via MySQL CLI:**

```bash
mysql -h marketingdbfabioi2.mysql.database.azure.com -P 3389 -u azureuser -p --ssl-mode=REQUIRED -e "CREATE DATABASE IF NOT EXISTS techbook_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### **3. Executar Script do Banco**

```bash
mysql -h marketingdbfabioi2.mysql.database.azure.com -P 3389 -u azureuser -p --ssl-mode=REQUIRED techbook_store < database.sql
```

### **4. Testar Conexão**

```bash
npm test
```

### **5. Iniciar API**

```bash
npm start
```

## 🛠️ Scripts Disponíveis

- **`npm start`** - Inicia API com Azure MySQL
- **`npm start-local`** - Inicia API com dados simulados
- **`npm test`** - Testa conexão com Azure MySQL
- **`npm run setup-db`** - Mostra comando para configurar banco

## 🔒 Configurações de SSL

A conexão com Azure MySQL **requer SSL**. A configuração está em `database-config.js`:

```javascript
ssl: {
    rejectUnauthorized: false,
    require: true
}
```

## 🌐 Configuração de Firewall

Para acessar o Azure MySQL, verifique se:

1. **Firewall do Azure** permite seu IP
2. **Porta 3389** está acessível
3. **SSL está habilitado** no servidor

### **Adicionar seu IP ao Firewall:**

```bash
# Via Azure CLI
az mysql server firewall-rule create \
  --resource-group <resource-group> \
  --server marketingdbfabioi2 \
  --name AllowMyIP \
  --start-ip-address <seu-ip> \
  --end-ip-address <seu-ip>
```

## 📊 Endpoints da API

### **Health Check**

```
GET /api/health
```

Verifica status da conexão com o banco.

### **Produtos**

```
GET /api/produtos              # Listar todos
GET /api/produtos/:id          # Produto específico
PUT /api/produtos/:id/estoque  # Atualizar estoque
```

### **Contatos**

```
POST /api/contatos    # Registrar contato
GET /api/contatos     # Listar contatos (admin)
```

### **Estatísticas**

```
GET /api/estatisticas # Dados agregados
```

## 🧪 Testando a API

### **1. Health Check**

```bash
curl http://localhost:3000/api/health
```

### **2. Listar Produtos**

```bash
curl http://localhost:3000/api/produtos
```

### **3. Registrar Contato**

```bash
curl -X POST http://localhost:3000/api/contatos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "mensagem": "Interesse no TechBook Pro",
    "produto_id": 1
  }'
```

## 🐛 Solução de Problemas

### **Erro de Conexão**

```
❌ Error: connect ECONNREFUSED
```

**Solução:**

- Verifique se o firewall do Azure permite seu IP
- Confirme as credenciais de acesso
- Teste conectividade na porta 3389

### **Erro de SSL**

```
❌ Error: SSL connection error
```

**Solução:**

- Certifique-se que SSL está habilitado
- Use `--ssl-mode=REQUIRED` no MySQL CLI
- Verifique configuração SSL na API

### **Erro de Autenticação**

```
❌ Error: Access denied for user 'azureuser'
```

**Solução:**

- Confirme usuário e senha
- Verifique permissões no Azure MySQL
- Teste login direto via MySQL CLI

### **Banco não encontrado**

```
❌ Error: Unknown database 'techbook_store'
```

**Solução:**

- Crie o banco via portal Azure ou CLI
- Execute o script database.sql
- Verifique nome do banco na conexão

## 📝 Logs de Exemplo

### **Conexão Bem-sucedida:**

```
🔄 Testando conexão com Azure MySQL...
✅ Conexão com Azure MySQL estabelecida com sucesso!
📊 Resultado do teste: [{"test":1}]
🚀 API TechBook rodando em http://localhost:3000
🔗 Conectado ao Azure MySQL: marketingdbfabioi2.mysql.database.azure.com:3389
```

### **Erro de Conexão:**

```
❌ Erro ao conectar com Azure MySQL: connect ETIMEDOUT
💡 Verifique se:
   - O banco de dados existe
   - As credenciais estão corretas
   - O firewall do Azure permite sua conexão
   - A porta 3389 está acessível
```

## 🔄 Migração de Dados

Se você tem dados existentes, use:

```sql
-- Backup dos dados atuais
mysqldump -h localhost -u root -p techbook_store > backup_local.sql

-- Importar para Azure MySQL
mysql -h marketingdbfabioi2.mysql.database.azure.com -P 3389 -u azureuser -p --ssl-mode=REQUIRED techbook_store < backup_local.sql
```

## 🎯 Próximos Passos

1. ✅ Configurar banco Azure MySQL
2. ✅ Executar script de criação
3. ✅ Testar conexão da API
4. ✅ Verificar site com dados reais
5. 🔄 Configurar deploy em produção
6. 🔄 Implementar monitoramento
7. 🔄 Backup automático

---

**💡 Dica:** Mantenha as credenciais seguras e considere usar variáveis de ambiente em produção!
