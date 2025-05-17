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
            <div class="card product-card" onclick="showProductDetails(${product.id})">
                <img src="images/${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description || ''}</p>
                    <p class="card-text"><strong>${product.price} TL</strong></p>
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
    document.getElementById('modalImage').src = `images/${product.image}`;
    
    const details = document.getElementById('modalDetails');
    details.innerHTML = `
        <h4 class="mb-3">${product.name}</h4>
        <p>${product.description || ''}</p>
        <p class="h5 mb-3">Fiyat: ${product.price} TL</p>
    `;

    // WhatsApp butonunu güncelle
    const whatsappBtn = document.getElementById('whatsappButton');
    const message = encodeURIComponent(`Merhaba, ${product.name} ürünü hakkında bilgi almak istiyorum.`);
    whatsappBtn.href = `https://wa.me/905XXXXXXXXX?text=${message}`;

    modal.show();
}

// Arama fonksiyonu
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    displayProducts(filteredProducts);
}); 