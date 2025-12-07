// Admin Completo - Gerenciamento de Produtos e Entidades
let currentUser = null;

// ========== SISTEMA DE AUTENTICAÇÃO ==========
async function checkAuth() {
  try {
    const response = await fetch('/api/session');
    const data = await response.json();
    
    if (data.user) {
      currentUser = data.user;
      document.getElementById('adminUserName').textContent = `👋 Olá, ${currentUser.nome}!`;
      
      // Carregar todos os dados
      await carregarTodosDados();
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
  }
}

document.getElementById('btnLogout').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/logout');
  window.location.href = '/';
});

// ========== SISTEMA DE TABS ==========
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ========== CARREGAR TODOS OS DADOS ==========
async function carregarTodosDados() {
  await Promise.all([
    carregarSabores(),
    carregarTipos(),
    carregarTamanhos(),
    carregarCategorias(),
    carregarProdutos()
  ]);
  
  popularSelects();
}

// ========== POPULAR SELECTS ==========
async function popularSelects() {
  try {
    const sabores = await fetch('/api/sabores').then(r => r.json());
    const selectSabor = document.getElementById('produtoSabor');
    selectSabor.innerHTML = '<option value="">Selecione um sabor</option>';
    sabores.forEach(s => {
      selectSabor.innerHTML += `<option value="${s._id}">${s.nome}</option>`;
    });
    
    const tipos = await fetch('/api/tipos').then(r => r.json());
    const selectTipo = document.getElementById('produtoTipo');
    selectTipo.innerHTML = '<option value="">Selecione um tipo</option>';
    tipos.forEach(t => {
      selectTipo.innerHTML += `<option value="${t._id}">${t.nome}</option>`;
    });
    
    const tamanhos = await fetch('/api/tamanhos').then(r => r.json());
    const selectTamanho = document.getElementById('produtoTamanho');
    selectTamanho.innerHTML = '<option value="">Selecione um tamanho</option>';
    tamanhos.forEach(t => {
      selectTamanho.innerHTML += `<option value="${t._id}">${t.nome} (${t.ml}ml)</option>`;
    });
    
    const categorias = await fetch('/api/categorias').then(r => r.json());
    const selectCategoria = document.getElementById('produtoCategoria');
    selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';
    categorias.forEach(c => {
      selectCategoria.innerHTML += `<option value="${c._id}">${c.nome}</option>`;
    });
  } catch (error) {
    console.error('Erro ao popular selects:', error);
  }
}

