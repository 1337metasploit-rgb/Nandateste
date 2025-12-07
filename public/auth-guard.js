// auth-guard.js - Proteção para páginas administrativas
(async function() {
    try {
        console.log('🔒 Verificando permissões de acesso...');
        
        const response = await fetch('/api/session');
        const data = await response.json();
        
        if (!data.user) {
            console.log('❌ Usuário não autenticado');
            alert('⚠️ Você precisa estar logado para acessar esta página!');
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }
        
        if (data.user.role !== 'admin') {
            console.log('❌ Usuário não é admin:', data.user.nome);
            alert('🚫 Acesso Negado!\n\nApenas administradores podem acessar esta área.\nUsuário atual: ' + data.user.nome);
            window.location.href = '/';
            return;
        }
        
        console.log('✅ Acesso autorizado! Bem-vindo,', data.user.nome);
        
        // Atualizar o menu com o nome do usuário se houver um elemento para isso
        const userNameElement = document.getElementById('adminUserName');
        if (userNameElement) {
            userNameElement.textContent = `Olá, ${data.user.nome}!`;
            userNameElement.style.color = 'var(--primary-color)';
            userNameElement.style.fontWeight = 'bold';
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar permissão:', error);
        alert('⚠️ Erro ao verificar suas credenciais. Por favor, faça login novamente.');
        window.location.href = '/login';
    }
})();
