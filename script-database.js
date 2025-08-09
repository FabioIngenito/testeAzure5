// ===================================================================
// SCRIPT MODIFICADO PARA INTEGRAÇÃO COM BANCO DE DADOS
// Este arquivo substitui as funcionalidades estáticas do script.js
// original por versões que interagem com o banco de dados
// ===================================================================

// Configuração da API
const API_BASE_URL = "http://localhost:3000/api"; // Altere conforme sua API

// Mobile menu toggle (mantido igual)
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when clicking on a link (mantido igual)
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

// Smooth scrolling for anchor links (mantido igual)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});

// Header background change on scroll (mantido igual)
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (window.scrollY > 100) {
    header.style.background = "rgba(255, 255, 255, 0.98)";
    header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  } else {
    header.style.background = "rgba(255, 255, 255, 0.95)";
    header.style.boxShadow = "none";
  }
});

// ===================================================================
// NOVAS FUNCIONALIDADES COM INTEGRAÇÃO AO BANCO DE DADOS
// ===================================================================

// Função para carregar produtos do banco de dados
async function carregarProdutos() {
  try {
    showNotification("Carregando produtos...", "info");

    const response = await fetch(`${API_BASE_URL}/produtos`);
    const result = await response.json();

    if (result.success) {
      atualizarInterfaceProdutos(result.data);
      carregarSecaoProdutos(result.data);
      showNotification("Produtos carregados com sucesso!", "success");
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    showNotification("Erro ao carregar produtos da loja", "error");
    mostrarErroProdutos();
  }
}

// Variável global para armazenar produtos
let produtosCarregados = [];

// Função específica para carregar a seção de produtos
async function carregarSecaoProdutos(produtos = null) {
  const loadingElement = document.getElementById("produtos-loading");
  const gridElement = document.getElementById("produtos-grid");
  const errorElement = document.getElementById("produtos-error");

  if (!produtos) {
    try {
      loadingElement.style.display = "block";
      gridElement.style.display = "none";
      errorElement.style.display = "none";

      const response = await fetch(`${API_BASE_URL}/produtos`);
      const result = await response.json();

      if (result.success) {
        produtos = result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      mostrarErroProdutos();
      return;
    }
  }

  produtosCarregados = produtos;
  renderizarProdutos(produtos);

  loadingElement.style.display = "none";
  gridElement.style.display = "grid";
  errorElement.style.display = "none";
}

// Função para renderizar produtos na grid
function renderizarProdutos(produtos) {
  const gridElement = document.getElementById("produtos-grid");

  if (!produtos || produtos.length === 0) {
    gridElement.innerHTML = `
      <div class="produtos-empty">
        <i class="fas fa-box-open"></i>
        <h3>Nenhum produto disponível</h3>
        <p>Não há produtos cadastrados no momento.</p>
      </div>
    `;
    return;
  }

  gridElement.innerHTML = produtos
    .map((produto) => {
      const statusEstoque = getStatusEstoque(produto.estoque);
      const isDestaque = produto.modelo === "TBP-2025-I7";

      return `
      <div class="produto-card ${
        isDestaque ? "destaque" : ""
      }" data-produto-id="${produto.id}">
        <div class="produto-estoque ${statusEstoque.classe}">
          ${statusEstoque.texto}
        </div>
        
        <div class="produto-header">
          <h3>${produto.nome}</h3>
          <p class="produto-modelo">${produto.modelo}</p>
        </div>
        
        <div class="produto-specs">
          <div class="spec-item">
            <i class="fas fa-microchip"></i>
            <span>${produto.processador || "N/A"}</span>
          </div>
          <div class="spec-item">
            <i class="fas fa-memory"></i>
            <span>${produto.memoria_ram || "N/A"}</span>
          </div>
          <div class="spec-item">
            <i class="fas fa-hdd"></i>
            <span>${produto.armazenamento || "N/A"}</span>
          </div>
          <div class="spec-item">
            <i class="fas fa-display"></i>
            <span>${produto.tela_tamanho || "N/A"} ${
        produto.tela_tipo || ""
      }</span>
          </div>
          <div class="spec-item">
            <i class="fas fa-weight"></i>
            <span>${produto.peso ? produto.peso + "kg" : "N/A"}</span>
          </div>
        </div>
        
        <div class="produto-footer">
          <div class="produto-preco">
            R$ ${produto.preco ? produto.preco.toLocaleString("pt-BR") : "0,00"}
          </div>
          <button class="btn btn-primary btn-interesse" 
                  data-produto-id="${produto.id}"
                  ${produto.estoque === 0 ? "disabled" : ""}>
            ${produto.estoque === 0 ? "Indisponível" : "Tenho Interesse"}
          </button>
        </div>
        
        ${
          produto.descricao
            ? `
          <div class="produto-descricao" style="margin-top: 1rem; font-size: 0.9rem; color: ${
            isDestaque ? "rgba(255,255,255,0.9)" : "#64748b"
          };">
            ${produto.descricao.substring(0, 120)}${
                produto.descricao.length > 120 ? "..." : ""
              }
          </div>
        `
            : ""
        }
      </div>
    `;
    })
    .join("");

  // Adicionar event listeners para botões de interesse
  gridElement.querySelectorAll(".btn-interesse").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const produtoId = e.target.dataset.produtoId;
      if (produtoId) {
        abrirModalInteresse(produtoId);
      }
    });
  });
}

