let editingId = null;

async function carregarTipos() {
  try {
    const response = await fetch('/api/tipos');
    const tipos = await response.json();
    
    const list = document.getElementById('tiposList');
    list.innerHTML = '';
    
    tipos.forEach(tipo => {
      const card = document.createElement('div');
      card.className = 'entity-card';
      card.innerHTML = `
        <div>
          <h3>${tipo.nome}</h3>
          <p>${tipo.descricao || ''}</p>
        </div>
        <div class="entity-actions">
          <button onclick="editar('${tipo._id}')" class="btn-edit">Editar</button>
          <button onclick="deletar('${tipo._id}')" class="btn-delete">Excluir</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar tipos:', error);
  }
}

function abrirModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Novo Tipo';
  document.getElementById('tipoForm').reset();
  document.getElementById('modal').style.display = 'block';
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
}

async function editar(id) {
  try {
    const response = await fetch(`/api/tipos/${id}`);
    const tipo = await response.json();
    
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Editar Tipo';
    document.getElementById('nome').value = tipo.nome;
    document.getElementById('descricao').value = tipo.descricao || '';
    document.getElementById('modal').style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar tipo:', error);
  }
}

async function deletar(id) {
  if (!confirm('Deseja realmente excluir este tipo?')) return;
  
  try {
    const response = await fetch(`/api/tipos/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('Tipo excluído com sucesso!');
      carregarTipos();
    } else {
      alert('Erro ao excluir tipo');
    }
  } catch (error) {
    console.error('Erro ao deletar tipo:', error);
  }
}

document.getElementById('tipoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    nome: document.getElementById('nome').value,
    descricao: document.getElementById('descricao').value
  };
  
  try {
    const url = editingId ? `/api/tipos/${editingId}` : '/api/tipos';
    const method = editingId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      alert('Tipo salvo com sucesso!');
      fecharModal();
      carregarTipos();
    } else {
      alert('Erro ao salvar tipo');
    }
  } catch (error) {
    console.error('Erro ao salvar tipo:', error);
  }
});

window.onclick = function(event) {
  if (event.target == document.getElementById('modal')) {
    fecharModal();
  }
}

carregarTipos();
