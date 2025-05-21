let products = [];
let currentBrand = 'all';
let orderBasket = new Map(); // Sipariş sepeti

// Ürünleri yükle
fetch('assets/js/products.json')
    .then(response => response.json())
    .then(data => {
        products = data;
        setupBrandFilter();
        displayProducts(products);
        setupOrderButton();
    })
    .catch(error => console.error('Ürünler yüklenirken hata oluştu:', error));

// Marka filtresi oluştur
function setupBrandFilter() {
    const brands = ['Tümü', ...new Set(products.map(p => p.marka))].filter(Boolean);
    const filterContainer = document.getElementById('brandFilter');
    
    filterContainer.innerHTML = brands.map(brand => `
        <button class="btn ${brand === 'Tümü' ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2" 
                onclick="filterByBrand('${brand === 'Tümü' ? 'all' : brand}')">
            ${brand}
        </button>
    `).join('');
}

// Markaya göre filtrele
function filterByBrand(brand) {
    currentBrand = brand;
    const buttons = document.querySelectorAll('#brandFilter button');
    buttons.forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
        if (btn.textContent.trim() === (brand === 'all' ? 'Tümü' : brand)) {
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-primary');
        }
    });
    
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const benefitSearchTerm = document.getElementById('benefitSearchInput').value.toLowerCase();
    filterProducts(searchTerm, benefitSearchTerm);
}

// Sipariş butonunu oluştur
function setupOrderButton() {
    let cartButton = document.createElement('div');
    cartButton.className = 'cart-button d-none';
    cartButton.innerHTML = `
        <button class="btn btn-primary btn-lg" type="button" data-bs-toggle="offcanvas" data-bs-target="#cartOffcanvas">
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count badge bg-light text-primary ms-2">0</span>
        </button>
    `;
    document.body.appendChild(cartButton);

    // Sepet offcanvas'ını oluştur
    let cartOffcanvas = document.createElement('div');
    cartOffcanvas.className = 'offcanvas offcanvas-end';
    cartOffcanvas.id = 'cartOffcanvas';
    cartOffcanvas.setAttribute('tabindex', '-1');
    cartOffcanvas.innerHTML = `
        <div class="offcanvas-header">
            <h5 class="offcanvas-title">Sepetim</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div id="cartContent">
                <div class="text-center p-3">Sepetiniz boş</div>
            </div>
        </div>
    `;
    document.body.appendChild(cartOffcanvas);
}

// Sepeti güncelle
function updateOrderBasket(productCode, quantity) {
    const product = products.find(p => p.kod === productCode);
    if (!product) return;

    if (quantity > 0) {
        orderBasket.set(productCode, {
            product: product,
            quantity: quantity
        });
    } else {
        orderBasket.delete(productCode);
    }

    // Sepet butonunu güncelle
    updateCartButton();
    // Sepet içeriğini güncelle
    updateCartContent();
}

// Sepet butonunu güncelle
function updateCartButton() {
    const cartButton = document.querySelector('.cart-button');
    const cartCount = orderBasket.size;
    const cartCountBadge = cartButton.querySelector('.cart-count');
    
    if (cartCount > 0) {
        cartButton.classList.remove('d-none');
        cartCountBadge.textContent = cartCount;
    } else {
        cartButton.classList.add('d-none');
    }
}

