import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getDatabase, ref, get, set, child } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

const MENU_STORAGE_KEY = 'hanariMenuData';
const LATEST_POSTS_STORAGE_KEY = 'hanariLatestPosts';

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

function parseCsv(text) {
    const rows = [];
    let current = '';
    let inQuotes = false;
    let row = [];

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            row.push(current);
            current = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotes) {
            if (current !== '' || row.length > 0) {
                row.push(current);
                rows.push(row);
                row = [];
                current = '';
            }
            if (char === '\r' && next === '\n') {
                i += 1;
            }
            continue;
        }

        current += char;
    }

    if (current !== '' || row.length > 0) {
        row.push(current);
        rows.push(row);
    }

    return rows;
}

async function loadMenuItemsFromCsv() {
    try {
        const response = await fetch('menu.csv');
        if (!response.ok) return [];
        const text = await response.text();
        const rows = parseCsv(text);
        if (rows.length < 2) return [];

        const headers = rows[0].map(header => header.trim());
        return rows.slice(1).map((values, index) => {
            const record = {};
            headers.forEach((header, idx) => {
                record[header] = (values[idx] || '').trim();
            });
            const rawHot = record.Hot || '';
            const rawIced = record.Iced || '';
            const rawPrice = record.Price || '';
            const categoryKey = (record.Category || '').trim().toLowerCase();
            const icedOnlyCategories = new Set([
                'refreshers',
                'hanari house specials',
                'frappe & smoothie series',
                'milktea series'
            ]);

            let hot = rawHot;
            let iced = rawIced;
            let price = rawPrice;

            if (!iced && rawPrice && icedOnlyCategories.has(categoryKey)) {
                iced = rawPrice;
                price = '';
            }

            if (icedOnlyCategories.has(categoryKey) && rawIced && /^\d+(?:\.\d+)?$/.test(rawIced)) {
                iced = rawIced;
                price = '';
            } else if (!price && !hot && rawIced && /^\d+(?:\.\d+)?$/.test(rawIced)) {
                price = rawIced;
            }

            return {
                id: slugify(record.Item || record.Name || `item-${index}`),
                category: record.Category || 'Uncategorized',
                name: record.Item || record.Name || 'Unnamed item',
                image: record.Image || '',
                price: price,
                description: record.Notes || record.Description || '',
                hot: hot,
                iced: iced,
                popular: String(record.Popular || '').toLowerCase() === 'true',
                bestSeller: String(record.BestSeller || '').toLowerCase() === 'true'
            };
        });
    } catch (error) {
        console.warn('Could not load menu.csv:', error);
        return [];
    }
}

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
    if (!stored) {
        const csvItems = await loadMenuItemsFromCsv();
        if (csvItems.length > 0) {
            return csvItems;
        }
        return defaultMenuItems.slice();
    }
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        const csvItems = await loadMenuItemsFromCsv();
        return csvItems.length > 0 ? csvItems : defaultMenuItems.slice();
    } catch (e) {
        const csvItems = await loadMenuItemsFromCsv();
        return csvItems.length > 0 ? csvItems : defaultMenuItems.slice();
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

async function getStoredLatestPosts() {
    await initFirebase();

    if (isFirebaseReady) {
        try {
            const snapshot = await get(child(ref(firebaseDb), 'latestPosts'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                return Array.isArray(data) ? data : Object.values(data);
            }
        } catch (error) {
            console.warn('Firebase latest posts read failed, using localStorage fallback.', error);
        }
    }

    const stored = localStorage.getItem(LATEST_POSTS_STORAGE_KEY);
    if (!stored) {
        return [];
    }

    try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

async function saveLatestPosts(posts) {
    localStorage.setItem(LATEST_POSTS_STORAGE_KEY, JSON.stringify(posts));

    if (document.getElementById('latest-posts-list')) {
        await renderLatestPostsPage();
    }

    if (isFirebaseReady) {
        try {
            await set(ref(firebaseDb, 'latestPosts'), posts);
            console.log('Firebase latest posts save completed');
            return;
        } catch (error) {
            console.warn('Firebase latest posts save failed, saved locally only.', error);
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
    await renderLatestPostsPage();
    await renderReviewsPage();
    await renderAdminItems();
    await renderAdminPosts();
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

    const closeButton = document.getElementById('admin-lock-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            setAdminUnlocked(false);
            window.location.href = 'index.html';
        });
    }

    window.addEventListener('pagehide', () => {
        setAdminUnlocked(false);
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

async function renderLatestPostsPage() {
    const wrapper = document.getElementById('latest-posts-list');
    if (!wrapper) return;
    const posts = await getStoredLatestPosts();
    const visiblePosts = posts.slice(0, 3);
    wrapper.innerHTML = '';

    if (visiblePosts.length === 0) {
        wrapper.innerHTML = '<p class="section-copy">No posts have been added yet.</p>';
        return;
    }

    visiblePosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'latest-post-card';

        const title = document.createElement('h3');
        title.textContent = post.title || 'Untitled post';
        postCard.appendChild(title);

        if (post.caption) {
            const caption = document.createElement('p');
            caption.textContent = post.caption;
            postCard.appendChild(caption);
        }

        const embedContainer = document.createElement('div');
        embedContainer.className = 'post-embed';
        embedContainer.innerHTML = post.embedHtml || '';
        postCard.appendChild(embedContainer);

        wrapper.appendChild(postCard);
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
            ${item.hot || item.iced || item.price ? `<div class="item-prices">
                ${item.hot ? `<span>Hot: ₱${item.hot}</span>` : ''}
                ${item.iced ? `<span>Iced: ₱${item.iced}</span>` : ''}
                ${item.price ? `<span>₱${item.price}</span>` : ''}
            </div>` : ''}
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
            ${item.hot || item.iced || item.price ? `<div class="item-prices">
                ${item.hot ? `<span>Hot: ₱${item.hot}</span>` : ''}
                ${item.iced ? `<span>Iced: ₱${item.iced}</span>` : ''}
                ${item.price ? `<span>₱${item.price}</span>` : ''}
            </div>` : ''}
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
    const postsContainer = document.getElementById('admin-posts');
    const reviewsContainer = document.getElementById('admin-reviews');
    if (!menuContainer || !addonContainer || !postsContainer || !reviewsContainer) return;
    const items = await getStoredMenuItems();
    const menuItems = items.filter(item => item.category !== 'Add-Ons');
    const addonItems = items.filter(item => item.category === 'Add-Ons');
    const posts = await getStoredLatestPosts();
    const reviews = await getStoredReviews();

    menuContainer.innerHTML = '';
    addonContainer.innerHTML = '';
    postsContainer.innerHTML = '';
    reviewsContainer.innerHTML = '';

    menuItems.forEach((item, index) => {
        const globalIndex = items.indexOf(item);
        menuContainer.appendChild(createAdminCard(item, globalIndex, false));
    });

    addonItems.forEach((item, index) => {
        const globalIndex = items.indexOf(item);
        addonContainer.appendChild(createAdminCard(item, globalIndex, true));
    });

    posts.forEach((post, index) => {
        postsContainer.appendChild(createAdminPostCard(post, index));
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

function createAdminPostCard(post, index) {
    const card = document.createElement('div');
    card.className = 'admin-post-card';
    card.dataset.index = index;
    card.innerHTML = `
            <div>
                <label>Post title</label>
                <input type="text" class="post-title" value="${post.title || ''}" placeholder="Post title">
            </div>
            <div>
                <label>Embed code</label>
                <textarea class="post-embed-code" rows="6" placeholder="Paste iframe embed code here">${post.embedHtml || ''}</textarea>
            </div>
            <div class="post-preview-label">Live preview</div>
            <div class="post-live-preview">${post.embedHtml || ''}</div>
            <div class="admin-actions">
                <button type="button" class="btn btn-alt save-post">Save post</button>
                <button type="button" class="btn remove-post">Remove post</button>
            </div>
        `;
    return card;
}

function collectAdminPosts() {
    const cards = Array.from(document.querySelectorAll('.admin-post-card'));
    return cards.map((card, index) => {
        const titleInput = card.querySelector('.post-title');
        const embedInput = card.querySelector('.post-embed-code');
        return {
            id: slugify(titleInput.value) || `post-${index}`,
            title: titleInput.value,
            embedHtml: embedInput.value || ''
        };
    });
}

async function renderAdminPosts() {
    const postsContainer = document.getElementById('admin-posts');
    if (!postsContainer) return;
    const posts = await getStoredLatestPosts();
    postsContainer.innerHTML = '';

    posts.forEach((post, index) => {
        postsContainer.appendChild(createAdminPostCard(post, index));
    });
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
                    <input type="text" class="item-price" value="${item.price || ''}" placeholder="e.g. 150">
                </div>
                <div>
                    <label>Hot price</label>
                    <input type="text" class="item-hot" value="${item.hot || ''}" placeholder="e.g. 120">
                </div>
                <div>
                    <label>Iced price</label>
                    <input type="text" class="item-iced" value="${item.iced || ''}" placeholder="e.g. 130">
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
        const hotInput = card.querySelector('.item-hot');
        const icedInput = card.querySelector('.item-iced');
        const index = parseInt(card.dataset.index, 10);
        return {
            id: slugify(nameInput.value) || `item-${index}`,
            category: categoryInput.value,
            name: nameInput.value,
            description: descriptionInput.value,
            price: priceInput.value,
            hot: hotInput ? hotInput.value : '',
            iced: icedInput ? icedInput.value : '',
            image: imageInput.value || '',
            popular: !!card.querySelector('.item-popular').checked,
            bestSeller: !!card.querySelector('.item-bestseller').checked
        };
    });
}

function wireAdminEvents() {
    const addButton = document.getElementById('add-item');
    const addAddonButton = document.getElementById('add-addon');
    const importCsvButton = document.getElementById('import-csv');
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

    if (importCsvButton) {
        importCsvButton.onclick = async () => {
            const confirmImport = window.confirm('This will replace the current admin menu with items from menu.csv. Continue?');
            if (!confirmImport) return;

            const csvItems = await loadMenuItemsFromCsv();
            if (csvItems.length > 0) {
                await saveMenuItems(csvItems);
                await renderAdminItems();
                showAdminMessage('menu.csv imported successfully.');
            } else {
                showAdminMessage('No items found in menu.csv.');
            }
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

    const addPostButton = document.getElementById('add-post');
    if (addPostButton) {
        addPostButton.onclick = async () => {
            const posts = await getStoredLatestPosts();
            posts.unshift({
                id: `new-post-${Date.now()}`,
                title: 'New post',
                caption: 'Enter post caption.',
                embedHtml: ''
            });
            await saveLatestPosts(posts);
            await renderAdminPosts();
        };
    }

    if (saveButton) {
        saveButton.onclick = async () => {
            const items = collectAdminItems();
            await saveMenuItems(items);
            const reviews = collectAdminReviews();
            await saveReviews(reviews);
            const posts = collectAdminPosts();
            await saveLatestPosts(posts);
            await renderAdminItems();
            await renderAdminPosts();
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
            if (event.target.closest('.save-post')) {
                const posts = collectAdminPosts();
                await saveLatestPosts(posts);
                await renderAdminPosts();
            }
            if (event.target.closest('.remove-post')) {
                const card = event.target.closest('.admin-post-card');
                const index = card ? parseInt(card.dataset.index, 10) : null;
                if (index !== null && !Number.isNaN(index)) {
                    const posts = await getStoredLatestPosts();
                    posts.splice(index, 1);
                    await saveLatestPosts(posts);
                    await renderAdminPosts();
                }
            }
        });

        function normalizeImageUrl(url) {
            const trimmed = url.trim();
            if (!trimmed) return trimmed;

            try {
                const parsed = new URL(trimmed);
                const hostname = parsed.hostname.toLowerCase();
                const pathname = parsed.pathname.replace(/\/$/, '');
                const hash = parsed.hash.replace(/^#/, '');

                if (hostname.endsWith('imgur.com')) {
                    // Already direct Imgur image URL.
                    if (hostname === 'i.imgur.com') {
                        return trimmed;
                    }

                    // If there's a fragment ID, use it as the image id.
                    if (hash) {
                        return `https://i.imgur.com/${hash}.jpg`;
                    }

                    // If the path includes an image id and extension, use it directly.
                    const pathMatch = pathname.match(/\/([a-zA-Z0-9]+)(\.[a-zA-Z]{3,4})?$/);
                    if (pathMatch) {
                        const id = pathMatch[1];
                        const ext = pathMatch[2] || '.jpg';
                        return `https://i.imgur.com/${id}${ext}`;
                    }
                }
            } catch (e) {
                // ignore invalid URLs
            }

            return trimmed;
        }

        function updatePreviewImage(inputElem, previewElem) {
            const normalizedUrl = normalizeImageUrl(inputElem.value);
            if (!normalizedUrl) {
                previewElem.src = EMPTY_IMAGE_SRC;
                return;
            }

            previewElem.src = normalizedUrl;
            if (normalizedUrl !== inputElem.value.trim()) {
                inputElem.value = normalizedUrl;
            }
            previewElem.onerror = () => {
                previewElem.src = EMPTY_IMAGE_SRC;
            };
        }

        adminSection.addEventListener('input', event => {
            const imageInput = event.target.closest('.image-url');
            if (imageInput) {
                const card = imageInput.closest('.admin-item');
                const preview = card.querySelector('.admin-image-preview');
                updatePreviewImage(imageInput, preview);
                return;
            }
            const reviewImageInput = event.target.closest('.review-image-url');
            if (reviewImageInput) {
                const card = reviewImageInput.closest('.admin-review-card');
                const preview = card.querySelector('.review-image-preview');
                updatePreviewImage(reviewImageInput, preview);
                return;
            }
            const postEmbedInput = event.target.closest('.post-embed-code');
            if (postEmbedInput) {
                const card = postEmbedInput.closest('.admin-post-card');
                const preview = card.querySelector('.post-live-preview');
                if (preview) {
                    preview.innerHTML = postEmbedInput.value || '';
                }
            }
        });

        adminSection.addEventListener('paste', event => {
            const imageInput = event.target.closest('.image-url');
            if (imageInput) {
                setTimeout(() => {
                    const card = imageInput.closest('.admin-item');
                    const preview = card.querySelector('.admin-image-preview');
                    updatePreviewImage(imageInput, preview);
                }, 50);
            }
            const reviewImageInput = event.target.closest('.review-image-url');
            if (reviewImageInput) {
                setTimeout(() => {
                    const card = reviewImageInput.closest('.admin-review-card');
                    const preview = card.querySelector('.review-image-preview');
                    updatePreviewImage(reviewImageInput, preview);
                }, 50);
            }
        });
    }
}

async function initAdmin() {
    await initFirebase();
    await renderMenuPageItems();
    await renderHomeMenuPreview();
    await renderLatestPostsPage();
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
    if (event.key === LATEST_POSTS_STORAGE_KEY && document.getElementById('latest-posts-list')) {
        await renderLatestPostsPage();
    }
});

if (document.readyState !== 'loading') {
    initAdmin();
} else {
    document.addEventListener('DOMContentLoaded', initAdmin);
}
