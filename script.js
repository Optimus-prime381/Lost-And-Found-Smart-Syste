const API_URL = 'http://localhost:5000/api/items';
let allItems = [];

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
    showToast(`Switched to ${newTheme} mode`, 'info');
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = theme === 'light' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        themeToggle.title = theme === 'light' 
            ? 'Switch to dark mode' 
            : 'Switch to light mode';
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

function openModal(item) {
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;

    const itemType = item.Type ? item.Type.toUpperCase() : 'N/A';
    const itemTypeColor = item.Type === 'lost' ? 'color: var(--danger); font-weight: 700;' : 'color: var(--secondary); font-weight: 700;';

    modalBody.innerHTML = `
        <div class="item-detail">
            <span class="detail-label" style="${itemTypeColor}">Type:</span>
            <span class="detail-value">${itemType}</span>
        </div>
        <div class="item-detail">
            <span class="detail-label">Item Name:</span>
            <span class="detail-value">${item.ItemName || 'N/A'}</span>
        </div>
        <div class="item-detail">
            <span class="detail-label">Reporter:</span>
            <span class="detail-value">${item.Name || 'N/A'}</span>
        </div>
        <div class="item-detail">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${item.Location || 'N/A'}</span>
        </div>
        <div class="item-detail">
            <span class="detail-label">Description:</span>
            <span class="detail-value">${item.Description || 'No description provided'}</span>
        </div>
        <div class="item-detail">
            <span class="detail-label">Contact:</span>
            <span class="detail-value"><strong>${item.ContactInformation || 'N/A'}</strong></span>
        </div>
        <div class="item-detail">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${item.Date ? new Date(item.Date).toLocaleDateString() : 'N/A'}</span>
        </div>
    `;

    const modal = document.getElementById('itemModal');
    if (modal) modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('itemModal');
    if (modal) modal.classList.remove('show');
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('itemModal');
    if (modal && e.target === modal) {
        closeModal();
    }
});


document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', handleFormSubmit);
    }
    
    loadItems();
});

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

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        Type: document.getElementById('type').value,
        Name: document.getElementById('name').value,
        ItemName: document.getElementById('itemName').value,
        Description: document.getElementById('description').value,
        Location: document.getElementById('location').value,
        ContactInformation: document.getElementById('contact').value
    };
    console.log('Submitting form data:', formData);

    try {
        const response = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast('✅ Item reported successfully! Redirecting...', 'success', 1500);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            const errorData = await response.json();
            showToast(errorData.message || 'Error reporting item', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Error reporting item. Please try again.', 'error');
    }
}

async function loadItems() {
    try {
        const itemsList = document.getElementById('itemsList');
        if (itemsList) {
            itemsList.innerHTML = `
                <div class="loader-container">
                    <div class="spinner"></div>
                    <p>Loading items...</p>
                </div>
            `;
        }

        const response = await fetch(`${API_URL}/get`);
        if (!response.ok) {
            throw new Error('Failed to load items');
        }
        
        allItems = await response.json();
        console.log('Loaded items from API:', allItems);
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const pageType = document.body.getAttribute('data-page');
            if (pageType === 'lost') {
                displayLostItems();
            } else if (pageType === 'found') {
                displayFoundItems();
            }
        }
    } catch (error) {
        console.error('Error loading items:', error);
        const itemsList = document.getElementById('itemsList');
        if (itemsList) {
            itemsList.innerHTML = `
                <div class="no-items">
                    <p>📭 Unable to load items. Please try again later.</p>
                </div>
            `;
        }
        showToast('Failed to load items. Please refresh the page.', 'error');
    }
}

function displayLostItems() {
    const lostItems = allItems.filter(item => item.Type === 'lost');
    displayItems(lostItems);
}

function searchLostItems() {
    const searchTerm = (document.getElementById('searchInput').value || '').toLowerCase();
    const lostItems = allItems.filter(item => 
        item.Type === 'lost' && (
            (item.ItemName || '').toLowerCase().includes(searchTerm) ||
            (item.Location || '').toLowerCase().includes(searchTerm)
        )
    );
    displayItems(lostItems);
}

function displayFoundItems() {
    const foundItems = allItems.filter(item => item.Type === 'found');
    displayItems(foundItems);
}

function searchFoundItems() {
    const searchTerm = (document.getElementById('searchInput').value || '').toLowerCase();
    const foundItems = allItems.filter(item => 
        item.Type === 'found' && (
            (item.ItemName || '').toLowerCase().includes(searchTerm) ||
            (item.Location || '').toLowerCase().includes(searchTerm)
        )
    );
    displayItems(foundItems);
}

function displayItems(items) {
    const itemsList = document.getElementById('itemsList');
    if (!itemsList) return;
    
    itemsList.innerHTML = '';

    if (items.length === 0) {
        const noItemsMessage = document.body.getAttribute('data-page') === 'found' 
            ? 'No found items at the moment.' 
            : 'No lost items found.';
        itemsList.innerHTML = `<div class="no-items"><p>📭 ${noItemsMessage}</p></div>`;
        return;
    }

    items.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = `item-card ${item.Type || ''}`;
        itemCard.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;
        
        const itemType = item.Type ? item.Type.toUpperCase() : 'N/A';
        const itemName = item.ItemName || 'N/A';
        const reporter = item.Name || 'N/A';
        const location = item.Location || 'N/A';
        const description = item.Description || 'N/A';
        const contact = item.ContactInformation || 'N/A';
        const dateStr = item.Date ? new Date(item.Date).toLocaleDateString() : 'N/A';
        
        itemCard.innerHTML = `
            <span class="item-type"><i class="fas ${item.Type === 'lost' ? 'fa-heart-broken' : 'fa-gift'}"></i> ${itemType}</span>
            <div class="item-info"><strong>📦 Item:</strong> <span>${itemName}</span></div>
            <div class="item-info"><strong>👤 Reporter:</strong> <span>${reporter}</span></div>
            <div class="item-info"><strong>📍 Location:</strong> <span>${location}</span></div>
            <div class="item-info"><strong>📝 Description:</strong> <span>${description}</span></div>
            <div class="item-info"><strong>📞 Contact:</strong> <span>${contact}</span></div>
            <div class="item-info"><strong>📅 Date:</strong> <span>${dateStr}</span></div>
            <button style="margin-top: 15px; cursor: pointer; background: var(--info); padding: 10px 16px; font-size: 13px;" onclick="openModal(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <i class="fas fa-expand"></i> View Details
            </button>
        `;
        
        itemCard.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                openModal(item);
            }
        });
        
        itemsList.appendChild(itemCard);
    });
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
    }
    // Also show as toast
    showToast(message, type);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchItems();
            }
        });
    }
});

function searchItems() {
    const pageType = document.body.getAttribute('data-page');
    if (pageType === 'lost') {
        searchLostItems();
    } else if (pageType === 'found') {
        searchFoundItems();
    }
}
