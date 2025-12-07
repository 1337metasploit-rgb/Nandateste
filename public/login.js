const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const formTitle = document.getElementById('formTitle');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Alternar entre login e registro
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    formTitle.textContent = 'Criar Conta';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    formTitle.textContent = 'Entrar';
});

// Login
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    loginError.classList.remove('show');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login bem-sucedido
            if (data.user.role === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
        } else {
            // Erro no login
            loginError.textContent = data.error || 'Erro ao fazer login';
            loginError.classList.add('show');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        loginError.textContent = 'Erro ao conectar com o servidor';
        loginError.classList.add('show');
    }
});

// Registro
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('registerNome').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    registerError.classList.remove('show');
    
    // Validações
    if (password !== passwordConfirm) {
        registerError.textContent = 'As senhas não coincidem';
        registerError.classList.add('show');
        return;
    }
    
    if (password.length < 6) {
        registerError.textContent = 'A senha deve ter pelo menos 6 caracteres';
        registerError.classList.add('show');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, nome })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registro bem-sucedido
            window.location.href = '/';
        } else {
            // Erro no registro
            registerError.textContent = data.error || 'Erro ao criar conta';
            registerError.classList.add('show');
        }
    } catch (error) {
        console.error('Erro ao criar conta:', error);
        registerError.textContent = 'Erro ao conectar com o servidor';
        registerError.classList.add('show');
    }
});

// Verificar se já está logado
async function checkIfLoggedIn() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();
        
        if (data.user) {
            if (data.user.role === 'admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/';
            }
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
}

checkIfLoggedIn();
