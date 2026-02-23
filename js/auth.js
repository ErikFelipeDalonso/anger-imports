document.addEventListener('DOMContentLoaded', function() {
    initAuthForms();
    checkLoggedUser();
});

function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        document.getElementById('loginEmail').addEventListener('blur', validateEmailField);
        document.getElementById('loginPassword').addEventListener('blur', validatePasswordField);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        document.getElementById('regName')?.addEventListener('blur', validateNameField);
        document.getElementById('regEmail')?.addEventListener('blur', validateEmailField);
        document.getElementById('regPassword')?.addEventListener('blur', validatePasswordField);
        document.getElementById('regConfirmPassword')?.addEventListener('blur', validateConfirmPasswordField);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    let isValid = true;
    
    if (!validateEmail(email)) {
        showFieldError('emailError', 'Digite um e-mail válido');
        isValid = false;
    }
    
    if (password.length < 6) {
        showFieldError('passwordError', 'A senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    if (!isValid) return;
    
    const btn = e.target.querySelector('.btn-auth');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    
    setTimeout(() => {
        const user = {
            email: email,
            name: email.split('@')[0],
            loggedAt: new Date().toISOString()
        };
        
        if (rememberMe) {
            localStorage.setItem('angerUser', JSON.stringify(user));
        } else {
            sessionStorage.setItem('angerUser', JSON.stringify(user));
        }
        
        showNotification('Login realizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }, 1500);
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const terms = document.getElementById('terms')?.checked;
    const age = document.getElementById('ageConfirm')?.checked;
    
    let isValid = true;
    
    if (name.length < 3) {
        showFieldError('nameError', 'Digite seu nome completo');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showFieldError('emailError', 'Digite um e-mail válido');
        isValid = false;
    }
    
    if (password.length < 6) {
        showFieldError('passwordError', 'A senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirmError', 'As senhas não coincidem');
        isValid = false;
    }
    
    if (!terms) {
        showNotification('Aceite os termos de uso', 'error');
        isValid = false;
    }
    
    if (!age) {
        showNotification('Confirme que é maior de 18 anos', 'error');
        isValid = false;
    }
    
    if (!isValid) return;
    
    const btn = e.target.querySelector('.btn-auth');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
    
    setTimeout(() => {
        const user = {
            email: email,
            name: name,
            loggedAt: new Date().toISOString()
        };
        
        localStorage.setItem('angerUser', JSON.stringify(user));
        
        showNotification('Cadastro realizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }, 1500);
}

function validateEmailField(e) {
    const field = e ? e.target : document.getElementById('loginEmail') || document.getElementById('regEmail');
    const errorId = field.id === 'loginEmail' ? 'emailError' : 'emailError';
    
    clearFieldError(errorId);
    
    if (field.value && !validateEmail(field.value)) {
        showFieldError(errorId, 'Digite um e-mail válido');
        field.classList.add('error');
        field.classList.remove('success');
        return false;
    } else if (field.value) {
        field.classList.add('success');
        field.classList.remove('error');
        return true;
    }
    return false;
}

function validatePasswordField(e) {
    const field = e ? e.target : document.getElementById('loginPassword') || document.getElementById('regPassword');
    const errorId = 'passwordError';
    
    clearFieldError(errorId);
    
    if (field.value && field.value.length < 6) {
        showFieldError(errorId, 'A senha deve ter pelo menos 6 caracteres');
        field.classList.add('error');
        field.classList.remove('success');
        return false;
    } else if (field.value) {
        field.classList.add('success');
        field.classList.remove('error');
        return true;
    }
    return false;
}

function validateNameField(e) {
    const field = e ? e.target : document.getElementById('regName');
    
    clearFieldError('nameError');
    
    if (field.value && field.value.length < 3) {
        showFieldError('nameError', 'Digite seu nome completo');
        field.classList.add('error');
        return false;
    } else if (field.value) {
        field.classList.add('success');
        return true;
    }
    return false;
}

function validateConfirmPasswordField(e) {
    const field = e ? e.target : document.getElementById('regConfirmPassword');
    const password = document.getElementById('regPassword').value;
    
    clearFieldError('confirmError');
    
    if (field.value && field.value !== password) {
        showFieldError('confirmError', 'As senhas não coincidem');
        field.classList.add('error');
        return false;
    } else if (field.value) {
        field.classList.add('success');
        return true;
    }
    return false;
}

function showFieldError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
    }
}

function clearFieldError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function checkLoggedUser() {
    const user = JSON.parse(localStorage.getItem('angerUser') || sessionStorage.getItem('angerUser') || 'null');
    
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
}

function getLocation() {
    const locationInfo = document.getElementById('locationInfo');
    const btn = document.querySelector('.btn-get-location');
    
    if (!navigator.geolocation) {
        showNotification('Geolocalização não suportada pelo navegador', 'error');
        return;
    }
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detectando...';
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            
            document.getElementById('userCoords').textContent = lat + ', ' + lng;
            
            fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)
                .then(response => response.json())
                .then(data => {
                    const city = data.address.city || data.address.town || data.address.village || data.address.municipality || 'Não identificado';
                    const state = data.address.state || '';
                    
                    document.getElementById('userCity').textContent = city + (state ? ' - ' + state : '');
                    
                    const stores = [
                        { name: 'A.N.G.E.R São Paulo', city: 'São Paulo', distance: Math.random() * 50 },
                        { name: 'A.N.G.E.R Rio de Janeiro', city: 'Rio de Janeiro', distance: Math.random() * 50 },
                        { name: 'A.N.G.E.R Belo Horizonte', city: 'Belo Horizonte', distance: Math.random() * 50 }
                    ];
                    
                    const nearest = stores.reduce((a, b) => a.distance < b.distance ? a : b);
                    document.getElementById('nearestStore').textContent = nearest.name;
                    
                    locationInfo.style.display = 'flex';
                    btn.innerHTML = '<i class="fas fa-check"></i> Localização detectada';
                    btn.style.background = '#10b981';
                    
                    localStorage.setItem('angerLocation', JSON.stringify({
                        city: city,
                        state: state,
                        lat: lat,
                        lng: lng,
                        nearestStore: nearest.name
                    }));
                })
                .catch(() => {
                    document.getElementById('userCity').textContent = 'Não identificado';
                    document.getElementById('nearestStore').textContent = 'São Paulo - Paulista';
                    locationInfo.style.display = 'flex';
                    btn.innerHTML = '<i class="fas fa-check"></i> Localização detectada';
                });
        },
        function(error) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-crosshairs"></i> Detectar minha localização';
            
            let message = 'Erro ao obter localização';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Permissão de localização negada';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Localização indisponível';
                    break;
                case error.TIMEOUT:
                    message = 'Tempo esgotado';
                    break;
            }
            
            showNotification(message, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function showNotification(message, type) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle') + '"></i> ' + message;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: ' + (type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6') + '; color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 10px;';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
