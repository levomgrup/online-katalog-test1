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
    
    const filteredProducts = brand === 'all' 
        ? products 
        : products.filter(p => p.marka === brand);
    displayProducts(filteredProducts);
}

// Sipariş butonunu oluştur
function setupOrderButton() {
    let orderButton = document.createElement('div');
    orderButton.className = 'fixed-order-button d-none';
    orderButton.innerHTML = `
        <button class="btn btn-success btn-lg" onclick="sendCollectedOrders()">
            <i class="fab fa-whatsapp"></i> Siparişi Tamamla
            <span class="order-count badge bg-light text-success ms-2">0</span>
        </button>
    `;
    document.body.appendChild(orderButton);
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

    // Sipariş butonunu güncelle
    const orderButton = document.querySelector('.fixed-order-button');
    const orderCount = orderBasket.size;
    
    if (orderCount > 0) {
        orderButton.classList.remove('d-none');
        orderButton.querySelector('.order-count').textContent = orderCount;
    } else {
        orderButton.classList.add('d-none');
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

    window.open(`https://wa.me/905XXXXXXXXX?text=${encodeURIComponent(message)}`, '_blank');
    
    // Sepeti temizle
    orderBasket.clear();
    document.querySelector('.fixed-order-button').classList.add('d-none');
    
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
            
            productCol.innerHTML = `
                <div class="card product-card h-100 shadow-sm ${isNewProduct ? 'new-product' : ''}">
                    ${newBadge}
                    <div class="card-img-wrapper">
                        <img src="images/${product.gorsel}" class="card-img-top" alt="${escapedTitle}" 
                             onerror="this.src='https://via.placeholder.com/300x200?text=Ürün+Görseli'">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="brand-badge mb-2">
                            <span class="badge bg-secondary">${product.marka}</span>
                        </div>
                        <h5 class="card-title" data-tooltip="${escapedTitle}">${escapedTitle}</h5>
                        <p class="card-text">
                            <small class="text-muted">Stok: ${product.stok} ${product.birim}</small>
                            ${stockWarning}
                        </p>
                        <div class="mt-auto">
                            <p class="card-text mb-2">
                                <strong class="text-primary h5">${formatPrice(product.fiyat)} ₺</strong>
                            </p>
                            <div class="quantity-input mb-2">
                                <div class="input-group input-group-sm">
                                    <button class="btn btn-outline-secondary" type="button" 
                                            onclick="updateCardQuantity('${product.kod}', 'decrease')">-</button>
                                    <input type="number" class="form-control text-center" 
                                           id="quantity-${product.kod}" value="0" min="0"
                                           onfocus="handleQuantityFocus(this)"
                                           oninput="validateQuantityInput(this)"
                                           onchange="updateOrderBasket('${product.kod}', this.value)">
                                    <button class="btn btn-outline-secondary" type="button"
                                            onclick="updateCardQuantity('${product.kod}', 'increase')">+</button>
                                </div>
                            </div>
                            <button class="btn btn-outline-primary btn-sm w-100" 
                                    onclick="showProductDetails('${product.kod}')">
                                <i class="fas fa-info-circle"></i> Ürün Detayı
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
function showProductDetails(urunKodu) {
    const product = products.find(p => p.kod === urunKodu);
    if (!product) return;

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    document.querySelector('#productModal .modal-title').textContent = product.ad;
    
    // Görsel kısmını güncelle
    const modalImage = document.getElementById('modalImage');
    modalImage.src = `images/${product.gorsel}`;
    modalImage.alt = product.ad;
    modalImage.onerror = function() {
        this.src = 'https://via.placeholder.com/400x400?text=Ürün+Görseli';
    };
    
    const details = document.getElementById('modalDetails');
    details.innerHTML = `
        <div class="product-info">
            <h4 class="product-title mb-3">${product.ad}</h4>
            <div class="product-details">
                <div class="detail-item">
                    <span class="label">Marka:</span>
                    <span class="value">${product.marka || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Kategori:</span>
                    <span class="value">${product.kategori || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Stok:</span>
                    <span class="value">${product.stok} ${product.birim}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Ürün Kodu:</span>
                    <span class="value">${product.kod}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Barkod:</span>
                    <span class="value">${product.barkod}</span>
                </div>
            </div>
            
            ${product.aciklama ? `
                <div class="product-description mt-3">
                    <h5 class="description-title">Ürün Açıklaması</h5>
                    <p>${product.aciklama}</p>
                </div>
            ` : ''}

            <div class="order-section mt-4">
                <div class="price-tag mb-3">
                    <span class="price">${formatPrice(product.fiyat)}</span>
                    <span class="currency">₺</span>
                </div>
                
                <div class="quantity-control">
                    <label for="modalQuantity" class="form-label">Sipariş Miktarı:</label>
                    <div class="input-group">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateModalQuantity('decrease')">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="form-control text-center" 
                               id="modalQuantity" value="1" min="1" 
                               max="${product.stok}"
                               onchange="validateModalQuantity(this)">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="updateModalQuantity('increase')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    ${parseInt(product.stok) === 0 ? 
                        '<div class="stock-warning mt-2">Stok sıfır ürünlerin tedarik süreci 2 haftaya kadar çıkabilmektedir</div>' :
                        `<small class="text-muted mt-2 d-block">Maksimum sipariş: ${product.stok} ${product.birim}</small>`
                    }
                </div>
            </div>
        </div>
    `;

    modal.show();
}

// Modal içindeki miktar kontrolü
function updateModalQuantity(action) {
    const input = document.getElementById('modalQuantity');
    let value = parseInt(input.value);
    const max = parseInt(input.max);
    
    if (action === 'increase' && value < max) {
        input.value = value + 1;
    } else if (action === 'decrease' && value > 1) {
        input.value = value - 1;
    }
    
    validateModalQuantity(input);
}

// Modal miktar doğrulama
function validateModalQuantity(input) {
    let value = parseInt(input.value);
    const max = parseInt(input.max);
    
    if (isNaN(value) || value < 1) {
        input.value = 1;
    } else if (value > max) {
        input.value = max;
    }
}

// Arama fonksiyonu
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        (currentBrand === 'all' || product.marka === currentBrand) &&
        (product.ad.toLowerCase().includes(searchTerm) || 
         product.marka.toLowerCase().includes(searchTerm) ||
         product.kod.toLowerCase().includes(searchTerm))
    );
    displayProducts(filteredProducts);
}); 