
// بيانات المنتجات (Data Structure)
const products = [
    { id: 1, name: "بيبار", price: 6.25, image: "assets/images/8.png", category: "خضروات" },
    { id: 2, name: "سلطه خضروات", price: 15.0, image: "assets/images/9.jpg", category: "فواكه" },
    { id: 3, name: "سلطه", price: 3.75, image: "assets/images/10.png", category: "خضروات" },
    { id: 4, name: "فواكة منوعة", price: 3.75, image: "assets/images/11.jpg", category: "خضروات" },
    { id: 5, name: "بصل أحمر", price: 8.5, image: "assets/images/6.png", category: "خضروات" },
    { id: 6, name: "بطيخ", price: 8.5, image: "assets/images/1.png", category: "خضروات" },
    { id: 7, name: "رمان", price: 5.0, image: "assets/images/2.png", category: "خضروات" },
    { id: 8, name: "فراولة طازج", price: 6.25, image: "assets/images/3.png", category: "خضروات" },
    { id: 9, name: "ذرة", price: 15.0, image: "assets/images/4.jpg", category: "فواكه" },
    { id: 10, name: "برتقال", price: 3.75, image: "assets/images/5.png", category: "خضروات" },
    { id: 11, name: "بصل أحمر", price: 8.5, image: "assets/images/6.png", category: "خضروات" },
    { id: 12, name: "سلة فواكة", price: 5.0, image: "assets/images/7.jpg", category: "خضروات" },
    { id: 13, name: "بيبار", price: 6.25, image: "assets/images/8.png", category: "خضروات" },
    { id: 14, name: "سلطه خضروات", price: 15.0, image: "assets/images/9.jpg", category: "فواكه" },
    { id: 15, name: "سلطه", price: 3.75, image: "assets/images/10.png", category: "خضروات" },
    { id: 15, name: "فواكة منوعة", price: 3.75, image: "assets/images/11.jpg", category: "خضروات" },
];

// حالة سلة التسوق (State Management)
let cart = [];
let currentSelectedProduct = null;
let filteredProducts = [...products];
let currentFilter = { category: 'all', priceRange: [0, 100] };

// عناصر الواجهة (DOM Elements)
const productGrid = document.getElementById('productGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartCount = document.getElementById('cartCount');
const specModal = document.getElementById('specModal');
const confirmAddBtn = document.getElementById('confirmAdd');
const cancelAddBtn = document.getElementById('cancelAdd');
const productWeightInput = document.getElementById('productWeight');
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

// --- نظام التنبيهات (Toast Notification System) ---

/**
 * إنشاء نظام تنبيهات Toast مخصص
 */
function createToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 5000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    return container;
}

/**
 * عرض رسالة Toast
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = createToastContainer();
    const toast = document.createElement('div');
    
    const bgColor = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196f3'
    }[type] || '#2196f3';

    toast.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        font-weight: 600;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// إضافة أنماط الحركة (Animations)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    @keyframes cartBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
    }
`;
document.head.appendChild(style);

// --- وظائف المساعدة (Utility Functions) ---

/**
 * دالة Throttling لتحسين أداء التمرير
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * دالة Debouncing لتحسين أداء الإدخال
 */
function debounce(func, delay) {
    let timeoutId;
    return function() {
        const args = arguments;
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

/**
 * خوارزمية البحث السريع (Fast Search Algorithm - Binary Search Compatible)
 */
function fastSearchProducts(query) {
    if (!query) return filteredProducts;
    
    const lowerQuery = query.toLowerCase().trim();
    
    // استخدام filter مع indexOf للبحث السريع
    return filteredProducts.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) || 
        product.category.toLowerCase().includes(lowerQuery)
    );
}

/**
 * فلترة المنتجات حسب الفئة والسعر (Optimized Filtering)
 */
function filterProducts(category, minPrice, maxPrice) {
    currentFilter = { category, priceRange: [minPrice, maxPrice] };
    
    // استخدام filter بكفاءة عالية
    filteredProducts = products.filter(product => {
        const categoryMatch = category === 'all' || product.category === category;
        const priceMatch = product.price >= minPrice && product.price <= maxPrice;
        return categoryMatch && priceMatch;
    });
    
    renderProducts();
}

/**
 * حفظ السلة في Local Storage
 */
function saveCartToLocalStorage() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
        console.warn('فشل حفظ السلة في Local Storage:', e);
    }
}

