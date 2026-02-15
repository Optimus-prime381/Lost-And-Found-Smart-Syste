const API_URL = 'http://localhost:5000/api/auth';


function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'light' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}


function showToast(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    toast.innerHTML = `
        <span class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></span>
        <span class="toast-content">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('removing');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
});

async function handleSignup(e) {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('❌ Passwords do not match!', 'error');
        showToast('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('❌ Password must be at least 6 characters!', 'error');
        showToast('Password must be at least 6 characters!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullname,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);
            showMessage('✅ Account created successfully! Redirecting...', 'success');
            showToast('Welcome! Account created successfully', 'success', 1500);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage(`❌ ${data.message || 'Error creating account'}`, 'error');
            showToast(data.message || 'Error creating account', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ Error creating account', 'error');
        showToast('Error creating account. Please try again.', 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);
            showMessage('✅ Login successful! Redirecting...', 'success');
            showToast('Welcome back! Login successful', 'success', 1500);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage(`❌ ${data.message || 'Invalid email or password'}`, 'error');
            showToast(data.message || 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ Error logging in', 'error');
        showToast('Error logging in. Please try again.', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
    }
}

function logout() {
    console.log('🔓 Logout initiated');
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    console.log('✅ Auth tokens cleared');
    console.log('📍 Redirecting to login page');
    
    showToast('Logged out successfully', 'success', 1500);
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}
