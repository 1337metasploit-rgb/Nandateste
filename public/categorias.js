let editingId = null;

async function carregarCategorias() {
  try {
    const response = await fetch('/api/categorias');
    const categorias = await response.json();
    
    const list = document.getElementById('categoriasList');
    list.innerHTML = '';
    
    categorias.forEach(categoria => {
      const card = document.createElement('div');
      card.className = 'entity-card';
      card.innerHTML = `
        <div>
          <h3>${categoria.nome}</h3>
          <p>${categoria.descricao || ''}</p>
          <div style="display: inline-block; width: 30px; height: 30px; background: ${categoria.cor}; border-radius: 5px; margin-top: 0.5rem;"></div>
        </div>
        <div class="entity-actions">
          <button onclick="editar('${categoria._id}')" class="btn-edit">Editar</button>
          <button onclick="deletar('${categoria._id}')" class="btn-delete">Excluir</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

function abrirModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Nova Categoria';
  document.getElementById('categoriaForm').reset();
  document.getElementById('modal').style.display = 'block';
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
}

async function editar(id) {
  try {
    const response = await fetch(`/api/categorias/${id}`);
    const categoria = await response.json();
    
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Editar Categoria';
    document.getElementById('nome').value = categoria.nome;
    document.getElementById('descricao').value = categoria.descricao || '';
    document.getElementById('cor').value = categoria.cor;
    document.getElementById('modal').style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar categoria:', error);
  }
}

async function deletar(id) {
  if (!confirm('Deseja realmente excluir esta categoria?')) return;
  
  try {
    const response = await fetch(`/api/categorias/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('Categoria excluída com sucesso!');
      carregarCategorias();
    } else {
      alert('Erro ao excluir categoria');
    }
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
  }
}

document.getElementById('categoriaForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    nome: document.getElementById('nome').value,
    descricao: document.getElementById('descricao').value,
    cor: document.getElementById('cor').value
  };
  
  try {
    const url = editingId ? `/api/categorias/${editingId}` : '/api/categorias';
    const method = editingId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      alert('Categoria salva com sucesso!');
      fecharModal();
      carregarCategorias();
    } else {
      alert('Erro ao salvar categoria');
    }
  } catch (error) {
    console.error('Erro ao salvar categoria:', error);
  }
});

window.onclick = function(event) {
  if (event.target == document.getElementById('modal')) {
    fecharModal();
  }
}

carregarCategorias();