/**
 * تحميل السلة من Local Storage
 */
function loadCartFromLocalStorage() {
    try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartUI();
        }
    } catch (e) {
        console.warn('فشل تحميل السلة من Local Storage:', e);
    }
}

// --- إدارة سلة التسوق (Cart Management) ---

/**
 * تحديث عرض السلة في الواجهة مع رسائل محسّنة
 */
function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        // رسالة محسّنة للسلة الفارغة
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-container">
                <div class="empty-cart-icon">
                    <i class="fa-solid fa-shopping-basket"></i>
                </div>
                <p class="empty-cart-msg">سلتك فارغة حالياً</p>
                <p class="empty-cart-subtitle">ابدأ بإضافة منتجات طازجة من متجرنا</p>
                <a href="#products" class="btn btn-small">تصفح المنتجات</a>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            count += 1;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.style.animation = 'slideIn 0.3s ease-out';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} ر.س / كجم</p>
                    <div class="cart-controls">
                        <button onclick="updateQuantity(${item.id}, -0.5)" class="qty-btn">−</button>
                        <span class="qty-display">${item.quantity} كجم</span>
                        <button onclick="updateQuantity(${item.id}, 0.5)" class="qty-btn">+</button>
                        <button onclick="removeFromCart(${item.id})" class="remove-btn" title="حذف"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <div class="item-total">${itemTotal.toFixed(2)} ر.س</div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    cartTotalPrice.innerText = total.toFixed(2);
    cartCount.innerText = count;
    
    // حفظ السلة في Local Storage
    saveCartToLocalStorage();
}

/**
 * إضافة منتج للسلة بعد التحقق من المواصفات
 */
function addToCart(productId) {
    currentSelectedProduct = products.find(p => p.id === productId);
    specModal.classList.add('active');
    productWeightInput.value = '';
    productWeightInput.focus();
}

/**
 * تأكيد الإضافة للسلة مع التحقق من البيانات (Validation)
 */
confirmAddBtn.addEventListener('click', () => {
    const weight = parseFloat(productWeightInput.value);
    
    // التحقق من صحة المدخلات (Security & Validation)
    if (isNaN(weight) || weight <= 0) {
        showToast("يرجى إدخال وزن صحيح (أرقام فقط وأكبر من صفر)", 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === currentSelectedProduct.id);
    if (existingItem) {
        existingItem.quantity += weight;
    } else {
        cart.push({ ...currentSelectedProduct, quantity: weight });
    }

    specModal.classList.remove('active');
    updateCartUI();
    
    // تأثير بصري على أيقونة السلة
    cartToggle.style.animation = 'cartBounce 0.5s ease-out';
    setTimeout(() => {
        cartToggle.style.animation = '';
    }, 500);
    
    // عرض رسالة نجاح
    showToast(`تم إضافة "${currentSelectedProduct.name}" إلى السلة بنجاح!`, 'success');
    
    // إظهار السلة تلقائياً عند الإضافة
    cartSidebar.classList.add('active');
});

/**
 * تحديث الكمية داخل السلة
 */
window.updateQuantity = (productId, change) => {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
        }
    }
};

/**
 * حذف منتج من السلة
 */
window.removeFromCart = (productId) => {
    const product = cart.find(item => item.id === productId);
    cart = cart.filter(item => item.id !== productId);
    if (product) {
        showToast(`تم حذف "${product.name}" من السلة`, 'warning');
    }
    updateCartUI();
};

// --- التحكم في الواجهة (UI Interactions) ---

/**
 * توليد بطاقات المنتجات في الصفحة
 */
function renderProducts(productsToRender = filteredProducts) {
    if (productsToRender.length === 0) {
        productGrid.innerHTML = `
            <div class="no-products-message" style="grid-column: 1/-1; text-align: center; padding: 50px 20px;">
                <i class="fa-solid fa-inbox" style="font-size: 3rem; color: var(--secondary); margin-bottom: 20px;"></i>
                <h3 style="color: var(--primary); margin-bottom: 10px;">لا توجد منتجات</h3>
                <p style="color: var(--text-light);">حاول تغيير معايير البحث أو الفلترة</p>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card reveal">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <span class="category-badge">${product.category}</span>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <span class="product-price">${product.price} ر.س / كجم</span>
                <button class="btn btn-block" onclick="addToCart(${product.id})">أضف للسلة</button>
            </div>
        </div>
    `).join('');
}