// Sepet içeriğini güncelle
function updateCartContent() {
    const cartContent = document.getElementById('cartContent');
    
    if (orderBasket.size === 0) {
        cartContent.innerHTML = '<div class="text-center p-3">Sepetiniz boş</div>';
        return;
    }

    let content = '<div class="cart-items">';
    orderBasket.forEach((order, productCode) => {
        content += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h6>${order.product.ad}</h6>
                    <p class="mb-1">
                        <small>${order.quantity} ${order.product.birim}</small>
                    </p>
                </div>
                <div class="cart-item-actions">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary btn-sm" 
                                onclick="updateCartItemQuantity('${productCode}', 'decrease')">-</button>
                        <input type="number" class="form-control form-control-sm text-center" 
                               value="${order.quantity}" min="0"
                               onchange="updateCartItemQuantity('${productCode}', 'set', this.value)">
                        <button class="btn btn-outline-secondary btn-sm"
                                onclick="updateCartItemQuantity('${productCode}', 'increase')">+</button>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" 
                            onclick="removeFromCart('${productCode}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    content += `
        <div class="cart-actions mt-3">
            <button class="btn btn-success w-100" onclick="sendCollectedOrders()">
                <i class="fab fa-whatsapp me-2"></i>Siparişi Onayla
            </button>
        </div>
    </div>`;

    cartContent.innerHTML = content;
}

// Sepetteki ürün miktarını güncelle
function updateCartItemQuantity(productCode, action, value = null) {
    const order = orderBasket.get(productCode);
    if (!order) return;

    let newQuantity = order.quantity;
    
    if (action === 'increase') {
        newQuantity++;
    } else if (action === 'decrease') {
        newQuantity = Math.max(0, newQuantity - 1);
    } else if (action === 'set' && value !== null) {
        newQuantity = parseInt(value) || 0;
    }

    if (newQuantity === 0) {
        removeFromCart(productCode);
    } else {
        updateOrderBasket(productCode, newQuantity);
    }
}

// Sepetten ürün kaldır
function removeFromCart(productCode) {
    orderBasket.delete(productCode);
    updateCartButton();
    updateCartContent();
    
    // Ana sayfadaki miktar inputunu sıfırla
    const mainInput = document.getElementById(`quantity-${productCode}`);
    if (mainInput) {
        mainInput.value = "0";
    }
}

// Tüm siparişleri gönder
function sendCollectedOrders() {
    if (orderBasket.size === 0) return;

    let message = 'Merhaba,\n\nSipariş vermek istediğim ürünler:\n\n';
    orderBasket.forEach((order, productCode) => {
        message += `- ${order.product.ad} (Ürün Kodu: ${productCode})\n`;
        message += `  Miktar: ${order.quantity} ${order.product.birim}\n\n`;
    });

    window.open(`https://wa.me/905393082719?text=${encodeURIComponent(message)}`, '_blank');
    
    // Sepeti temizle
    orderBasket.clear();
    document.querySelector('.cart-button').classList.add('d-none');
    
    // Tüm quantity inputları sıfırla
    document.querySelectorAll('input[id^="quantity-"]').forEach(input => {
        input.value = "0";
    });
}

// Fiyat formatla
function formatPrice(price) {
    return Number(price).toFixed(2).replace(/\./g, ',');
}

// Ürünleri görüntüle
function displayProducts(productsToShow) {
    const container = document.getElementById('productContainer');
    container.innerHTML = '';

    // Ürünleri markalara göre grupla
    const productsByBrand = {};
    productsToShow.forEach(product => {
        const brand = product.marka || 'Diğer';
        if (!productsByBrand[brand]) {
            productsByBrand[brand] = [];
        }
        productsByBrand[brand].push(product);
    });

    // Her marka için ürünleri göster
    Object.keys(productsByBrand).sort().forEach(brand => {
        // Marka başlığı ekle
        const brandHeader = document.createElement('div');
        brandHeader.className = 'col-12 brand-section mb-4';
        brandHeader.innerHTML = `
            <h3 class="brand-header">
                ${brand}
                <small class="text-muted">(${productsByBrand[brand].length} ürün)</small>
            </h3>
            <hr class="brand-divider">
        `;
        container.appendChild(brandHeader);

        // Marka için ürün kartları satırı
        const brandRow = document.createElement('div');
        brandRow.className = 'row mb-5';

        // Markanın ürünlerini göster
        productsByBrand[brand].forEach(product => {
            const productCol = document.createElement('div');
            productCol.className = 'col-md-4 col-lg-3 mb-4';
            
            // Stok durumu kontrolü
            const isOutOfStock = product.stok === "0" || product.stok === 0;
            const stockWarning = isOutOfStock ? 
                '<div class="stock-warning">Stok sıfır ürünlerin tedarik süreci 2 haftaya kadar çıkabilmektedir</div>' : '';
            
            // Yeni ürün kontrolü
            const isNewProduct = product.isNew === 1;
            const newBadge = isNewProduct ? 
                '<div class="new-badge"><span>Yeni</span></div>' : '';
            
            // HTML özel karakterleri için escape işlemi
            const escapedTitle = product.ad
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

            // Açıklama kontrolü
            let description = '';
            try {
                if (product.aciklama && product.aciklama.trim() !== '') {
                    description = product.aciklama
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                } else {
                    console.warn(`Ürün açıklaması bulunamadı: ${product.kod} - ${product.ad}`);
                    description = 'Ürün açıklaması bulunmamaktadır.';
                }
            } catch (error) {
                console.error(`Ürün açıklaması işlenirken hata oluştu: ${product.kod} - ${product.ad}`, error);
                description = 'Ürün açıklaması yüklenirken bir hata oluştu.';
            }
            
            productCol.innerHTML = `
                <div class="card product-card h-100 shadow-sm ${isNewProduct ? 'new-product' : ''}">
                    ${newBadge}
                    <div class="card-img-wrapper">
                        <img src="images/${product.gorsel}" class="card-img-top" alt="${escapedTitle}" 
                             onerror="this.src='images/placeholder.png'">
                        <div class="brand-badge">
                            <span class="badge bg-secondary">${product.marka}</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title" data-tooltip="${escapedTitle}">${escapedTitle}</h5>
                        <p class="card-description">${description}</p>
                        <div class="mt-auto">
                            <p class="card-text mb-2">
                                <strong class="text-primary h5">${formatPrice(product.fiyat)} ₺</strong>
                            </p>
                            <p class="card-text mb-2">
                                <span class="badge ${isOutOfStock ? 'bg-warning' : 'bg-success'}">
                                    <i class="fas ${isOutOfStock ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-1"></i>
                                    Stok: ${product.stok} ${product.birim}
                                </span>
                            </p>
                            ${stockWarning}
                            <div class="quantity-input mb-2">
                                <div class="input-group input-group-sm">
                                    <button class="btn btn-outline-secondary" type="button" 
                                            onclick="updateCardQuantity('${product.kod}', 'decrease')">-</button>
                                    <input type="number" class="form-control text-center" 
                                           id="quantity-${product.kod}"
                                           value="0" min="0"
                                           onfocus="handleQuantityFocus(this)"
                                           oninput="validateQuantityInput(this)"
                                           onchange="updateOrderBasket('${product.kod}', this.value)">
                                    <button class="btn btn-outline-secondary" type="button"
                                            onclick="updateCardQuantity('${product.kod}', 'increase')">+</button>
                                </div>
                            </div>
                            <button class="btn btn-outline-primary w-100" 
                                    onclick="showProductDetails('${product.kod}')">
                                <i class="fas fa-info-circle me-2"></i>Ürün Detayı
                            </button>
                        </div>
                    </div>
                </div>
            `;
            brandRow.appendChild(productCol);
        });
        
        container.appendChild(brandRow);
    });
}

// Input alanına tıklandığında veya odaklandığında
function handleQuantityFocus(input) {
    // Eğer değer 0 ise, tüm metni seç
    if (input.value === '0') {
        input.select();
    }
}

// Sayı girişi kontrolü
function validateQuantityInput(input) {
    // Sadece sayıları kabul et
    input.value = input.value.replace(/[^0-9]/g, '');
    
    // Boş veya geçersiz değer kontrolü
    if (input.value === '' || isNaN(input.value)) {
        input.value = '0';
    }
    
    // Başındaki sıfırları kaldır
    input.value = parseInt(input.value).toString();
    
    // Minimum 0 kontrolü
    if (parseInt(input.value) < 0) {
        input.value = '0';
    }
}

// Kart üzerindeki miktar güncelleme fonksiyonu
function updateCardQuantity(productCode, action) {
    const input = document.getElementById(`quantity-${productCode}`);
    let value = parseInt(input.value);
    
    if (action === 'increase') {
        input.value = value + 1;
    } else if (action === 'decrease' && value > 0) {
        input.value = value - 1;
    }
    
    updateOrderBasket(productCode, parseInt(input.value));
}

// Ürün detaylarını göster
function showProductDetails(productCode) {
    const product = products.find(p => p.kod === productCode);
    if (!product) return;

    // HTML özel karakterleri için escape işlemi
    const escapedTitle = product.ad
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Açıklama kontrolü
    let description = '';
    try {
        if (product.aciklama && product.aciklama.trim() !== '') {
            description = product.aciklama
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        } else {
            description = 'Ürün açıklaması bulunmamaktadır.';
        }
    } catch (error) {
        description = 'Ürün açıklaması yüklenirken bir hata oluştu.';
    }

    // Stok durumu kontrolü
    const isOutOfStock = product.stok === "0" || product.stok === 0;
    const stockWarning = isOutOfStock ? 
        '<div class="alert alert-warning mt-2">Stok sıfır ürünlerin tedarik süreci 2 haftaya kadar çıkabilmektedir</div>' : '';

    // Yeni ürün kontrolü
    const isNewProduct = product.isNew === 1;
    const newBadge = isNewProduct ? 
        '<span class="badge bg-success me-2">Yeni</span>' : '';

    const modalContent = `
        <div class="modal-header">
            <h5 class="modal-title">
                ${newBadge}
                ${escapedTitle}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-md-6">
                    <img src="images/${product.gorsel}" class="img-fluid rounded" alt="${escapedTitle}"
                         onerror="this.src='images/placeholder.png'">
                </div>
                <div class="col-md-6">
                    <div class="product-info">
                        <p class="mb-2"><strong>Marka:</strong> ${product.marka}</p>
                        <p class="mb-2"><strong>Ürün Kodu:</strong> ${product.kod}</p>
                        <p class="mb-2"><strong>Barkod:</strong> ${product.barkod || 'Belirtilmemiş'}</p>
                        <p class="mb-2"><strong>Birim:</strong> ${product.birim}</p>
                        <p class="mb-2"><strong>Stok Durumu:</strong> ${product.stok} ${product.birim}</p>
                        <p class="mb-2"><strong>Fiyat:</strong> <span class="text-primary h5">${formatPrice(product.fiyat)} ₺</span></p>
                        ${stockWarning}
                </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h6>Ürün Açıklaması:</h6>
                    <p>${description}</p>
                </div>
                </div>
            <div class="row mt-3">
                <div class="col-12">
                    <div class="quantity-input">
                        <label class="form-label">Sipariş Miktarı:</label>
                    <div class="input-group">
                        <button class="btn btn-outline-secondary" type="button" 
                                    onclick="updateModalQuantity('decrease')">-</button>
                        <input type="number" class="form-control text-center" 
                                   id="modalQuantity"
                                   value="0" min="0"
                                   onfocus="handleQuantityFocus(this)"
                                   oninput="validateModalQuantity(this)">
                        <button class="btn btn-outline-secondary" type="button" 
                                    onclick="updateModalQuantity('increase')">+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
            <button type="button" class="btn btn-primary" onclick="addToOrderFromModal('${product.kod}')">
                <i class="fas fa-shopping-cart me-2"></i>Siparişe Ekle
            </button>
        </div>
    `;

    const modal = document.getElementById('productDetailModal');
    modal.querySelector('.modal-content').innerHTML = modalContent;
    new bootstrap.Modal(modal).show();
}

function validateModalQuantity(input) {
    // Sadece sayıları kabul et
    input.value = input.value.replace(/[^0-9]/g, '');
    
    // Boş veya geçersiz değer kontrolü
    if (input.value === '' || isNaN(input.value)) {
        input.value = '0';
    }
    
    // Başındaki sıfırları kaldır
    input.value = parseInt(input.value).toString();
    
    // Minimum 0 kontrolü
    if (parseInt(input.value) < 0) {
        input.value = '0';
    }
}

function updateModalQuantity(action) {
    const input = document.getElementById('modalQuantity');
    let value = parseInt(input.value) || 0;
    
    if (action === 'increase') {
        value++;
    } else if (action === 'decrease' && value > 0) {
        value--;
    }

    input.value = value;
    }
    
function addToOrderFromModal(productCode) {
    const quantity = parseInt(document.getElementById('modalQuantity').value) || 0;
    if (quantity > 0) {
        updateOrderBasket(productCode, quantity);
        const modal = bootstrap.Modal.getInstance(document.getElementById('productDetailModal'));
        modal.hide();
    }
}

// Miktar girişi validasyonu
function validateQuantityInput(input) {
    let value = parseInt(input.value) || 0;
    if (value < 0) {
        value = 0;
    }
    input.value = value;
}

// Miktar girişi odaklandığında
function handleQuantityFocus(input) {
    input.select();
}

// Arama fonksiyonu
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const benefitSearchTerm = document.getElementById('benefitSearchInput').value.toLowerCase();
    filterProducts(searchTerm, benefitSearchTerm);
});

document.getElementById('benefitSearchInput').addEventListener('input', (e) => {
    const benefitSearchTerm = e.target.value.toLowerCase();
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filterProducts(searchTerm, benefitSearchTerm);
});

// Ürünleri filtrele
function filterProducts(searchTerm, benefitSearchTerm) {
    const filteredProducts = products.filter(product => {
        const matchesSearch = (currentBrand === 'all' || product.marka === currentBrand) &&
        (product.ad.toLowerCase().includes(searchTerm) || 
         product.marka.toLowerCase().includes(searchTerm) ||
             product.kod.toLowerCase().includes(searchTerm));

        const matchesBenefit = !benefitSearchTerm || 
            (product.aciklama && product.aciklama.toLowerCase().includes(benefitSearchTerm));

        return matchesSearch && matchesBenefit;
    });

    // Sonuç sayısını göster
    const resultCount = document.createElement('div');
    resultCount.className = 'search-result-count';
    resultCount.textContent = `${filteredProducts.length} ürün bulundu`;
    
    const container = document.getElementById('productContainer');
    const existingCount = container.querySelector('.search-result-count');
    if (existingCount) {
        existingCount.remove();
    }
    container.insertBefore(resultCount, container.firstChild);

    displayProducts(filteredProducts);
} 