// Função para determinar status do estoque
function getStatusEstoque(estoque) {
  if (estoque === 0) {
    return { classe: "sem-estoque", texto: "Sem estoque" };
  } else if (estoque <= 5) {
    return { classe: "baixo-estoque", texto: `${estoque} restantes` };
  } else {
    return { classe: "em-estoque", texto: `${estoque} disponíveis` };
  }
}

// Função para mostrar erro na seção de produtos
function mostrarErroProdutos() {
  const loadingElement = document.getElementById("produtos-loading");
  const gridElement = document.getElementById("produtos-grid");
  const errorElement = document.getElementById("produtos-error");

  loadingElement.style.display = "none";
  gridElement.style.display = "none";
  errorElement.style.display = "block";
}

// Função para recarregar produtos (chamada pelo botão de erro)
function recarregarProdutos() {
  carregarSecaoProdutos();
}

// Função para filtrar produtos por preço
function filtrarProdutos() {
  const filterValue = document.getElementById("filter-price").value;
  let produtosFiltrados = [...produtosCarregados];

  if (filterValue !== "all") {
    const [min, max] = filterValue.includes("+")
      ? [parseInt(filterValue.replace("+", "")), Infinity]
      : filterValue.split("-").map((v) => parseInt(v));

    produtosFiltrados = produtosFiltrados.filter((produto) => {
      const preco = produto.preco || 0;
      return preco >= min && preco <= max;
    });
  }

  renderizarProdutos(produtosFiltrados);
}

// Função para ordenar produtos
function ordenarProdutos() {
  const sortValue = document.getElementById("sort-products").value;
  let produtosOrdenados = [...produtosCarregados];

  switch (sortValue) {
    case "name":
      produtosOrdenados.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
    case "price-asc":
      produtosOrdenados.sort((a, b) => (a.preco || 0) - (b.preco || 0));
      break;
    case "price-desc":
      produtosOrdenados.sort((a, b) => (b.preco || 0) - (a.preco || 0));
      break;
    case "stock":
      produtosOrdenados.sort((a, b) => b.estoque - a.estoque);
      break;
  }

  renderizarProdutos(produtosOrdenados);
}

// Função para atualizar a interface com dados do banco
function atualizarInterfaceProdutos(produtos) {
  const produtoPrincipal = produtos.find((p) => p.modelo === "TBP-2025-I7");

  if (produtoPrincipal) {
    // Atualizar preço na hero section
    const priceValue = document.querySelector(".price-value");
    if (priceValue) {
      priceValue.textContent = `R$ ${produtoPrincipal.preco.toLocaleString(
        "pt-BR"
      )}`;
    }

    // Atualizar estoque
    const stockInfo = document.createElement("div");
    stockInfo.className = "stock-info";
    stockInfo.innerHTML = `
            <i class="fas fa-box"></i>
            <span>${
              produtoPrincipal.estoque > 0
                ? `${produtoPrincipal.estoque} unidades disponíveis`
                : "Produto em falta"
            }</span>
        `;

    const priceSection = document.querySelector(".price");
    if (priceSection && !document.querySelector(".stock-info")) {
      priceSection.appendChild(stockInfo);
    }
  }

  // Criar seção de produtos relacionados (opcional)
  criarSecaoProdutosRelacionados(
    produtos.filter((p) => p.modelo !== "TBP-2025-I7")
  );
}