/**
 * التحكم في شريط التنقل وزر العودة للأعلى عند التمرير
 */
const handleScroll = throttle(() => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    // تأثير ظهور العناصر
    document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            el.classList.add('visible');
        }
    });
}, 100);

// --- إدارة الدفع (Checkout Management) ---

const checkoutPage = document.getElementById('checkoutPage');
const checkoutBtn = document.getElementById('checkoutBtn');
const closeCheckout = document.getElementById('closeCheckout');
const paymentForm = document.getElementById('paymentForm');

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast("سلة التسوق فارغة! يرجى إضافة منتجات قبل إتمام الشراء.", 'error', 4000);
        return;
    }
    renderOrderSummary();
    checkoutPage.classList.add('active');
    cartSidebar.classList.remove('active');
});

closeCheckout.addEventListener('click', () => {
    checkoutPage.classList.remove('active');
});

function renderOrderSummary() {
    const summaryContainer = document.getElementById('orderSummaryItems');
    let total = 0;
    summaryContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `<div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span>${item.name} (x${item.quantity})</span>
            <span>${itemTotal.toFixed(2)} ر.س</span>
        </div>`;
    }).join('');
    document.getElementById('summaryTotal').innerText = total.toFixed(2);
}

/**
 * التحقق من نموذج الدفع (Payment Validation)
 */
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة (Security & Validation)
    const cardNumber = document.getElementById('card_number').value;
    const cardExpiry = document.getElementById('card_expiry').value;
    const cardCvv = document.getElementById('card_cvv').value;

    if (!/^\d{16}$/.test(cardNumber)) {
        showToast("رقم البطاقة يجب أن يتكون من 16 رقماً", 'error');
        return;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showToast("تنسيق تاريخ الانتهاء غير صحيح (MM/YY)", 'error');
        return;
    }

    if (!/^\d{3}$/.test(cardCvv)) {
        showToast("رمز CVV يجب أن يتكون من 3 أرقام", 'error');
        return;
    }

    showToast("تمت عملية الدفع بنجاح! شكراً لتسوقكم من حصاد الطبيعة.", 'success', 5000);
    cart = [];
    updateCartUI();
    checkoutPage.classList.remove('active');
    localStorage.removeItem('cart');
});

// --- البحث والفلترة (Search & Filter) ---

/**
 * إعداد عناصر البحث والفلترة
 */
function setupSearchAndFilter() {
    // البحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            const results = fastSearchProducts(query);
            renderProducts(results);
        }, 300));
    }

    // فلترة الفئة
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const minPrice = parseFloat(document.getElementById('priceMin')?.value || 0);
            const maxPrice = parseFloat(document.getElementById('priceMax')?.value || 100);
            filterProducts(e.target.value, minPrice, maxPrice);
        });
    }

    // فلترة السعر
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin && priceMax) {
        const updatePriceFilter = debounce(() => {
            const category = document.getElementById('categoryFilter')?.value || 'all';
            const minPrice = parseFloat(priceMin.value || 0);
            const maxPrice = parseFloat(priceMax.value || 100);
            filterProducts(category, minPrice, maxPrice);
        }, 300);

        priceMin.addEventListener('input', updatePriceFilter);
        priceMax.addEventListener('input', updatePriceFilter);
    }
}

// --- المستمعات العامة (Event Listeners) ---

cartToggle.addEventListener('click', () => cartSidebar.classList.add('active'));
closeCart.addEventListener('click', () => cartSidebar.classList.remove('active'));
cancelAddBtn.addEventListener('click', () => specModal.classList.remove('active'));
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// إغلاق القوائم عند النقر خارجها
window.addEventListener('click', (e) => {
    if (e.target === specModal) specModal.classList.remove('active');
});

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تحميل السلة المحفوظة
    loadCartFromLocalStorage();
    
    renderProducts();
    setupSearchAndFilter();
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // للتحقق الأولي
    
    // تحسين أداء الصور (Lazy Loading)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    observer.unobserve(img);
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    }
});

// معالجة نموذج التواصل
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast("تم إرسال رسالتك بنجاح. سنقوم بالرد عليك عبر البريد الإلكتروني قريباً.", 'success');
    e.target.reset();
});

// منع حقن النصوص (XSS Protection Simple)
function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
