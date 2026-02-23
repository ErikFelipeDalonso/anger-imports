document.addEventListener('DOMContentLoaded', function() {
    initFiltersSidebar();
    initCatalogFunctions();
    loadUrlParams();
});

function initFiltersSidebar() {
    const toggleBtn = document.getElementById('toggleFilters');
    const sidebar = document.getElementById('filtersSidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        });

        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

function initCatalogFunctions() {
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.car-card');
            const carInfo = {
                id: Date.now(),
                name: card.querySelector('h3').textContent,
                price: card.querySelector('.price-current').textContent,
                image: card.querySelector('img').src
            };
            
            let cart = JSON.parse(localStorage.getItem('angerCart')) || [];
            cart.push(carInfo);
            localStorage.setItem('angerCart', JSON.stringify(cart));
            updateCartDisplay();
            showNotification('Adicionado ao carrinho!', 'success');
        });
    });

    document.querySelectorAll('.btn-favorite').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                this.style.background = '#ef4444';
                this.style.color = '#fff';
                showNotification('Adicionado aos favoritos!', 'success');
            } else {
                this.style.background = 'var(--light)';
                this.style.color = 'var(--gray)';
            }
        });
    });
}

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('angerCart')) || [];
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = cart.length;
    });
}

function applyFilters() {
    const brand = document.getElementById('filterBrand').value;
    const minYear = document.getElementById('minYear').value;
    const maxYear = document.getElementById('maxYear').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    const fuelCheckboxes = document.querySelectorAll('input[name="fuel"]:checked');
    const selectedFuels = Array.from(fuelCheckboxes).map(cb => cb.value);
    
    const cards = document.querySelectorAll('.car-card');
    let visibleCount = 0;

    cards.forEach(card => {
        let show = true;
        
        const cardBrand = card.dataset.brand;
        const cardYear = parseInt(card.dataset.year);
        const cardPrice = parseInt(card.dataset.price);
        const cardFuel = card.dataset.fuel;
        
        if (brand && cardBrand !== brand) show = false;
        
        if (minYear && cardYear < parseInt(minYear)) show = false;
        if (maxYear && cardYear > parseInt(maxYear)) show = false;
        
        if (minPrice && cardPrice < parseInt(minPrice)) show = false;
        if (maxPrice && cardPrice > parseInt(maxPrice)) show = false;
        
        if (selectedFuels.length > 0 && !selectedFuels.includes(cardFuel)) show = false;
        
        card.style.display = show ? 'block' : 'none';
        if (show) visibleCount++;
    });

    document.getElementById('resultsCount').textContent = visibleCount + ' veículos encontrados';
    
    const sidebar = document.getElementById('filtersSidebar');
    sidebar.classList.remove('active');
    document.body.style.overflow = '';
    
    showNotification('Filtros aplicados!', 'success');
}

function clearFilters() {
    document.getElementById('filterForm').reset();
    document.querySelectorAll('.car-card').forEach(card => {
        card.style.display = 'block';
    });
    document.getElementById('resultsCount').textContent = '12 veículos encontrados';
    showNotification('Filtros limpos!', 'info');
}

function sortVehicles() {
    const sortBy = document.getElementById('sortBy').value;
    const grid = document.getElementById('carsGrid');
    const cards = Array.from(grid.querySelectorAll('.car-card'));
    
    cards.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        const yearA = parseInt(a.dataset.year);
        const yearB = parseInt(b.dataset.year);
        
        switch(sortBy) {
            case 'price-asc':
                return priceA - priceB;
            case 'price-desc':
                return priceB - priceA;
            case 'year-desc':
                return yearB - yearA;
            case 'year-asc':
                return yearA - yearB;
            default:
                return 0;
        }
    });
    
    cards.forEach(card => grid.appendChild(card));
}

function loadUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('brand')) {
        document.getElementById('filterBrand').value = params.get('brand');
    }
    
    if (params.has('search')) {
        const searchTerm = params.get('search').toLowerCase();
        const cards = document.querySelectorAll('.car-card');
        let count = 0;
        
        cards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const show = name.includes(searchTerm);
            card.style.display = show ? 'block' : 'none';
            if (show) count++;
        });
        
        document.getElementById('resultsCount').textContent = count + ' veículos encontrados';
    }
    
    if (params.has('price')) {
        const maxPrice = params.get('price');
        document.getElementById('maxPrice').value = maxPrice;
        applyFilters();
    }
}

function showNotification(message, type) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'info-circle') + '"></i> ' + message;
    notification.style.cssText = 'position: fixed; top: 120px; right: 20px; background: ' + (type === 'success' ? '#10b981' : '#3b82f6') + '; color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 10px;';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
