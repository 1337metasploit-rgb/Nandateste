let currentUser = null;

async function checkAuth() {
  try {
    const response = await fetch('/api/session');
    const data = await response.json();
    
    if (!data.user) {
      window.location.href = '/login';
      return;
    }
    
    if (data.user.role !== 'admin') {
      alert('Acesso negado! Você não tem permissão de administrador.');
      window.location.href = '/';
      return;
    }
    
    currentUser = data.user;
    document.getElementById('adminUserName').textContent = `👤 ${currentUser.nome}`;
    
    carregarEstatisticas();
    carregarPedidos();
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    window.location.href = '/login';
  }
}

async function carregarEstatisticas() {
  try {
    const response = await fetch('/api/admin/stats');
    const stats = await response.json();
    
    document.getElementById('statTotalPedidos').textContent = stats.totalPedidos;
    document.getElementById('statTotalVendas').textContent = `R$ ${stats.totalVendas.toFixed(2)}`;
    document.getElementById('statPedidosPendentes').textContent = stats.pedidosPendentes;
    document.getElementById('statTotalUsuarios').textContent = stats.totalUsuarios;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

async function carregarPedidos() {
  try {
    const response = await fetch('/api/pedidos');
    const pedidos = await response.json();
    
    const pedidosAdmin = document.getElementById('pedidosAdmin');
    pedidosAdmin.innerHTML = '';
    
    if (pedidos.length === 0) {
      pedidosAdmin.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Nenhum pedido encontrado</p>';
      return;
    }
    
    pedidos.forEach(pedido => {
      const card = document.createElement('div');
      card.className = 'pedido-card';
      
      const data = new Date(pedido.createdAt).toLocaleString('pt-BR');
      
      let itensHTML = '';
      pedido.itens.forEach(item => {
        itensHTML += `
          <div class="pedido-item">
            <span>${item.quantidade}x ${item.nome}</span>
            <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
          </div>
        `;
      });
      
      card.innerHTML = `
        <div class="pedido-header">
          <div>
            <strong>Pedido #${pedido._id.substring(18)}</strong>
            <p style="color: #666; font-size: 0.9rem; margin-top: 0.3rem;">
              ${pedido.userName} - ${data}
            </p>
          </div>
          <span class="pedido-status ${pedido.status}">${getStatusText(pedido.status)}</span>
        </div>
        <div class="pedido-itens">
          ${itensHTML}
        </div>
        <div class="pedido-footer">
          <div class="pedido-total">
            Total: R$ ${pedido.total.toFixed(2)}
          </div>
          <div class="pedido-acoes">
            <select onchange="atualizarStatus('${pedido._id}', this.value)">
              <option value="pendente" ${pedido.status === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="preparando" ${pedido.status === 'preparando' ? 'selected' : ''}>Preparando</option>
              <option value="entregue" ${pedido.status === 'entregue' ? 'selected' : ''}>Entregue</option>
              <option value="cancelado" ${pedido.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </div>
        </div>
      `;
      
      pedidosAdmin.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
  }
}

async function atualizarStatus(pedidoId, novoStatus) {
  try {
    const response = await fetch(`/api/admin/pedidos/${pedidoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus })
    });
    
    if (response.ok) {
      carregarEstatisticas();
      carregarPedidos();
      
      const select = event.target;
      const originalBorder = select.style.border;
      select.style.border = '2px solid var(--success)';
      setTimeout(() => {
        select.style.border = originalBorder;
      }, 500);
    } else {
      alert('Erro ao atualizar status do pedido');
    }
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    alert('Erro ao atualizar status do pedido');
  }
}

function getStatusText(status) {
  const statusMap = {
    'pendente': 'Pendente',
    'preparando': 'Preparando',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  };
  return statusMap[status] || status;
}

document.getElementById('btnLogout').addEventListener('click', async (e) => {
  e.preventDefault();
  
  try {
    await fetch('/api/logout');
    window.location.href = '/';
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
});

checkAuth();

setInterval(() => {
  if (currentUser) {
    carregarEstatisticas();
    carregarPedidos();
  }
}, 30000);