// ========== PREVIEW DE IMAGEM ==========
document.getElementById('produtoImagem')?.addEventListener('input', function() {
  const url = this.value;
  const preview = document.getElementById('imagemPreview');
  const img = document.getElementById('imagemPreviewImg');
  
  if (url) {
    img.src = url;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
});

// ========== UPLOAD DE IMAGEM ==========
async function uploadImagem() {
  const fileInput = document.getElementById('produtoImagemFile');
  const file = fileInput.files[0];
  
  if (!file) {
    showAlert('Por favor, selecione uma imagem primeiro!', 'error');
    return;
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showAlert('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)', 'error');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    showAlert('A imagem deve ter no máximo 5MB', 'error');
    return;
  }
  
  const btnUpload = document.getElementById('btnUpload');
  const originalText = btnUpload.textContent;
  btnUpload.textContent = '⏳ Enviando...';
  btnUpload.disabled = true;
  
  try {
    const formData = new FormData();
    formData.append('imagem', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      
      document.getElementById('produtoImagem').value = data.url;
      document.getElementById('imagemPreviewImg').src = data.url;
      document.getElementById('imagemPreview').style.display = 'block';
      
      showAlert('Imagem enviada com sucesso! ✅', 'success');
      fileInput.value = '';
    } else {
      const error = await response.json();
      showAlert(`Erro ao enviar imagem: ${error.error}`, 'error');
    }
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    showAlert('Erro ao enviar imagem. Tente novamente.', 'error');
  } finally {
    btnUpload.textContent = originalText;
    btnUpload.disabled = false;
  }
}

// ========== PREVIEW DE COR ==========
document.getElementById('categoriaCor')?.addEventListener('input', function() {
  document.getElementById('categoriaCorPreview').style.background = this.value;
});

// ========== CRUD SABORES ==========
async function carregarSabores() {
  try {
    const response = await fetch('/api/sabores');
    const sabores = await response.json();
    
    const lista = document.getElementById('saboresLista');
    lista.innerHTML = '';
    
    if (sabores.length === 0) {
      lista.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum sabor cadastrado ainda. Adicione o primeiro!</p>';
      return;
    }
    
    sabores.forEach(sabor => {
      lista.innerHTML += `
        <div class="entity-card">
          <h4>🎨 ${sabor.nome}</h4>
          <div class="entity-actions">
            <button class="btn-edit" onclick="editarSabor('${sabor._id}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deletarSabor('${sabor._id}')">🗑️ Excluir</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error('Erro ao carregar sabores:', error);
  }
}

document.getElementById('formSabor')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('saborId').value;
  const nome = document.getElementById('saborNome').value;
  
  try {
    const url = id ? `/api/sabores/${id}` : '/api/sabores';
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    });
    
    if (response.ok) {
      showAlert(`Sabor ${id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
      cancelarEdicaoSabor();
      await carregarSabores();
      await popularSelects();
    }
  } catch (error) {
    console.error('Erro ao salvar sabor:', error);
  }
});

async function editarSabor(id) {
  try {
    const response = await fetch(`/api/sabores/${id}`);
    const sabor = await response.json();
    
    document.getElementById('saborId').value = sabor._id;
    document.getElementById('saborNome').value = sabor.nome;
    document.querySelector('#formSabor h3').textContent = '✏️ Editar Sabor';
  } catch (error) {
    console.error('Erro ao carregar sabor:', error);
  }
}

async function deletarSabor(id) {
  if (!confirm('Tem certeza que deseja excluir este sabor?')) return;
  
  try {
    const response = await fetch(`/api/sabores/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAlert('Sabor excluído com sucesso!', 'success');
      await carregarSabores();
      await popularSelects();
    }
  } catch (error) {
    console.error('Erro ao deletar sabor:', error);
  }
}

function cancelarEdicaoSabor() {
  document.getElementById('saborId').value = '';
  document.getElementById('saborNome').value = '';
  document.querySelector('#formSabor h3').textContent = '🎨 Adicionar Novo Sabor';
}

// ========== CRUD TIPOS ==========
async function carregarTipos() {
  try {
    const response = await fetch('/api/tipos');
    const tipos = await response.json();
    
    const lista = document.getElementById('tiposLista');
    lista.innerHTML = '';
    
    if (tipos.length === 0) {
      lista.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum tipo cadastrado ainda.</p>';
      return;
    }
    
    tipos.forEach(tipo => {
      lista.innerHTML += `
        <div class="entity-card">
          <h4>✨ ${tipo.nome}</h4>
          <div class="entity-actions">
            <button class="btn-edit" onclick="editarTipo('${tipo._id}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deletarTipo('${tipo._id}')">🗑️ Excluir</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error('Erro ao carregar tipos:', error);
  }
}

document.getElementById('formTipo')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('tipoId').value;
  const nome = document.getElementById('tipoNome').value;
  
  try {
    const url = id ? `/api/tipos/${id}` : '/api/tipos';
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    });
    
    if (response.ok) {
      showAlert(`Tipo ${id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
      cancelarEdicaoTipo();
      await carregarTipos();
      await popularSelects();
    }
  } catch (error) {
    console.error('Erro ao salvar tipo:', error);
  }
});

async function editarTipo(id) {
  try {
    const response = await fetch(`/api/tipos/${id}`);
    const tipo = await response.json();
    
    document.getElementById('tipoId').value = tipo._id;
    document.getElementById('tipoNome').value = tipo.nome;
    document.querySelector('#formTipo h3').textContent = '✏️ Editar Tipo';
  } catch (error) {
    console.error('Erro ao carregar tipo:', error);
  }
}

async function deletarTipo(id) {
  if (!confirm('Tem certeza que deseja excluir este tipo?')) return;
  
  try {
    const response = await fetch(`/api/tipos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAlert('Tipo excluído com sucesso!', 'success');
      await carregarTipos();
      await popularSelects();
    }
  } catch (error) {
    console.error('Erro ao deletar tipo:', error);
  }
}

function cancelarEdicaoTipo() {
  document.getElementById('tipoId').value = '';
  document.getElementById('tipoNome').value = '';
  document.querySelector('#formTipo h3').textContent = '✨ Adicionar Novo Tipo';
}

// ========== CRUD TAMANHOS ==========
async function carregarTamanhos() {
  try {
    const response = await fetch('/api/tamanhos');
    const tamanhos = await response.json();
    
    const lista = document.getElementById('tamanhosLista');
    lista.innerHTML = '';
    
    if (tamanhos.length === 0) {
      lista.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum tamanho cadastrado ainda.</p>';
      return;
    }
    
    tamanhos.forEach(tamanho => {
      lista.innerHTML += `
        <div class="entity-card">
          <h4>📏 ${tamanho.nome}</h4>
          <p style="color: #666; margin: 0.5rem 0;">Volume: ${tamanho.ml}ml</p>
          <div class="entity-actions">
            <button class="btn-edit" onclick="editarTamanho('${tamanho._id}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deletarTamanho('${tamanho._id}')">🗑️ Excluir</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error('Erro ao carregar tamanhos:', error);
  }
}

document.getElementById('formTamanho')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('tamanhoId').value;
  const nome = document.getElementById('tamanhoNome').value;
  const ml = document.getElementById('tamanhoMl').value;
  
  try {
    const url = id ? `/api/tamanhos/${id}` : '/api/tamanhos';
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, ml: Number(ml) })
    });
    
    if (response.ok) {
      showAlert(`Tamanho ${id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
      cancelarEdicaoTamanho();
      await carregarTamanhos();
      await popularSelects();
    }
  } catch (error) {
    console.error('Erro ao salvar tamanho:', error);
  }
});

async function editarTamanho(id) {
  try {
    const response = await fetch(`/api/tamanhos/${id}`);
    const tamanho = await response.json();
    
    document.getElementById('tamanhoId').value = tamanho._id;
    document.getElementById('tamanhoNome').value = tamanho.nome;
    document.getElementById('tamanhoMl').value = tamanho.ml;
    document.querySelector('#formTamanho h3').textContent = '✏️ Editar Tamanho';
  } catch (error) {
    console.error('Erro ao carregar tamanho:', error);
  }
}

async function deletarTamanho(id) {
  if (!confirm('Tem certeza que deseja excluir este tamanho?')) return;
  
  try {
    const response = await fetch(`/api/tamanhos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAlert('Tamanho excluído com sucesso!', 'success');
      await carregarTamanhos();
      await popularSelects();
    }
  } catch (error) {
    console.error('Erro ao deletar tamanho:', error);
  }
}

function cancelarEdicaoTamanho() {
  document.getElementById('tamanhoId').value = '';
  document.getElementById('tamanhoNome').value = '';
  document.getElementById('tamanhoMl').value = '';
  document.querySelector('#formTamanho h3').textContent = '📏 Adicionar Novo Tamanho';
}

// ========== CRUD CATEGORIAS ==========
async function carregarCategorias() {
  try {
    const response = await fetch('/api/categorias');
    const categorias = await response.json();
    
    const lista = document.getElementById('categoriasLista');
    lista.innerHTML = '';
    
    if (categorias.length === 0) {
      lista.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhuma categoria cadastrada ainda.</p>';
      return;
    }
    
    categorias.forEach(categoria => {
      lista.innerHTML += `
        <div class="entity-card">
          <h4>🏷️ ${categoria.nome}</h4>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0;">
            <span>Cor:</span>
            <div style="width: 30px; height: 30px; border-radius: 6px; background: ${categoria.cor}; border: 2px solid #e0e0e0;"></div>
            <code style="font-size: 0.85em; color: #666;">${categoria.cor}</code>
          </div>
          <div class="entity-actions">
            <button class="btn-edit" onclick="editarCategoria('${categoria._id}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deletarCategoria('${categoria._id}')">🗑️ Excluir</button>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

document.getElementById('formCategoria')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('categoriaId').value;
  const nome = document.getElementById('categoriaNome').value;
  const cor = document.getElementById('categoriaCor').value;
  
  try {
    const url = id ? `/api/categorias/${id}` : '/api/categorias';
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cor })
    });
    
    if (response.ok) {
      showAlert(`Categoria ${id ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
      cancelarEdicaoCategoria();
      await carregarCategorias();
      await popularSelects();
    }
  } catch (error) {
    console.error('Erro ao salvar categoria:', error);
  }
});

async function editarCategoria(id) {
  try {
    const response = await fetch(`/api/categorias/${id}`);
    const categoria = await response.json();
    
    document.getElementById('categoriaId').value = categoria._id;
    document.getElementById('categoriaNome').value = categoria.nome;
    document.getElementById('categoriaCor').value = categoria.cor;
    document.getElementById('categoriaCorPreview').style.background = categoria.cor;
    document.querySelector('#formCategoria h3').textContent = '✏️ Editar Categoria';
  } catch (error) {
    console.error('Erro ao carregar categoria:', error);
  }
}

async function deletarCategoria(id) {
  if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
  
  try {
    const response = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAlert('Categoria excluída com sucesso!', 'success');
      await carregarCategorias();
      await popularSelects();
    }
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
  }
}

function cancelarEdicaoCategoria() {
  document.getElementById('categoriaId').value = '';
  document.getElementById('categoriaNome').value = '';
  document.getElementById('categoriaCor').value = '#ff6b9d';
  document.getElementById('categoriaCorPreview').style.background = '#ff6b9d';
  document.querySelector('#formCategoria h3').textContent = '🏷️ Adicionar Nova Categoria';
}

// ========== CRUD PRODUTOS ==========
async function carregarProdutos() {
  try {
    const response = await fetch('/api/produtos');
    const produtos = await response.json();
    
    const lista = document.getElementById('produtosLista');
    lista.innerHTML = '';
    
    if (produtos.length === 0) {
      lista.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: #fff3cd; border-radius: 12px; border: 2px solid #ffc107;">
          <h4 style="color: #856404;">⚠️ Nenhum produto cadastrado!</h4>
          <p style="color: #856404; margin: 1rem 0;">Configure primeiro as 4 entidades e depois adicione seus produtos.</p>
        </div>
      `;
      return;
    }

    produtos.forEach(produto => {
      const sabor = produto.sabor?.nome || 'N/A';
      const tipo = produto.tipo?.nome || 'N/A';
      const tamanho = produto.tamanho?.nome || 'N/A';
      const tamanhoMl = produto.tamanho?.ml ? `(${produto.tamanho.ml}ml)` : '';
      const categoria = produto.categoria?.nome || 'N/A';
      const categoriaCor = produto.categoria?.cor || '#999';

      lista.innerHTML += `
        <div class="entity-card produto-card">

          <div class="produto-img">
            <img src="${produto.imagem}" alt="${produto.nome}"
              onerror="this.src='https://via.placeholder.com/300x150/ff6b9d/ffffff?text=Sem+Imagem'">
          </div>

          <div class="produto-info">
            <h3>${produto.nome}</h3>
            <p class="produto-preco">R$ ${Number(produto.preco).toFixed(2)}</p>

            <div class="produto-tags">
              <span class="tag sabor">🍦 ${sabor}</span>
              <span class="tag tipo">✨ ${tipo}</span>
              <span class="tag tamanho">📏 ${tamanho} ${tamanhoMl}</span>
              <span class="tag categoria" style="background:${categoriaCor}">🏷️ ${categoria}</span>
            </div>
          </div>

          <div class="entity-actions">
            <button class="btn-edit" onclick="editarProduto('${produto._id}')">✏️ Editar</button>
            <button class="btn-delete" onclick="deletarProduto('${produto._id}')">🗑️ Excluir</button>
          </div>

        </div>
      `;
    });

  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}


document.getElementById('formProduto')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('produtoId').value;
  const nome = document.getElementById('produtoNome').value;
  const preco = document.getElementById('produtoPreco').value;
  const imagem = document.getElementById('produtoImagem').value;
  const sabor = document.getElementById('produtoSabor').value;
  const tipo = document.getElementById('produtoTipo').value;
  const tamanho = document.getElementById('produtoTamanho').value;
  const categoria = document.getElementById('produtoCategoria').value;
  
  if (!sabor || !tipo || !tamanho || !categoria) {
    showAlert('Por favor, preencha todas as classificações!', 'error');
    return;
  }
  
  try {
    const url = id ? `/api/produtos/${id}` : '/api/produtos';
    const method = id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nome, 
        preco: Number(preco), 
        imagem, 
        sabor, 
        tipo, 
        tamanho, 
        categoria 
      })
    });
    
    if (response.ok) {
      showAlert(`Produto ${id ? 'atualizado' : 'cadastrado'} com sucesso! 🎉`, 'success');
      cancelarEdicaoProduto();
      await carregarProdutos();
    } else {
      const error = await response.json();
      showAlert(`Erro: ${error.error || 'Erro desconhecido'}`, 'error');
    }
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    showAlert('Erro ao salvar produto!', 'error');
  }
});

