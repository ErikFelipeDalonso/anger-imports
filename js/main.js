document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    initCart();
    initFavorites();
    initAnimations();
    initFilters();
    initForms();
});

let cart = JSON.parse(localStorage.getItem('angerCart')) || [];
let favorites = JSON.parse(localStorage.getItem('angerFavorites')) || [];

function initCart() {
    updateCartCount();
    
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.car-card');
            const carName = card.querySelector('h3').textContent;
            const carPrice = card.querySelector('.price-current').textContent;
            const carImg = card.querySelector('img').src;
            
            addToCart({
                id: Date.now(),
                name: carName,
                price: carPrice,
                image: carImg,
                quantity: 1
            });
        });
    });
}

function addToCart(item) {
    cart.push(item);
    localStorage.setItem('angerCart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Veículo adicionado ao carrinho!', 'success');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('angerCart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    countElements.forEach(el => {
        el.textContent = cart.length;
    });
}

function initFavorites() {
    document.querySelectorAll('.btn-favorite').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.car-card');
            const carName = card.querySelector('h3').textContent;
            
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                this.innerHTML = '<i class="fas fa-heart"></i>';
                this.style.background = 'var(--danger)';
                this.style.color = 'white';
                showNotification(carName + ' adicionado aos favoritos!', 'success');
            } else {
                this.innerHTML = '<i class="fas fa-heart"></i>';
                this.style.background = 'var(--light)';
                this.style.color = 'var(--gray)';
                showNotification(carName + ' removido dos favoritos!', 'info');
            }
        });
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'info-circle') + '"></i> ' + message;
    
    notification.style.cssText = 'position: fixed; top: 100px; right: 20px; background: ' + (type === 'success' ? '#10b981' : '#3b82f6') + '; color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 10px;';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.car-card, .feature-card, .promo-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

function searchVehicles() {
    const search = document.getElementById('heroSearch');
    const brand = document.getElementById('heroBrand');
    const price = document.getElementById('heroPrice');
    
    const params = new URLSearchParams();
    
    if (search && search.value) params.append('search', search.value);
    if (brand && brand.value) params.append('brand', brand.value);
    if (price && price.value) params.append('price', price.value);
    
    window.location.href = 'catalogo.html?' + params.toString();
}

function initFilters() {
    const filterForm = document.getElementById('filterForm');
    if (!filterForm) return;

    filterForm.addEventListener('change', applyFilters);
    
    const rangeInputs = filterForm.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        input.addEventListener('input', function() {
            const output = document.getElementById(this.id + 'Value');
            if (output) {
                output.textContent = formatCurrency(this.value);
            }
        });
    });
}

function applyFilters() {
    const form = document.getElementById('filterForm');
    const formData = new FormData(form);
    
    const cards = document.querySelectorAll('.car-card');
    
    cards.forEach(card => {
        let show = true;
        const cardData = {
            brand: card.dataset.brand || '',
            year: parseInt(card.dataset.year) || 0,
            price: parseInt(card.dataset.price) || 0,
            fuel: card.dataset.fuel || ''
        };
        
        const selectedBrand = formData.get('brand');
        if (selectedBrand && cardData.brand !== selectedBrand) show = false;
        
        const selectedFuel = formData.get('fuel');
        if (selectedFuel && cardData.fuel !== selectedFuel) show = false;
        
        const minPrice = parseInt(formData.get('minPrice')) || 0;
        const maxPrice = parseInt(formData.get('maxPrice')) || Infinity;
        if (cardData.price < minPrice || cardData.price > maxPrice) show = false;
        
        const minYear = parseInt(formData.get('minYear')) || 0;
        const maxYear = parseInt(formData.get('maxYear')) || 9999;
        if (cardData.year < minYear || cardData.year > maxYear) show = false;
        
        card.style.display = show ? 'block' : 'none';
    });
}

function initForms() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    const testDriveForm = document.getElementById('testDriveForm');
    if (testDriveForm) {
        testDriveForm.addEventListener('submit', handleTestDrive);
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (validateEmail(email) && password.length >= 6) {
        localStorage.setItem('angerUser', JSON.stringify({ email: email, name: email.split('@')[0] }));
        showNotification('Login realizado com sucesso!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
    } else {
        showNotification('Email ou senha inválidos', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem', 'error');
        return;
    }

    if (name && validateEmail(email) && password.length >= 6) {
        localStorage.setItem('angerUser', JSON.stringify({ email: email, name: name }));
        showNotification('Cadastro realizado com sucesso!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
    } else {
        showNotification('Preencha todos os campos corretamente', 'error');
    }
}

function handleTestDrive(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (data.cep && data.nome && data.celular && data.email) {
        showNotification('Interesse enviado com sucesso! Entraremos em contato.', 'success');
        e.target.reset();
    } else {
        showNotification('Preencha todos os campos obrigatórios', 'error');
    }
}

function handleCheckout(e) {
    e.preventDefault();
    const paymentMethod = document.querySelector('input[name="payment"]:checked');
    
    if (!paymentMethod) {
        showNotification('Selecione uma forma de pagamento', 'error');
        return;
    }

    showNotification('Pedido realizado com sucesso!', 'success');
    cart = [];
    localStorage.setItem('angerCart', JSON.stringify(cart));
    updateCartCount();
    
    setTimeout(() => window.location.href = 'index.html', 2000);
}

function handleContact(e) {
    e.preventDefault();
    showNotification('Mensagem enviada com sucesso!', 'success');
    e.target.reset();
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatCurrency(value) {
    return 'R$ ' + parseInt(value).toLocaleString('pt-BR');
}

function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Seu carrinho está vazio</p></div>';
        document.getElementById('cartTotal').textContent = 'R$ 0,00';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const priceNum = parseFloat(item.price.replace(/[^\d,]/g, '').replace(',', '.'));
        total += priceNum;
        
        html += '<div class="cart-item">' +
            '<img src="' + item.image + '" alt="' + item.name + '">' +
            '<div class="cart-item-info">' +
                '<h4>' + item.name + '</h4>' +
                '<span>' + item.price + '</span>' +
            '</div>' +
            '<button onclick="removeFromCart(' + item.id + ')" class="btn-remove"><i class="fas fa-trash"></i></button>' +
        '</div>';
    });

    cartContainer.innerHTML = html;
    document.getElementById('cartTotal').textContent = formatCurrency(total);
}

const style = document.createElement('style');
style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
document.head.appendChild(style);
