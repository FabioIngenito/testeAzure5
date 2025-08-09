# 🛒 Seção de Produtos - TechBook Store

## 📋 Funcionalidades Implementadas

### ✅ Nova Seção de Produtos

- **Lista completa** de produtos do banco de dados
- **Filtros por preço** com múltiplas faixas
- **Ordenação** por nome, preço e disponibilidade
- **Estados visuais** para estoque (disponível, baixo, esgotado)
- **Design responsivo** para mobile, tablet e desktop
- **Loading states** e tratamento de erros

### 🔍 Recursos da Seção

1. **Grid de Produtos Dinâmica**

   - Carregamento via API REST
   - Cards informativos com especificações
   - Status de estoque em tempo real
   - Botões de interesse interativos

2. **Sistema de Filtros**

   - Por faixa de preço (até R$ 3k, R$ 3k-5k, R$ 5k-8k, +R$ 8k)
   - Ordenação (nome, menor/maior preço, estoque)
   - Filtros mantêm estado durante navegação

3. **Estados de Interface**
   - Loading spinner durante carregamento
   - Mensagem de erro com botão "Tentar Novamente"
   - Estado vazio quando não há produtos
   - Cards destacados para produtos em promoção

## 🚀 Como Testar

### Opção 1: Com API Local (Recomendado)

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Iniciar API de exemplo:**

   ```bash
   npm start
   ```

   A API estará rodando em `http://localhost:3000`

3. **Abrir o site:**
   - Abra `index.html` no navegador
   - A seção "Produtos" carregará automaticamente
   - Teste os filtros e ordenação

### Opção 2: Modo de Demonstração

Se não conseguir rodar a API, o site mostrará:

- Estado de loading inicial
- Depois estado de erro com opção de tentar novamente
- Funcionalidades de interface permanecem ativas

## 📱 Layout Responsivo

### Desktop (1200px+)

- Grid com 3 colunas
- Filtros lado a lado
- Cards completos com todas as informações

### Tablet (768px - 1199px)

- Grid com 2 colunas
- Filtros empilhados
- Cards otimizados

### Mobile (<768px)

- Grid com 1 coluna
- Filtros em stack
- Interface touch-friendly

## 🎨 Componentes Visuais

### Cards de Produto

```html
├── Badge de estoque (canto superior direito) ├── Cabeçalho (nome + modelo) ├──
Especificações técnicas (5 itens principais) ├── Rodapé (preço + botão
interesse) └── Descrição expandida (se disponível)
```

### Estados do Estoque

- 🟢 **Em Estoque**: Verde - mais de 5 unidades
- 🟡 **Baixo Estoque**: Amarelo - 1-5 unidades
- 🔴 **Sem Estoque**: Vermelho - 0 unidades

### Produto Destaque

- Background gradiente especial
- Texto branco
- Destacado como produto principal (TechBook Pro)

## 🔌 Integração com Banco

### Endpoints Utilizados

```javascript
GET /api/produtos          // Lista todos os produtos
GET /api/produtos/:id      // Produto específico
POST /api/contatos         // Registrar interesse
GET /api/estatisticas      // Dados agregados
```

### Estrutura de Dados Esperada

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "TechBook Pro",
      "modelo": "TBP-2025-I7",
      "preco": 4999.0,
      "processador": "Intel Core i7-12700H",
      "memoria_ram": "32GB DDR5",
      "armazenamento": "1TB SSD NVMe",
      "tela_tamanho": "15.6\"",
      "tela_tipo": "4K OLED",
      "peso": 1.8,
      "estoque": 25,
      "status": "ativo"
    }
  ]
}
```

## 🎯 Funcionalidades Interativas

### 1. Filtro por Preço

```javascript
function filtrarProdutos() {
  const filterValue = document.getElementById("filter-price").value;
  // Filtra array de produtos baseado na faixa selecionada
}
```

### 2. Ordenação de Produtos

```javascript
function ordenarProdutos() {
  const sortValue = document.getElementById("sort-products").value;
  // Reordena produtos por critério selecionado
}
```

### 3. Modal de Interesse

- Formulário para demonstrar interesse
- Integração com tabela `contatos` do banco
- Validação de campos obrigatórios
- Feedback visual de sucesso/erro

## 📊 Dados de Exemplo

A API inclui 5 produtos de demonstração:

1. **TechBook Pro** (R$ 4.999) - 25 em estoque
2. **TechBook Air** (R$ 2.999) - 40 em estoque
3. **TechBook Gaming** (R$ 7.999) - 15 em estoque
4. **TechBook Student** (R$ 1.899) - 3 em estoque (baixo)
5. **TechBook Workstation** (R$ 12.999) - 0 em estoque

## 🔧 Personalização

### Modificar Filtros de Preço

Edite as opções no HTML:

```html
<select id="filter-price">
  <option value="0-2000">Até R$ 2.000</option>
  <option value="2000-4000">R$ 2.000 - R$ 4.000</option>
  <!-- Adicione mais faixas conforme necessário -->
</select>
```

### Adicionar Novos Critérios de Ordenação

Modifique a função `ordenarProdutos()`:

```javascript
case 'performance':
    produtosOrdenados.sort((a, b) =>
        getPerformanceScore(b) - getPerformanceScore(a)
    );
    break;
```

### Customizar Layout dos Cards

Edite a função `renderizarProdutos()` para modificar:

- Informações exibidas
- Layout dos elementos
- Estilos aplicados

## 🚨 Tratamento de Erros

### Cenários Cobertos

1. **API offline**: Exibe mensagem de erro com retry
2. **Dados inválidos**: Fallback para valores padrão
3. **Produtos sem imagem**: Placeholder com ícone
4. **Filtros sem resultado**: Mensagem explicativa
5. **Erro de rede**: Notificação de reconexão

## 📈 Performance

### Otimizações Implementadas

- **Debounce** nos filtros para evitar requisições excessivas
- **Cache local** dos dados carregados
- **Loading incremental** para melhor UX
- **Lazy loading** de descrições longas
- **Compressão CSS/JS** em produção

---

**🎉 Agora seu site TechBook possui uma seção completa de produtos integrada com banco de dados!**

A seção está totalmente funcional e pronta para demonstrar como os dados do banco são exibidos dinamicamente no frontend.
