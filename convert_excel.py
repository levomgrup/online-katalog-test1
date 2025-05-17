import pandas as pd
import json
import os

def convert_excel_to_json():
    # Excel dosyasını oku
    df = pd.read_excel('data.xlsx')
    
    # NaN değerleri temizle
    df = df.fillna('')
    
    # JSON için ürün listesi oluştur
    products = []
    for _, row in df.iterrows():
        if row['Aktif mi ?'] == 'TRUE':  # Sadece aktif ürünleri al
            product = {
                'kod': row['Kart kodu'],
                'ad': row['Adı'],
                'marka': row['Marka'],
                'stok': row['Eldeki stok'],
                'birim': row['Birim'],
                'fiyat': row['Satış fiyatı'],
                'para_birimi': row['Döviz cinsi'],
                'barkod': row['Barkod'],
                'aciklama': row['açıklama'],
                'gorsel': row['görsel'],
                'kategori': row['Stok grup']
            }
            products.append(product)
    
    # JSON dosyasını oluştur
    os.makedirs('assets/js', exist_ok=True)
    with open('assets/js/products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    convert_excel_to_json() 