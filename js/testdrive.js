document.addEventListener('DOMContentLoaded', function() {
    initTestDriveForm();
    setMinDate();
});

function initTestDriveForm() {
    const form = document.getElementById('testDriveForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });

    document.getElementById('fullName').addEventListener('blur', validateName);
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('phone').addEventListener('blur', validatePhone);
}

function setMinDate() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const minDate = today.toISOString().split('T')[0];
    document.getElementById('preferredDate').setAttribute('min', minDate);
}

function maskCEP(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    input.value = value;
}

function maskPhone(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 6) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7);
    } else if (value.length > 2) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
    } else if (value.length > 0) {
        value = '(' + value;
    }
    
    input.value = value;
}

function detectLocation() {
    const btn = document.querySelector('.btn-detect-location');
    const detectedDiv = document.getElementById('detectedLocation');
    
    if (!navigator.geolocation) {
        showNotification('Geolocalização não suportada', 'error');
        return;
    }
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detectando...';
    btn.classList.add('loading');
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)
                .then(response => response.json())
                .then(data => {
                    const city = data.address.city || data.address.town || data.address.village || 'Localização encontrada';
                    const state = data.address.state || '';
                    const postcode = data.address.postcode || '';
                    
                    document.getElementById('detectedCity').textContent = city + (state ? ' - ' + state : '');
                    detectedDiv.style.display = 'flex';
                    
                    if (postcode) {
                        document.getElementById('cep').value = postcode.replace('-', '');
                        searchCEP();
                    }
                    
                    calculateDistances(lat, lng);
                    
                    btn.innerHTML = '<i class="fas fa-check"></i> Localização detectada';
                    btn.style.background = '#10b981';
                    
                    localStorage.setItem('angerLocation', JSON.stringify({
                        city: city,
                        state: state,
                        lat: lat,
                        lng: lng,
                        postcode: postcode
                    }));
                })
                .catch(() => {
                    btn.innerHTML = '<i class="fas fa-crosshairs"></i> Detectar minha localização';
                    btn.classList.remove('loading');
                    btn.disabled = false;
                    showNotification('Erro ao identificar localização', 'error');
                });
        },
        function(error) {
            btn.innerHTML = '<i class="fas fa-crosshairs"></i> Detectar minha localização';
            btn.classList.remove('loading');
            btn.disabled = false;
            
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

function calculateDistances(userLat, userLng) {
    const stores = [
        { id: 'distance1', lat: -23.5629, lng: -46.6544 },
        { id: 'distance2', lat: -23.6230, lng: -46.6990 },
        { id: 'distance3', lat: -23.0004, lng: -43.3659 },
        { id: 'distance4', lat: -19.9167, lng: -43.9345 }
    ];
    
    stores.forEach(store => {
        const distance = calculateDistance(userLat, userLng, store.lat, store.lng);
        document.getElementById(store.id).textContent = distance.toFixed(1) + ' km';
    });
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI/180);
}

function searchCEP() {
    const cep = document.getElementById('cep').value.replace('-', '');
    
    if (cep.length !== 8) return;
    
    fetch('https://viacep.com.br/ws/' + cep + '/json/')
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                showFieldError('cepError', 'CEP não encontrado');
                return;
            }
            
            clearFieldError('cepError');
            
            const city = data.localidade || '';
            const state = data.uf || '';
            
            const coords = getCityCoordinates(city, state);
            if (coords) {
                calculateDistances(coords.lat, coords.lng);
            }
        })
        .catch(() => {
            showFieldError('cepError', 'Erro ao buscar CEP');
        });
}

function getCityCoordinates(city, state) {
    const cities = {
        'São Paulo': { lat: -23.5505, lng: -46.6333 },
        'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
        'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
        'Brasília': { lat: -15.7942, lng: -47.8822 },
        'Curitiba': { lat: -25.4290, lng: -49.2671 },
        'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
        'Salvador': { lat: -12.9714, lng: -38.5014 },
        'Fortaleza': { lat: -3.7172, lng: -38.5433 },
        'Recife': { lat: -8.0476, lng: -34.8770 },
        'Campinas': { lat: -22.9099, lng: -47.0626 }
    };
    
    return cities[city] || null;
}