// Criar seção de produtos relacionados
function criarSecaoProdutosRelacionados(produtos) {
  if (produtos.length === 0) return;

  const specs = document.querySelector("#specs");
  if (!specs || document.querySelector("#produtos-relacionados")) return;

  const secaoProdutos = document.createElement("section");
  secaoProdutos.id = "produtos-relacionados";
  secaoProdutos.className = "produtos-relacionados";
  secaoProdutos.innerHTML = `
        <div class="container">
            <h2>Outros Produtos TechBook</h2>
            <div class="produtos-grid">
                ${produtos
                  .map(
                    (produto) => `
                    <div class="produto-card" data-produto-id="${produto.id}">
                        <div class="produto-header">
                            <h3>${produto.nome}</h3>
                            <p class="produto-modelo">${produto.modelo}</p>
                        </div>
                        <div class="produto-specs">
                            <div class="spec-item">
                                <i class="fas fa-microchip"></i>
                                <span>${produto.processador}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-memory"></i>
                                <span>${produto.memoria_ram}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-display"></i>
                                <span>${produto.tela_tamanho} ${
                      produto.tela_tipo
                    }</span>
                            </div>
                        </div>
                        <div class="produto-footer">
                            <div class="produto-preco">
                                <span>R$ ${produto.preco.toLocaleString(
                                  "pt-BR"
                                )}</span>
                            </div>
                            <button class="btn btn-primary btn-interesse" data-produto-id="${
                              produto.id
                            }">
                                Tenho Interesse
                            </button>
                        </div>
                        <div class="produto-estoque ${
                          produto.estoque > 0 ? "em-estoque" : "sem-estoque"
                        }">
                            ${
                              produto.estoque > 0
                                ? `${produto.estoque} em estoque`
                                : "Sem estoque"
                            }
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  specs.insertAdjacentElement("afterend", secaoProdutos);

  // Adicionar event listeners para botões de interesse
  secaoProdutos.querySelectorAll(".btn-interesse").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const produtoId = e.target.dataset.produtoId;
      abrirModalInteresse(produtoId);
    });
  });
}

// Modal de interesse em produto
function abrirModalInteresse(produtoId) {
  const modal = document.createElement("div");
  modal.className = "modal-interesse";
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Demonstrar Interesse</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Preencha seus dados para demonstrar interesse neste produto:</p>
                <form class="form-interesse">
                    <input type="hidden" name="produto_id" value="${produtoId}">
                    <div class="form-group">
                        <input type="text" name="nome" placeholder="Seu nome" required>
                    </div>
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Seu e-mail" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" name="telefone" placeholder="Seu telefone">
                    </div>
                    <div class="form-group">
                        <textarea name="mensagem" placeholder="Sua mensagem (opcional)" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Enviar Interesse</button>
                </form>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Event listeners do modal
  modal.querySelector(".modal-close").addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  modal.querySelector(".form-interesse").addEventListener("submit", (e) => {
    e.preventDefault();
    enviarInteresse(e.target, modal);
  });
}

// Enviar interesse em produto específico
async function enviarInteresse(form, modal) {
  const formData = new FormData(form);
  const dados = {
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone") || null,
    mensagem: formData.get("mensagem") || "Interesse em produto específico.",
    produto_id: parseInt(formData.get("produto_id")),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/contatos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (result.success) {
      showNotification(
        "Interesse registrado com sucesso! Entraremos em contato.",
        "success"
      );
      modal.remove();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Erro ao registrar interesse:", error);
    showNotification("Erro ao registrar interesse. Tente novamente.", "error");
  }
}

// Form submission MODIFICADO para integração com banco
const contactForm = document.querySelector(".contact-form");
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Mostrar loading
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Enviando...";
  submitBtn.disabled = true;

  // Coletar dados do formulário
  const formData = new FormData(contactForm);
  const dados = {
    nome:
      formData.get("nome") ||
      contactForm.querySelector('input[type="text"]').value,
    email:
      formData.get("email") ||
      contactForm.querySelector('input[type="email"]').value,
    telefone:
      formData.get("telefone") ||
      contactForm.querySelector('input[type="tel"]').value,
    mensagem:
      formData.get("mensagem") || contactForm.querySelector("textarea").value,
    produto_id: 1, // TechBook Pro principal
  };

  try {
    const response = await fetch(`${API_BASE_URL}/contatos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    if (result.success) {
      showNotification(
        "Mensagem enviada com sucesso! Entraremos em contato em breve.",
        "success"
      );
      contactForm.reset();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    showNotification(
      "Erro ao enviar mensagem. Verifique sua conexão e tente novamente.",
      "error"
    );
  } finally {
    // Restaurar botão
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Função para verificar disponibilidade de produto
async function verificarDisponibilidade(produtoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/produtos/${produtoId}`);
    const result = await response.json();

    if (result.success) {
      return result.data.estoque > 0;
    }
    return false;
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return false;
  }
}