async function editarProduto(id) {
  try {
    const response = await fetch(`/api/produtos/${id}`);
    const produto = await response.json();
    
    document.getElementById('produtoId').value = produto._id;
    document.getElementById('produtoNome').value = produto.nome;
    document.getElementById('produtoPreco').value = produto.preco;
    document.getElementById('produtoImagem').value = produto.imagem;
    document.getElementById('produtoSabor').value = produto.sabor._id;
    document.getElementById('produtoTipo').value = produto.tipo._id;
    document.getElementById('produtoTamanho').value = produto.tamanho._id;
    document.getElementById('produtoCategoria').value = produto.categoria._id;
    
    document.getElementById('imagemPreviewImg').src = produto.imagem;
    document.getElementById('imagemPreview').style.display = 'block';
    
    document.querySelector('#formProduto h3').textContent = '✏️ Editar Produto';
    document.getElementById('formProduto').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
  }
}

async function deletarProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  
  try {
    const response = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showAlert('Produto excluído com sucesso!', 'success');
      await carregarProdutos();
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
  }
}

function cancelarEdicaoProduto() {
  document.getElementById('produtoId').value = '';
  document.getElementById('produtoNome').value = '';
  document.getElementById('produtoPreco').value = '';
  document.getElementById('produtoImagem').value = '';
  document.getElementById('produtoSabor').value = '';
  document.getElementById('produtoTipo').value = '';
  document.getElementById('produtoTamanho').value = '';
  document.getElementById('produtoCategoria').value = '';
  document.getElementById('imagemPreview').style.display = 'none';
  document.querySelector('#formProduto h3').textContent = '➕ Adicionar Novo Produto';
}

// ========== ALERTAS ==========
function showAlert(message, type = 'info') {
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.style.position = 'fixed';
  alert.style.top = '20px';
  alert.style.right = '20px';
  alert.style.zIndex = '9999';
  alert.style.minWidth = '300px';
  alert.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(400px)';
    alert.style.transition = 'all 0.3s';
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

// ========== INICIALIZAÇÃO ==========
console.log('🚀 Admin Completo carregado!');
checkAuth();
