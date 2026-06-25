import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getDatabase, ref, get, set, child } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

const MENU_STORAGE_KEY = 'hanariMenuData';

const firebaseConfig = {
    apiKey: "AIzaSyA1s67tKm4brUI3OPJNn-a2Gsm2Yn4s-vk",
    authDomain: "azey-d036b.firebaseapp.com",
    databaseURL: "https://azey-d036b-default-rtdb.firebaseio.com",
    projectId: "azey-d036b",
    storageBucket: "azey-d036b.firebasestorage.app",
    messagingSenderId: "1077096180428",
    appId: "1:1077096180428:web:4a358fcac1c33f7a5eb069",
    measurementId: "G-WJX8GYT3TM"
};

let firebaseDb = null;
let isFirebaseReady = false;

async function initFirebase() {
    if (isFirebaseReady) return;

    try {
        const app = initializeApp(firebaseConfig);
        firebaseDb = getDatabase(app);
        isFirebaseReady = true;
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.warn('Firebase could not initialize; falling back to localStorage.', error);
    }
}

const defaultMenuItems = [
    {
        id: 'banana-pudding-matcha',
        category: 'Featured Drinks',
        name: 'banana pudding matcha',
        description: 'A creamy matcha latte topped with banana pudding crunch.',
        price: '7.49',
        image: 'image/Pasted Image.png'
    },
    {
        id: 'coffee-jelly-frappe',
        category: 'Featured Drinks',
        name: 'coffee jelly frappe',
        description: 'Classic frappe with coffee jelly pieces for a silky, chewy finish.',
        price: '6.99',
        image: 'image/Pasted Image 2.png'
    },
    {
        id: 'matcha-biscoff-frappe',
        category: 'Featured Drinks',
        name: 'matcha biscoff frappe',
        description: 'Green tea frappe with Biscoff swirl and crunchy biscuit topping.',
        price: '7.99',
        image: 'image/Pasted Image 3.png'
    },
    {
        id: 'biscoff-latte',
        category: 'Featured Drinks',
        name: 'biscoff latte',
        description: 'Rich espresso with sweet Biscoff cream and a caramel finish.',
        price: '5.49',
        image: 'image/Pasted Image 9.png'
    },
    {
        id: 'okinawa-milktea',
        category: 'Signature Lattes',
        name: 'okinawa milktea',
        description: 'Caramel-rich milk tea with Okinawa brown sugar flavor.',
        price: '5.99',
        image: 'image/Pasted Image 4.png'
    },
    {
        id: 'spanish-latte',
        category: 'Signature Lattes',
        name: 'spanish latte',
        description: 'Classic Spanish latte with creamy espresso and sweet milk.',
        price: '8.49',
        image: 'image/Pasted Image 7.png'
    },
    {
        id: 'sea-salt-matcha-latte',
        category: 'Signature Lattes',
        name: 'sea salt matcha latte',
        description: 'Velvety matcha with a subtle sea salt foam on top.',
        price: '6.25',
        image: 'image/Pasted Image 8.png'
    },
    {
        id: 'onion-rings',
        category: 'Snacks',
        name: 'onion rings',
        description: 'Golden, crunchy rings served with a creamy dip.',
        price: '4.75',
        image: 'image/Pasted Image 5.png'
    }
];

const ADMIN_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/320x240/fff5ef/8b5e48?text=Add+image';
const EMPTY_IMAGE_SRC = ADMIN_PLACEHOLDER_IMAGE;
const ADMIN_PASSWORD = 'hanari2026';
const ADMIN_LOCK_KEY = 'hanariAdminUnlocked';

const categoryMap = {
    'Coffee Series': 'coffee-series-items',
    'Non-Coffee Series': 'non-coffee-series-items',
    'Matcha Series': 'matcha-series-items',
    'Refreshers': 'refreshers-items',
    'Hanari House Specials': 'hanari-house-specials-items',
    'Frappe & Smoothie Series': 'frappe-smoothie-series-items',
    'Milktea Series': 'milktea-series-items',
    'Add-Ons': 'add-ons-items',
    'Snacks': 'snacks-items',
    'Waffles': 'waffles-items',
    'Pizza': 'pizza-items',
    'Rice Bowls': 'rice-bowls-items'
};

