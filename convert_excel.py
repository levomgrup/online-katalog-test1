import pandas as pd
import json
import os

def convert_excel_to_json():
    try:
        print("Excel dosyası okunuyor...")
        # Excel dosyasını oku
        df = pd.read_excel('data.xlsx')
        
        print(f"Toplam satır sayısı: {len(df)}")
        print("Sütunlar:", df.columns.tolist())
        
        # NaN değerleri temizle
        df = df.fillna('')
        
        # JSON için ürün listesi oluştur
        products = []
        for index, row in df.iterrows():
            print(f"\nSatır {index} işleniyor:")
            aktif_mi = str(row['Aktif mi ?']).upper()
            print(f"Aktif mi? değeri: {aktif_mi}")
            
            # 1.0, TRUE, EVET, 1 değerlerini kabul et
            if aktif_mi in ['1.0', '1', 'TRUE', 'EVET', 'YES']:
                product = {
                    'kod': str(row['Kart kodu']),
                    'ad': str(row['Adı']),
                    'marka': str(row['Marka']),
                    'stok': str(row['Eldeki stok']),
                    'birim': str(row['Birim']),
                    'fiyat': str(row['Satış fiyatı']),
                    'para_birimi': str(row['Döviz cinsi']),
                    'barkod': str(row['Barkod']),
                    'aciklama': str(row['açıklama']),
                    'gorsel': str(row['görsel']),
                    'kategori': str(row['Stok grup'])
                }
                products.append(product)
                print(f"Ürün eklendi: {product['kod']} - {product['ad']}")
            else:
                print(f"Bu ürün aktif değil, atlanıyor.")
        
        print(f"\nToplam {len(products)} ürün işlendi.")
        
        # JSON dosyasını oluştur
        os.makedirs('assets/js', exist_ok=True)
        with open('assets/js/products.json', 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print("JSON dosyası başarıyla oluşturuldu.")
        
    except Exception as e:
        print(f"Hata oluştu: {str(e)}")

if __name__ == "__main__":
    convert_excel_to_json() 