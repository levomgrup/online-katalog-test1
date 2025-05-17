import pandas as pd
import json
import os

def convert_excel_to_json():
    # Excel dosyasını oku
    df = pd.read_excel('data.xlsx')
    
    # NaN değerleri temizle
    df = df.fillna('')
    
    # Sütun isimlerini düzelt
    df.columns = df.columns.str.strip().str.lower()
    
    # JSON için ürün listesi oluştur
    products = []
    for index, row in df.iterrows():
        if row['aktif mi ?'] != 'Hayır':  # Sadece aktif ürünleri al
            # Fiyat dönüşümü
            try:
                price = float(str(row['satış fiyatı']).replace(',', '.')) if row['satış fiyatı'] != '' else 0
            except (ValueError, TypeError):
                price = 0
                
            product = {
                'id': str(index + 1),
                'code': str(row['kart kodu']),
                'name': str(row['adı']),
                'brand': str(row['marka']),
                'stock': str(row['eldeki stok']),
                'unit': str(row['birim']),
                'price': price,
                'currency': str(row['döviz cinsi']),
                'barcode': str(row['barkod']),
                'description': str(row['açıklama']),
                'image': str(row['görsel']),
                'category': str(row['stok grup'])
            }
            products.append(product)
    
    # JSON dosyasını oluştur
    os.makedirs('assets/js', exist_ok=True)
    with open('assets/js/products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    convert_excel_to_json() 