async function getStoredMenuItems() {
    await initFirebase();

    if (isFirebaseReady) {
        try {
            const snapshot = await get(child(ref(firebaseDb), 'menuItems'));
            console.log('Firebase read snapshot:', snapshot.exists(), snapshot.val());
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Array.isArray(data) ? data : Object.values(data);
            }
        } catch (error) {
            console.warn('Firebase read failed, using localStorage fallback.', error);
        }
    }

    const stored = localStorage.getItem(MENU_STORAGE_KEY);
    if (!stored) return defaultMenuItems.slice();
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        return defaultMenuItems.slice();
    } catch (e) {
        return defaultMenuItems.slice();
    }
}

async function getStoredReviews() {
    await initFirebase();
    if (isFirebaseReady) {
        try {
            const snapshot = await get(child(ref(firebaseDb), 'reviews'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Array.isArray(data) ? data : Object.values(data);
            }
        } catch (error) {
            console.warn('Firebase review read failed, using localStorage fallback.', error);
        }
    }

    const stored = localStorage.getItem('hanariReviews');
    if (!stored) {
        return [
            {
                id: 'althea-review',
                image: 'image/pic-1.png',
                name: 'Althea',
                comment: '“The coffee and atmosphere are both amazing. My favorite spot for evening catchups.”'
            },
            {
                id: 'marco-review',
                image: 'image/pic-2.png',
                name: 'Marco',
                comment: '“Fresh drinks, friendly service, and a beautiful space. Highly recommend the floral latte.”'
            },
            {
                id: 'ysabelle-review',
                image: 'image/pic-3.png',
                name: 'Ysabelle',
                comment: '“Cozy, relaxing, and the perfect place to unwind after work. The staff made our visit special.”'
            }
        ];
    }

    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

async function saveReviews(reviews) {
    localStorage.setItem('hanariReviews', JSON.stringify(reviews));

    if (document.getElementById('review-grid')) {
        await renderReviewsPage();
    }

    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html') {
        const reviewSection = document.getElementById('reviews');
        if (reviewSection) {
            reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    if (isFirebaseReady) {
        try {
            await set(ref(firebaseDb, 'reviews'), reviews);
            console.log('Firebase review save completed');
            return;
        } catch (error) {
            console.warn('Firebase review save failed, saved locally only.', error);
        }
    }
}

async function saveMenuItems(items) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));

    if (isFirebaseReady) {
        try {
            console.log('Saving menu items to Firebase:', items);
            await set(ref(firebaseDb, 'menuItems'), items);
            console.log('Firebase save completed');
            showAdminMessage('Menu updated successfully.');
            return;
        } catch (error) {
            console.warn('Firebase save failed, saved locally only.', error);
        }
    }

    showAdminMessage('Changes saved locally. Refresh the menu page to review them.');
}

