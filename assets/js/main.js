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
    let orderButton = document.createElement('div');
    orderButton.className = 'fixed-order-button d-none';
    orderButton.innerHTML = `
        <button class="btn btn-success btn-lg" onclick="sendCollectedOrders()">
            <i class="fab fa-whatsapp"></i> Siparişi Onayla
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

    window.open(`https://wa.me/905393082719?text=${encodeURIComponent(message)}`, '_blank');
    
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
                             onerror="this.src='https://via.placeholder.com/300x200?text=Ürün+Görseli'">
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

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalTitle = document.querySelector('#productModal .modal-title');
    const modalImage = document.getElementById('modalImage');
    const modalDetails = document.getElementById('modalDetails');

    // Başlık ve görsel
    modalTitle.textContent = product.urun;
    modalImage.src = `images/${product.gorsel}`;
    modalImage.alt = product.urun;

    // Detaylar
    const details = `
        <div class="product-info">
            <div class="product-details">
                <div class="detail-item">
                    <span class="label">Marka:</span>
                    <span class="value">${product.marka}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Ürün Kodu:</span>
                    <span class="value">${product.kod}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Fiyat:</span>
                    <span class="value text-primary h5 mb-0">${formatPrice(product.fiyat)} ₺</span>
                </div>
            </div>
            
            <div class="product-description mt-4">
                <h6 class="description-title">Ürün Açıklaması</h6>
                <p>${product.aciklama || 'Ürün açıklaması bulunmamaktadır.'}</p>
            </div>

            <div class="quantity-control mt-4">
                <div class="input-group">
                    <button class="btn btn-outline-secondary" type="button" onclick="updateModalQuantity('decrease')">-</button>
                    <input type="number" class="form-control text-center" id="modalQuantity" value="1" min="1"
                           oninput="validateModalQuantity(this)"
                           onchange="updateOrderBasket('${product.kod}', this.value)"
                           onfocus="this.select()">
                    <button class="btn btn-outline-secondary" type="button" onclick="updateModalQuantity('increase')">+</button>
                </div>
                <button class="btn btn-success mt-3" onclick="addToOrderFromModal('${product.kod}')">
                    <i class="fab fa-whatsapp me-2"></i>Sipariş Ver
                </button>
            </div>
        </div>
    `;

    modalDetails.innerHTML = details;
    modal.show();
}

function validateModalQuantity(input) {
    let value = parseInt(input.value) || 0;
    if (value < 1) {
        value = 1;
    }
    input.value = value;
    const productCode = input.closest('.product-info').querySelector('.detail-item:nth-child(2) .value').textContent;
    updateOrderBasket(productCode, value);
}

function updateModalQuantity(action) {
    const input = document.getElementById('modalQuantity');
    let value = parseInt(input.value) || 0;

    if (action === 'increase') {
        value++;
    } else if (action === 'decrease') {
        value = Math.max(1, value - 1);
    }

    input.value = value;
    const productCode = input.closest('.product-info').querySelector('.detail-item:nth-child(2) .value').textContent;
    updateOrderBasket(productCode, value);
}

function addToOrderFromModal(productCode) {
    const quantity = parseInt(document.getElementById('modalQuantity').value) || 0;
    if (quantity > 0) {
        updateOrderBasket(productCode, quantity);
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
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