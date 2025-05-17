import pandas as pd
import json
import os

def convert_excel_to_json():
    # Excel dosyasını oku
    df = pd.read_excel('data.xlsx')
    
    # NaN değerleri temizle
    df = df.fillna('')
    
    # DataFrame'i JSON formatına dönüştür
    products = df.to_dict('records')
    
    # JSON dosyasını oluştur
    with open('assets/js/products.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    # assets/js klasörünü oluştur
    os.makedirs('assets/js', exist_ok=True)
    convert_excel_to_json() 