function showAdminMessage(text) {
    const message = document.getElementById('admin-message');
    if (!message) return;
    message.textContent = text;
    message.style.display = 'block';
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function isAdminUnlocked() {
    return localStorage.getItem(ADMIN_LOCK_KEY) === 'true';
}

function setAdminUnlocked(value) {
    localStorage.setItem(ADMIN_LOCK_KEY, value ? 'true' : 'false');
}

function showAdminLock() {
    const overlay = document.getElementById('admin-lock-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideAdminLock() {
    const overlay = document.getElementById('admin-lock-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

async function activateAdmin() {
    await renderMenuPageItems();
    await renderHomeMenuPreview();
    await renderReviewsPage();
    await renderAdminItems();
    wireAdminEvents();
}

function setupAdminAuth() {
    const submitButton = document.getElementById('admin-password-submit');
    const passwordInput = document.getElementById('admin-password-input');
    const errorMessage = document.getElementById('admin-password-error');

    if (!submitButton || !passwordInput || !errorMessage) return;

    const unlock = async () => {
        if (passwordInput.value === ADMIN_PASSWORD) {
            setAdminUnlocked(true);
            hideAdminLock();
            errorMessage.textContent = '';
            await activateAdmin();
        } else {
            errorMessage.textContent = 'Incorrect password. Please try again.';
        }
    };

    submitButton.addEventListener('click', unlock);
    passwordInput.addEventListener('keydown', async event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            await unlock();
        }
    });

    if (isAdminUnlocked()) {
        hideAdminLock();
    } else {
        showAdminLock();
    }
}

async function renderMenuPageItems() {
    const wrapper = document.getElementById('menu-items');
    const addonList = document.getElementById('addon-list');
    if (!wrapper || !addonList) return;
    const items = await getStoredMenuItems();
    const normalItems = items.filter(item => item.category !== 'Add-Ons');
    const addonItems = items.filter(item => item.category === 'Add-Ons');
    wrapper.innerHTML = '';
    addonList.innerHTML = '';

    normalItems.forEach(item => {
        wrapper.appendChild(createMenuItemCard(item));
    });

    addonItems.forEach(item => {
        addonList.appendChild(createAddonListItem(item));
    });

    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 250);
        }
    }
}

async function renderHomeMenuPreview() {
    const wrapper = document.getElementById('home-menu-preview');
    if (!wrapper) return;
    const items = await getStoredMenuItems();
    const popularItems = items.filter(item => item.popular);
    const previewItems = popularItems.length > 0 ? popularItems.slice(0, 3) : items.slice(0, 3);
    wrapper.innerHTML = '';
    previewItems.forEach(item => {
        wrapper.appendChild(createHomeMenuCard(item));
    });
}

function createHomeMenuCard(item) {
    const imgSrc = item.image || ADMIN_PLACEHOLDER_IMAGE;
    const anchor = document.createElement('a');
    anchor.href = `menu.html#${item.id}`;
    anchor.className = 'box';
    anchor.innerHTML = `
        <div class="item-badges">
            ${item.popular ? '<span class="badge badge-popular">Popular</span>' : ''}
            ${item.bestSeller ? '<span class="badge badge-bestseller">Best seller</span>' : ''}
        </div>
        <img src="${imgSrc}" alt="${item.name}">
        <div class="content">
            <h3>${item.name}</h3>
            <p class="item-category">${item.category}</p>
            <p>${item.description}</p>
            <span>₱${item.price}</span>
        </div>
    `;
    return anchor;
}

function createMenuItemCard(item, isAddon = false) {
    const imgSrc = item.image || ADMIN_PLACEHOLDER_IMAGE;
    const anchor = document.createElement('a');
    anchor.href = '#';
    anchor.id = item.id;
    anchor.className = 'box';
    anchor.innerHTML = `
        <div class="item-badges">
            ${item.popular ? '<span class="badge badge-popular">Popular</span>' : ''}
            ${item.bestSeller ? '<span class="badge badge-bestseller">Best seller</span>' : ''}
        </div>
        <img src="${imgSrc}" alt="${item.name}">
        <div class="content">
            <h3>${item.name}</h3>
            ${isAddon ? '<p class="item-category">Add-On</p>' : `<p class="item-category">${item.category}</p>`}
            <p>${item.description}</p>
            <span>₱${item.price}</span>
        </div>
    `;
    return anchor;
}

function createAddonListItem(item) {
    const row = document.createElement('div');
    row.className = 'addon-list-item';
    row.innerHTML = `
        <div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
        </div>
        <span>₱${item.price}</span>
    `;
    return row;
}

