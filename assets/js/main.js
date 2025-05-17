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
            <div class="card product-card" onclick="showProductDetails('${product.kod}')">
                <img src="${product.gorsel}" class="card-img-top" alt="${product.ad}" onerror="this.src='https://via.placeholder.com/300x200?text=Ürün+Görseli'">
                <div class="card-body">
                    <h5 class="card-title">${product.ad}</h5>
                    <p class="card-text">${product.marka}</p>
                    <p class="card-text">
                        <strong>Fiyat: ${product.fiyat} ${product.para_birimi}</strong>
                    </p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Ürün detaylarını göster
function showProductDetails(urunKodu) {
    const product = products.find(p => p.kod === urunKodu);
    if (!product) return;

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    document.querySelector('#productModal .modal-title').textContent = product.ad;
    document.getElementById('modalImage').src = product.gorsel;
    document.getElementById('modalImage').onerror = function() {
        this.src = 'https://via.placeholder.com/300x200?text=Ürün+Görseli';
    };
    
    const details = document.getElementById('modalDetails');
    details.innerHTML = `
        <h4>${product.ad}</h4>
        <p>Marka: ${product.marka}</p>
        <p>Kategori: ${product.kategori}</p>
        <p>Stok: ${product.stok} ${product.birim}</p>
        <p>${product.aciklama || ''}</p>
        <p class="h4">Fiyat: ${product.fiyat} ${product.para_birimi}</p>
        <p>Ürün Kodu: ${product.kod}</p>
        <p>Barkod: ${product.barkod}</p>
    `;

    // WhatsApp butonunu güncelle
    const whatsappBtn = document.getElementById('whatsappButton');
    const message = encodeURIComponent(`Merhaba, ${product.ad} (Ürün Kodu: ${product.kod}) ürünü hakkında bilgi almak istiyorum.`);
    whatsappBtn.href = `https://wa.me/905XXXXXXXXX?text=${message}`;

    modal.show();
}

// Arama fonksiyonu
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.ad.toLowerCase().includes(searchTerm) || 
        product.marka.toLowerCase().includes(searchTerm) ||
        product.kod.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}); 