// Button interactions MODIFICADAS
document.querySelectorAll(".btn-primary").forEach((button) => {
  button.addEventListener("click", async (e) => {
    if (button.textContent.includes("Comprar")) {
      e.preventDefault();

      // Verificar disponibilidade antes de redirecionar
      const disponivel = await verificarDisponibilidade(1); // TechBook Pro

      if (disponivel) {
        showNotification(
          "Redirecionando para finalização da compra...",
          "info"
        );
        // Aqui você redirecionaria para o sistema de pagamento
        setTimeout(() => {
          showNotification(
            "Sistema de pagamento em desenvolvimento",
            "warning"
          );
        }, 1500);
      } else {
        showNotification("Produto temporariamente indisponível", "warning");
      }
    }
  });
});

// Carregar estatísticas em tempo real
async function carregarEstatisticas() {
  try {
    const response = await fetch(`${API_BASE_URL}/estatisticas`);
    const result = await response.json();

    if (result.success) {
      atualizarEstatisticas(result.data);
    }
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  }
}

function atualizarEstatisticas(stats) {
  // Adicionar contador de interessados
  const heroText = document.querySelector(".hero-text");
  if (heroText && !document.querySelector(".stats-counter")) {
    const statsDiv = document.createElement("div");
    statsDiv.className = "stats-counter";
    statsDiv.innerHTML = `
            <div class="stat-item">
                <i class="fas fa-users"></i>
                <span>${
                  stats.total_interessados || 0
                } pessoas interessadas</span>
            </div>
        `;
    heroText.appendChild(statsDiv);
  }
}

// Intersection Observer for animations (mantido igual)
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Initialize on page load MODIFICADO
document.addEventListener("DOMContentLoaded", () => {
  const featureCards = document.querySelectorAll(".feature-card");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const specGroups = document.querySelectorAll(".spec-group");

  // Set initial states
  [...featureCards, ...galleryItems, ...specGroups].forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(30px)";
    item.style.transition = "all 0.6s ease";
    observer.observe(item);
  });

  // Carregar dados do banco
  carregarProdutos();
  carregarEstatisticas();
});

// Notification system (mantido igual, mas com melhorias)
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 400px;
        animation: slideIn 0.3s ease;
        font-family: 'Inter', sans-serif;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 5000);

  notification
    .querySelector(".notification-close")
    .addEventListener("click", () => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
}

function getNotificationIcon(type) {
  switch (type) {
    case "success":
      return "fa-check-circle";
    case "error":
      return "fa-exclamation-circle";
    case "warning":
      return "fa-exclamation-triangle";
    default:
      return "fa-info-circle";
  }
}

function getNotificationColor(type) {
  switch (type) {
    case "success":
      return "#10b981";
    case "error":
      return "#ef4444";
    case "warning":
      return "#f59e0b";
    default:
      return "#3b82f6";
  }
}

// CSS adicional para novas funcionalidades
const additionalStyles = document.createElement("style");
additionalStyles.textContent = `
    .produtos-relacionados {
        padding: 100px 0;
        background: #f1f5f9;
    }
    
    .produtos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        margin-top: 3rem;
    }
    
    .produto-card {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s ease;
        position: relative;
    }
    
    .produto-card:hover {
        transform: translateY(-5px);
    }
    
    .produto-estoque {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .produto-estoque.em-estoque {
        background: #dcfce7;
        color: #166534;
    }
    
    .produto-estoque.sem-estoque {
        background: #fee2e2;
        color: #dc2626;
    }
    
    .modal-interesse {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        border-radius: 20px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #64748b;
    }
    
    .stats-counter {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
    }
    
    .stock-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        font-size: 0.9rem;
    }
`;

document.head.appendChild(additionalStyles);

// Expor funções no escopo global para uso no HTML
window.recarregarProdutos = recarregarProdutos;
window.filtrarProdutos = filtrarProdutos;
window.ordenarProdutos = ordenarProdutos;

console.log(
  "TechBook Pro - Site integrado com banco de dados carregado com sucesso!"
);