function loadModels() {
    const brand = document.getElementById('vehicleBrand').value;
    const modelSelect = document.getElementById('vehicleModel');
    
    modelSelect.innerHTML = '<option value="">Carregando...</option>';
    
    const models = {
        'bmw': ['Série 3', 'Série 5', 'Série 7', 'X3', 'X5', 'X7', 'M3', 'M5'],
        'mercedes': ['Classe A', 'Classe C', 'Classe E', 'Classe S', 'GLA', 'GLC', 'GLE', 'AMG GT'],
        'audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'RS6'],
        'porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Cayman', 'Boxster'],
        'landrover': ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender', 'Evoque'],
        'volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90'],
        'jaguar': ['XE', 'XF', 'XJ', 'F-Pace', 'F-Type', 'E-Pace']
    };
    
    setTimeout(() => {
        if (brand && models[brand]) {
            modelSelect.innerHTML = '<option value="">Selecione</option>';
            models[brand].forEach(model => {
                const option = document.createElement('option');
                option.value = model.toLowerCase().replace(' ', '-');
                option.textContent = model;
                modelSelect.appendChild(option);
            });
        } else {
            modelSelect.innerHTML = '<option value="">Selecione a marca primeiro</option>';
        }
    }, 300);
}

function validateName() {
    const name = document.getElementById('fullName').value;
    const errorEl = document.getElementById('nameError');
    
    if (name.length < 3) {
        showFieldError('nameError', 'Digite seu nome completo');
        return false;
    }
    
    clearFieldError('nameError');
    return true;
}

function validateEmail() {
    const email = document.getElementById('email').value;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!regex.test(email)) {
        showFieldError('emailError', 'Digite um e-mail válido');
        return false;
    }
    
    clearFieldError('emailError');
    return true;
}

function validatePhone() {
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    
    if (phone.length < 10 || phone.length > 11) {
        showFieldError('phoneError', 'Digite um telefone válido');
        return false;
    }
    
    clearFieldError('phoneError');
    return true;
}

function validateForm() {
    let isValid = true;
    
    if (!validateName()) isValid = false;
    if (!validateEmail()) isValid = false;
    if (!validatePhone()) isValid = false;
    
    const cep = document.getElementById('cep').value.replace('-', '');
    if (cep.length !== 8) {
        showFieldError('cepError', 'Digite um CEP válido');
        isValid = false;
    }
    
    if (!document.getElementById('acceptTerms').checked) {
        showNotification('Aceite os termos de uso', 'error');
        isValid = false;
    }
    
    if (!document.getElementById('ageConfirm').checked) {
        showNotification('Confirme que é maior de 18 anos', 'error');
        isValid = false;
    }
    
    return isValid;
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

function submitForm() {
    const btn = document.querySelector('.btn-submit-td');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Enviando...</span>';
    
    const formData = {
        cep: document.getElementById('cep').value,
        store: document.querySelector('input[name="store"]:checked').value,
        brand: document.getElementById('vehicleBrand').value,
        model: document.getElementById('vehicleModel').value,
        preferredDate: document.getElementById('preferredDate').value,
        preferredTime: document.getElementById('preferredTime').value,
        name: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        acceptTerms: document.getElementById('acceptTerms').checked,
        ageConfirm: document.getElementById('ageConfirm').checked,
        receiveOffers: document.getElementById('receiveOffers').checked,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('angerTestDrive', JSON.stringify(formData));
    
    setTimeout(() => {
        document.getElementById('successModal').classList.add('active');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Enviar Interesse</span>';
    }, 1500);
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
    document.getElementById('testDriveForm').reset();
    
    const detectedDiv = document.getElementById('detectedLocation');
    detectedDiv.style.display = 'none';
    
    const btn = document.querySelector('.btn-detect-location');
    btn.innerHTML = '<i class="fas fa-crosshairs"></i> Detectar minha localização';
    btn.style.background = '';
    btn.classList.remove('loading');
    btn.disabled = false;
    
    document.querySelectorAll('.store-distance').forEach(el => {
        el.textContent = '-';
    });
}

function openTerms() {
    document.getElementById('termsModal').classList.add('active');
    return false;
}

function openPrivacy() {
    document.getElementById('privacyModal').classList.add('active');
    return false;
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

function showNotification(message, type) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle') + '"></i> ' + message;
    notification.style.cssText = 'position: fixed; top: 120px; right: 20px; background: ' + (type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6') + '; color: white; padding: 15px 25px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 10px;';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