async function renderAdminItems() {
    const menuContainer = document.getElementById('admin-items');
    const addonContainer = document.getElementById('admin-addons');
    const reviewsContainer = document.getElementById('admin-reviews');
    if (!menuContainer || !addonContainer || !reviewsContainer) return;
    const items = await getStoredMenuItems();
    const menuItems = items.filter(item => item.category !== 'Add-Ons');
    const addonItems = items.filter(item => item.category === 'Add-Ons');
    const reviews = await getStoredReviews();

    menuContainer.innerHTML = '';
    addonContainer.innerHTML = '';
    reviewsContainer.innerHTML = '';

    menuItems.forEach((item, index) => {
        const globalIndex = items.indexOf(item);
        menuContainer.appendChild(createAdminCard(item, globalIndex, false));
    });

    addonItems.forEach((item, index) => {
        const globalIndex = items.indexOf(item);
        addonContainer.appendChild(createAdminCard(item, globalIndex, true));
    });

    reviews.forEach((review, index) => {
        reviewsContainer.appendChild(createAdminReviewCard(review, index));
    });
}

function createAdminReviewCard(review, index) {
    const card = document.createElement('div');
    card.className = 'admin-review-card';
    card.dataset.index = index;
    card.innerHTML = `
            <div class="review-image">
                <img class="review-image-preview" src="${review.image || ADMIN_PLACEHOLDER_IMAGE}" alt="${review.name}">
                <div>
                    <label>Reviewer name</label>
                    <input type="text" class="review-name" value="${review.name}">
                    <label>Image URL</label>
                    <input type="text" class="review-image-url" value="${review.image}" placeholder="https://example.com/photo.jpg">
                </div>
            </div>
            <div>
                <label>Review comment</label>
                <textarea class="review-comment">${review.comment}</textarea>
            </div>
            <div class="admin-actions">
                <button type="button" class="btn btn-alt save-review">Save review</button>
                <button type="button" class="btn remove-review">Remove review</button>
            </div>
        `;
    return card;
}

