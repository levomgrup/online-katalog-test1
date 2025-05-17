# Online Katalog

Bu proje, Excel dosyasından ürün verilerini alarak modern ve kullanıcı dostu bir web kataloğu oluşturur. Kullanıcılar ürünleri görüntüleyebilir, arama yapabilir ve WhatsApp üzerinden sipariş verebilirler.

## Özellikler

- Responsive tasarım
- Ürün arama
- Ürün detay görüntüleme
- WhatsApp ile sipariş verme
- Modern ve kullanıcı dostu arayüz

## Kurulum

1. Python paketlerini yükleyin:
```bash
pip install -r requirements.txt
```

2. Excel verilerini JSON'a dönüştürün:
```bash
python convert_excel.py
```

3. Ürün resimlerini `images` klasörüne yerleştirin.

4. WhatsApp numarasını ayarlayın:
- `assets/js/main.js` dosyasında `https://wa.me/905XXXXXXXXX` kısmındaki telefon numarasını kendi numaranızla değiştirin.

5. GitHub Pages'te yayınlayın:
- Bu repoyu GitHub'a push edin
- GitHub repository ayarlarından Pages özelliğini aktifleştirin

## Dosya Yapısı

```
.
├── index.html
├── data.xlsx
├── convert_excel.py
├── requirements.txt
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       └── products.json
└── images/
    └── [ürün resimleri]
```

## Kullanım

1. Excel dosyasında ürün bilgilerini güncelleyin
2. `python convert_excel.py` komutunu çalıştırın
3. Değişiklikleri GitHub'a push edin

## Geliştirme

Projeyi geliştirmek için:

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: Açıklama'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request oluşturun 