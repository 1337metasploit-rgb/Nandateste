let carrinho = [];
let currentUser = null;

async function checkSession() {
  try {
    const response = await fetch('/api/session');
    const data = await response.json();
    
    if (data.user) {
      currentUser = data.user;
      updateUserMenu();
    }
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
  }
}

function updateUserMenu() {
  const userMenu = document.getElementById('userMenu');
  
  if (currentUser) {
    const isAdmin = currentUser.role === 'admin';
    const adminBadge = isAdmin ? ' <span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 3px 10px; border-radius: 12px; font-size: 0.8em; margin-left: 5px;">👑 ADMIN</span>' : '';
    
    userMenu.innerHTML = `
      <span style="color: var(--primary-color); font-weight: bold;">
        Olá, ${currentUser.nome}!${adminBadge}
      </span>
      ${isAdmin ? '<a href="/admin" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-weight: bold;">⚙️ Painel Admin</a>' : ''}
      <a href="#" id="btnLogout">Sair</a>
    `;
    
    document.getElementById('btnLogout').addEventListener('click', logout);
    
    // Log para debug
    console.log(isAdmin ? '👑 Usuário é ADMIN' : '👤 Usuário normal');
  }
}

async function logout(e) {
  if (e) e.preventDefault();
  
  try {
    await fetch('/api/logout');
    currentUser = null;
    window.location.href = '/';
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}

async function carregarProdutos() {
  try {
    console.log('🍦 Carregando produtos...');
    const response = await fetch('/api/produtos');
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const produtos = await response.json();
    console.log(`✅ ${produtos.length} produtos recebidos`);
    
    const grid = document.getElementById('produtosGrid');
    
    if (!grid) {
      console.error('❌ Grid não encontrado!');
      return;
    }
    
    grid.innerHTML = '';
    
    if (produtos.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: white; border-radius: 15px;">
          <h3 style="color: #666; margin-bottom: 1rem;">😔 Ops! Nenhum produto encontrado</h3>
          <p style="color: #999; margin-bottom: 1.5rem;">Parece que o banco de dados está vazio.</p>
          <button onclick="location.reload()" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            🔄 Recarregar Página
          </button>
        </div>
      `;
      return;
    }
    
    produtos.forEach((produto, index) => {
      console.log(`Produto ${index + 1}:`, produto.nome);
      
      const card = document.createElement('div');
      card.className = 'produto-card';
      
      // URL da imagem com fallback
      const imagemUrl = produto.imagem || 'https://via.placeholder.com/400x300/667eea/ffffff?text=Sem+Imagem';
      
      // Verificar se tem as relações populadas (sabor, tipo, etc)
      const temRelacoes = produto.sabor && produto.tipo && produto.tamanho && produto.categoria;
      
      if (temRelacoes) {
        // VERSÃO COMPLETA - Com todos os badges (projeto MVC)
        card.innerHTML = `
          <img src="${imagemUrl}" 
               alt="${produto.nome}" 
               class="produto-imagem"
               onerror="this.src='https://via.placeholder.com/400x300/ff6b9d/ffffff?text=Imagem+Indisponível'">
          <div class="produto-info">
            <h3 class="produto-nome">${produto.nome}</h3>
            
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.8rem;">
              <span class="produto-badge" style="background: linear-gradient(135deg, #ff6b9d, #ee5a6f); color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                🍦 ${produto.sabor.nome}
              </span>
              <span class="produto-badge" style="background: linear-gradient(135deg, #c44569, #a52d4f); color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                ✨ ${produto.tipo.nome}
              </span>
            </div>
            
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.8rem;">
              <span class="produto-badge" style="background: linear-gradient(135deg, #feca57, #ee9617); color: #2d3436; padding: 5px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                📏 ${produto.tamanho.nome} (${produto.tamanho.ml}ml)
              </span>
              <span class="produto-badge" style="background: ${produto.categoria.cor}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                🏷️ ${produto.categoria.nome}
              </span>
            </div>
            
            <p class="produto-preco">R$ ${Number(produto.preco).toFixed(2)}</p>
            <button class="btn-adicionar" onclick="adicionarAoCarrinho('${produto._id}', '${produto.nome}', ${produto.preco})">
              Adicionar ao Carrinho
            </button>
          </div>
        `;
      } else {
        // VERSÃO SIMPLES - Só nome e categoria (projeto simples)
        const categoriaSimples = produto.categoria?.nome || produto.categoria || 'Sem categoria';
        
        card.innerHTML = `
          <img src="${imagemUrl}" 
               alt="${produto.nome}" 
               class="produto-imagem"
               onerror="this.src='https://via.placeholder.com/400x300/ff6b9d/ffffff?text=Imagem+Indisponível'">
          <div class="produto-info">
            <h3 class="produto-nome">${produto.nome}</h3>
            <span class="produto-categoria">${categoriaSimples}</span>
            <p class="produto-preco">R$ ${Number(produto.preco).toFixed(2)}</p>
            <button class="btn-adicionar" onclick="adicionarAoCarrinho('${produto._id}', '${produto.nome}', ${produto.preco})">
              Adicionar ao Carrinho
            </button>
          </div>
        `;
      }
      
      grid.appendChild(card);
    });
    
    console.log(`✅ ${produtos.length} produtos exibidos com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro ao carregar produtos:', error);
    const grid = document.getElementById('produtosGrid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: white; border-radius: 15px; border: 2px solid #ffebee;">
          <h3 style="color: #dc3545; margin-bottom: 1rem;">❌ Erro ao carregar produtos</h3>
          <p style="color: #666; margin-bottom: 0.5rem;"><strong>Erro:</strong> ${error.message}</p>
          <p style="color: #999; margin-bottom: 1.5rem; font-size: 0.9em;">Verifique se o servidor está rodando e o MongoDB está conectado</p>
          <button onclick="carregarProdutos()" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            🔄 Tentar Novamente
          </button>
        </div>
      `;
    }
  }
}

function adicionarAoCarrinho(id, nome, preco) {
  const itemExistente = carrinho.find(item => item.id === id);
  
  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ id, nome, preco, quantidade: 1 });
  }
  
  atualizarCarrinho();
  
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = '✓ Adicionado!';
  btn.style.background = 'var(--success)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
  }, 1000);
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(item => item.id !== id);
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const carrinhoItens = document.getElementById('carrinhoItens');
  const carrinhoTotal = document.getElementById('carrinhoTotal');
  const carrinhoCount = document.getElementById('carrinhoCount');
  
  carrinhoItens.innerHTML = '';
  let total = 0;
  
  carrinho.forEach(item => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    
    const div = document.createElement('div');
    div.className = 'carrinho-item';
    div.innerHTML = `
      <div class="carrinho-item-info">
        <h4>${item.nome}</h4>
        <p>Quantidade: ${item.quantidade}</p>
        <p class="carrinho-item-preco">R$ ${subtotal.toFixed(2)}</p>
      </div>
      <button class="btn-remover" onclick="removerDoCarrinho('${item.id}')">
        Remover
      </button>
    `;
    carrinhoItens.appendChild(div);
  });
  
  if (carrinho.length === 0) {
    carrinhoItens.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Carrinho vazio</p>';
  }
  
  carrinhoTotal.textContent = `R$ ${total.toFixed(2)}`;
  carrinhoCount.textContent = carrinho.length;
}

document.getElementById('btnCarrinho').addEventListener('click', () => {
  document.getElementById('carrinho').classList.add('open');
});

document.getElementById('fecharCarrinho').addEventListener('click', () => {
  document.getElementById('carrinho').classList.remove('open');
});

document.getElementById('finalizarPedido').addEventListener('click', async () => {
  if (carrinho.length === 0) {
    alert('Carrinho vazio!');
    return;
  }
  
  if (!currentUser) {
    alert('Você precisa estar logado para fazer um pedido!');
    window.location.href = '/login';
    return;
  }
  
  const total = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  
  try {
    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itens: carrinho,
        total
      })
    });
    
    if (response.ok) {
      alert('Pedido realizado com sucesso!');
      carrinho = [];
      atualizarCarrinho();
      document.getElementById('carrinho').classList.remove('open');
    } else {
      alert('Erro ao realizar pedido!');
    }
  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    alert('Erro ao realizar pedido!');
  }
});

console.log('🚀 Sistema iniciado!');
checkSession();
carregarProdutos();
atualizarCarrinho();
