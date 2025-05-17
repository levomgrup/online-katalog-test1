let products = [];

// Ürünleri yükle
fetch('assets/js/products.json')
    .then(response => response.json())
    .then(data => {
        products = data;
        displayProducts(products);
    })
    .catch(error => console.error('Ürünler yüklenirken hata oluştu:', error));

// Ürünleri görüntüle
function displayProducts(productsToShow) {
    const container = document.getElementById('productContainer');
    container.innerHTML = '';

    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-4 col-lg-3';
        card.innerHTML = `
            <div class="card product-card" onclick="showProductDetails('${product.id}')">
                <img src="${product.image}" class="card-img-top" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Ürün+Görseli'">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-muted">${product.brand || ''}</p>
                    <p class="card-text small">${product.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <strong class="text-primary">${product.price} ${product.currency}</strong>
                        <span class="badge bg-secondary">${product.stock} ${product.unit}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Ürün detaylarını göster
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    document.querySelector('#productModal .modal-title').textContent = product.name;
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalImage').onerror = function() {
        this.src = 'https://via.placeholder.com/300x200?text=Ürün+Görseli';
    };
    
    const details = document.getElementById('modalDetails');
    details.innerHTML = `
        <h4 class="mb-3">${product.name}</h4>
        <p class="text-muted">Marka: ${product.brand || '-'}</p>
        <p class="text-muted">Kategori: ${product.category || '-'}</p>
        <p class="text-muted">Stok: ${product.stock} ${product.unit}</p>
        <p>${product.description || ''}</p>
        <p class="h4 mb-3">Fiyat: ${product.price} ${product.currency}</p>
        <div class="small text-muted mb-3">
            Ürün Kodu: ${product.code}<br>
            Barkod: ${product.barcode}
        </div>
    `;

    // WhatsApp butonunu güncelle
    const whatsappBtn = document.getElementById('whatsappButton');
    const message = encodeURIComponent(`Merhaba, ${product.name} (Ürün Kodu: ${product.code}) ürünü hakkında bilgi almak istiyorum.`);
    whatsappBtn.href = `https://wa.me/905XXXXXXXXX?text=${message}`;

    modal.show();
}

// Arama fonksiyonu
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.code.toLowerCase().includes(searchTerm) ||
        product.barcode.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}); 