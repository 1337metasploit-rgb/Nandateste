let editingId = null;

async function carregarTamanhos() {
  try {
    const response = await fetch('/api/tamanhos');
    const tamanhos = await response.json();
    
    const list = document.getElementById('tamanhosList');
    list.innerHTML = '';
    
    tamanhos.forEach(tamanho => {
      const card = document.createElement('div');
      card.className = 'entity-card';
      card.innerHTML = `
        <div>
          <h3>${tamanho.nome}</h3>
          <p>${tamanho.ml}ml - Multiplicador: ${tamanho.multiplicadorPreco}x</p>
        </div>
        <div class="entity-actions">
          <button onclick="editar('${tamanho._id}')" class="btn-edit">Editar</button>
          <button onclick="deletar('${tamanho._id}')" class="btn-delete">Excluir</button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar tamanhos:', error);
  }
}

function abrirModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = 'Novo Tamanho';
  document.getElementById('tamanhoForm').reset();
  document.getElementById('modal').style.display = 'block';
}

function fecharModal() {
  document.getElementById('modal').style.display = 'none';
}

async function editar(id) {
  try {
    const response = await fetch(`/api/tamanhos/${id}`);
    const tamanho = await response.json();
    
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Editar Tamanho';
    document.getElementById('nome').value = tamanho.nome;
    document.getElementById('ml').value = tamanho.ml;
    document.getElementById('multiplicadorPreco').value = tamanho.multiplicadorPreco;
    document.getElementById('modal').style.display = 'block';
  } catch (error) {
    console.error('Erro ao carregar tamanho:', error);
  }
}

async function deletar(id) {
  if (!confirm('Deseja realmente excluir este tamanho?')) return;
  
  try {
    const response = await fetch(`/api/tamanhos/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      alert('Tamanho excluído com sucesso!');
      carregarTamanhos();
    } else {
      alert('Erro ao excluir tamanho');
    }
  } catch (error) {
    console.error('Erro ao deletar tamanho:', error);
  }
}

document.getElementById('tamanhoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    nome: document.getElementById('nome').value,
    ml: parseInt(document.getElementById('ml').value),
    multiplicadorPreco: parseFloat(document.getElementById('multiplicadorPreco').value)
  };
  
  try {
    const url = editingId ? `/api/tamanhos/${editingId}` : '/api/tamanhos';
    const method = editingId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      alert('Tamanho salvo com sucesso!');
      fecharModal();
      carregarTamanhos();
    } else {
      alert('Erro ao salvar tamanho');
    }
  } catch (error) {
    console.error('Erro ao salvar tamanho:', error);
  }
});

window.onclick = function(event) {
  if (event.target == document.getElementById('modal')) {
    fecharModal();
  }
}

carregarTamanhos();