function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
        <i class="fas fa-quote-left quote-icon"></i>
        <img src="${review.image || ADMIN_PLACEHOLDER_IMAGE}" alt="${review.name}" class="review-card-img">
        <p>${review.comment}</p>
        <div class="review-meta"><span>– ${review.name}</span><span class="rating">⭐⭐⭐⭐⭐</span></div>
    `;
    return card;
}

async function renderReviewsPage() {
    const grid = document.getElementById('review-grid');
    if (!grid) return;
    const reviews = await getStoredReviews();
    grid.innerHTML = '';
    reviews.forEach(review => {
        grid.appendChild(createReviewCard(review));
    });
}

function collectAdminReviews() {
    const cards = Array.from(document.querySelectorAll('.admin-review-card'));
    return cards.map(card => {
        const nameInput = card.querySelector('.review-name');
        const commentInput = card.querySelector('.review-comment');
        const imageInput = card.querySelector('.review-image-url');
        return {
            id: slugify(nameInput.value) || `review-${Date.now()}`,
            name: nameInput.value,
            comment: commentInput.value,
            image: imageInput.value || ''
        };
    });
}

function createAdminCard(item, index, isAddon = false) {
    const card = document.createElement('div');
    card.className = 'admin-item';
    card.dataset.index = index;
    card.innerHTML = `
            <div class="admin-image">
                <img class="admin-image-preview" src="${item.image || ADMIN_PLACEHOLDER_IMAGE}" alt="${item.name}">
                <div>
                    <label>Image URL</label>
                    <div class="image-controls">
                        <input type="text" class="image-url" value="${item.image}" placeholder="https://example.com/image.jpg">
                        <button type="button" class="btn btn-alt clear-image">Clear image</button>
                    </div>
                </div>
            </div>
            <div class="admin-meta">
                <div>
                    <label>Menu item name</label>
                    <input type="text" class="item-name" value="${item.name}">
                </div>
                <div>
                    <label>Category</label>
                    <select class="item-category">
                        <option ${item.category === 'Coffee Series' ? 'selected' : ''}>Coffee Series</option>
                        <option ${item.category === 'Non-Coffee Series' ? 'selected' : ''}>Non-Coffee Series</option>
                        <option ${item.category === 'Matcha Series' ? 'selected' : ''}>Matcha Series</option>
                        <option ${item.category === 'Refreshers' ? 'selected' : ''}>Refreshers</option>
                        <option ${item.category === 'Hanari House Specials' ? 'selected' : ''}>Hanari House Specials</option>
                        <option ${item.category === 'Frappe & Smoothie Series' ? 'selected' : ''}>Frappe & Smoothie Series</option>
                        <option ${item.category === 'Milktea Series' ? 'selected' : ''}>Milktea Series</option>
                        <option ${item.category === 'Add-Ons' ? 'selected' : ''}>Add-Ons</option>
                        <option ${item.category === 'Snacks' ? 'selected' : ''}>Snacks</option>
                        <option ${item.category === 'Waffles' ? 'selected' : ''}>Waffles</option>
                        <option ${item.category === 'Pizza' ? 'selected' : ''}>Pizza</option>
                        <option ${item.category === 'Rice Bowls' ? 'selected' : ''}>Rice Bowls</option>
                    </select>
                </div>
                <div>
                    <label>Price (PHP)</label>
                    <input type="text" class="item-price" value="${item.price}">
                </div>
            </div>
            <div class="admin-toggle-grid">
                <label><input type="checkbox" class="item-popular" ${item.popular ? 'checked' : ''}> Popular pick</label>
                <label><input type="checkbox" class="item-bestseller" ${item.bestSeller ? 'checked' : ''}> Best seller</label>
            </div>
            <div>
                <label>Description</label>
                <textarea class="item-description">${item.description}</textarea>
            </div>
            <div class="admin-actions">
                <button type="button" class="btn btn-alt save-item">Save item</button>
                <button type="button" class="btn remove-item">Remove item</button>
            </div>
        `;
    return card;
}

function collectAdminItems() {
    const cards = Array.from(document.querySelectorAll('.admin-item'));
    return cards.map(card => {
        const nameInput = card.querySelector('.item-name');
        const descriptionInput = card.querySelector('.item-description');
        const priceInput = card.querySelector('.item-price');
        const categoryInput = card.querySelector('.item-category');
        const imageInput = card.querySelector('.image-url');
        const index = parseInt(card.dataset.index, 10);
        return {
            id: slugify(nameInput.value) || `item-${index}`,
            category: categoryInput.value,
            name: nameInput.value,
            description: descriptionInput.value,
            price: priceInput.value,
            image: imageInput.value || '',
            popular: !!card.querySelector('.item-popular').checked,
            bestSeller: !!card.querySelector('.item-bestseller').checked
        };
    });
}

function wireAdminEvents() {
    const addButton = document.getElementById('add-item');
    const addAddonButton = document.getElementById('add-addon');
    const saveButton = document.getElementById('save-menu');
    const adminSection = document.getElementById('admin');

    if (addButton) {
        addButton.onclick = async () => {
            const items = await getStoredMenuItems();
            items.unshift({
                id: `new-item-${Date.now()}`,
                category: 'Coffee Series',
                name: 'new item',
                description: 'Enter item description.',
                price: '0.00',
                image: '',
                bestSeller: false,
                popular: false
            });
            await saveMenuItems(items);
            await renderAdminItems();
        };
    }

    if (addAddonButton) {
        addAddonButton.onclick = async () => {
            const items = await getStoredMenuItems();
            items.unshift({
                id: `new-addon-${Date.now()}`,
                category: 'Add-Ons',
                name: 'new add-on',
                description: 'Enter add-on description.',
                price: '0.00',
                image: '',
                bestSeller: false,
                popular: false
            });
            await saveMenuItems(items);
            await renderAdminItems();
        };
    }

    const addReviewButton = document.getElementById('add-review');
    if (addReviewButton) {
        addReviewButton.onclick = async () => {
            const reviews = await getStoredReviews();
            reviews.unshift({
                id: `new-review-${Date.now()}`,
                name: 'New reviewer',
                comment: 'Enter a review comment.',
                image: ''
            });
            await saveReviews(reviews);
            await renderAdminItems();
        };
    }

    if (saveButton) {
        saveButton.onclick = async () => {
            const items = collectAdminItems();
            await saveMenuItems(items);
            const reviews = collectAdminReviews();
            await saveReviews(reviews);
            await renderAdminItems();
        };
    }

    if (adminSection) {
        adminSection.addEventListener('click', async event => {
            if (event.target.closest('.save-item')) {
                const items = collectAdminItems();
                await saveMenuItems(items);
                await renderAdminItems();
            }
            if (event.target.closest('.remove-item')) {
                const card = event.target.closest('.admin-item');
                const index = card ? parseInt(card.dataset.index, 10) : null;
                if (index !== null && !Number.isNaN(index)) {
                    const items = await getStoredMenuItems();
                    items.splice(index, 1);
                    await saveMenuItems(items);
                    await renderAdminItems();
                }
            }
            if (event.target.closest('.clear-image')) {
                const card = event.target.closest('.admin-item');
                if (!card) return;
                const imageInput = card.querySelector('.image-url');
                const preview = card.querySelector('.admin-image-preview');
                if (imageInput) imageInput.value = '';
                if (preview) preview.src = EMPTY_IMAGE_SRC;
            }
            if (event.target.closest('.save-review')) {
                const reviews = collectAdminReviews();
                await saveReviews(reviews);
                await renderAdminItems();
            }
            if (event.target.closest('.remove-review')) {
                const card = event.target.closest('.admin-review-card');
                const index = card ? parseInt(card.dataset.index, 10) : null;
                if (index !== null && !Number.isNaN(index)) {
                    const reviews = await getStoredReviews();
                    reviews.splice(index, 1);
                    await saveReviews(reviews);
                    await renderAdminItems();
                }
            }
            if (event.target.closest('.save-review')) {
                const reviews = collectAdminReviews();
                saveReviews(reviews);
                await renderAdminItems();
            }
            if (event.target.closest('.remove-review')) {
                const card = event.target.closest('.admin-review-card');
                const index = card ? parseInt(card.dataset.index, 10) : null;
                if (index !== null && !Number.isNaN(index)) {
                    const reviews = getStoredReviews();
                    reviews.splice(index, 1);
                    saveReviews(reviews);
                    await renderAdminItems();
                }
            }
        });

        adminSection.addEventListener('input', event => {
            const imageInput = event.target.closest('.image-url');
            if (imageInput) {
                const card = imageInput.closest('.admin-item');
                const preview = card.querySelector('.admin-image-preview');
                preview.src = imageInput.value || EMPTY_IMAGE_SRC;
                return;
            }
            const reviewImageInput = event.target.closest('.review-image-url');
            if (reviewImageInput) {
                const card = reviewImageInput.closest('.admin-review-card');
                const preview = card.querySelector('.review-image-preview');
                preview.src = reviewImageInput.value || EMPTY_IMAGE_SRC;
            }
        });
    }
}

async function initAdmin() {
    await initFirebase();
    await renderMenuPageItems();
    await renderHomeMenuPreview();
    await renderReviewsPage();
    await renderAdminItems();
    wireAdminEvents();
}

window.addEventListener('DOMContentLoaded', () => {
    setupAdminAuth();
});

window.addEventListener('storage', async event => {
    if (event.key === 'hanariReviews' && document.getElementById('review-grid')) {
        await renderReviewsPage();
    }
    if (event.key === MENU_STORAGE_KEY) {
        if (document.getElementById('menu-items')) {
            await renderMenuPageItems();
        }
        if (document.getElementById('home-menu-preview')) {
            await renderHomeMenuPreview();
        }
    }
});

if (document.readyState !== 'loading') {
    initAdmin();
} else {
    document.addEventListener('DOMContentLoaded', initAdmin);
}
