let editingId = null;

async function carregarSabores() {
  try {
    const response = await fetch('/api/sabores');
    const sabores = await response.json();
    
    const list = document.getElementById('saboresList');
    list.innerHTML = '';
    
    sabores.forEach(sabor => {
      const card = document.createElement('div');
      card.className = 'entity-card';
      card.innerHTML = `
        <div>
          <h3>${sabor.nome}</h3>
          <p>${sabor.descricao || ''}</p>
        </div>
        <div class="entity-actions">
          <button onclick="editar('${sabor._id}')" class="btn-edit">Editar</button>
          <button onclick="deletar('${sabor._id}')" class="btn-delete">Excluir</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar sabores:', error);
  }
}

function abrirModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Novo Sabor';
  document.getElementById('saborForm').reset();
  document.getElementById('modal').style.display = 'block';
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
}

async function editar(id) {
  try {
    const response = await fetch(`/api/sabores/${id}`);
    const sabor = await response.json();
    
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Editar Sabor';
    document.getElementById('nome').value = sabor.nome;
    document.getElementById('descricao').value = sabor.descricao || '';
    document.getElementById('modal').style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar sabor:', error);
  }
}

async function deletar(id) {
  if (!confirm('Deseja realmente excluir este sabor?')) return;
  
  try {
    const response = await fetch(`/api/sabores/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('Sabor excluído com sucesso!');
      carregarSabores();
    } else {
      alert('Erro ao excluir sabor');
    }
  } catch (error) {
    console.error('Erro ao deletar sabor:', error);
  }
}

document.getElementById('saborForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    nome: document.getElementById('nome').value,
    descricao: document.getElementById('descricao').value
  };
  
  try {
    const url = editingId ? `/api/sabores/${editingId}` : '/api/sabores';
    const method = editingId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      alert('Sabor salvo com sucesso!');
      fecharModal();
      carregarSabores();
    } else {
      alert('Erro ao salvar sabor');
    }
  } catch (error) {
    console.error('Erro ao salvar sabor:', error);
  }
});

window.onclick = function(event) {
  if (event.target == document.getElementById('modal')) {
    fecharModal();
  }
}

carregarSabores();
