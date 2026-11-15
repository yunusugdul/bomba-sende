# BOMBA SENDE! V5 — Özelleştirilebilir Online Oda + Bomba Evrimi

V4 sunucu ve oyun üzerine inşa edilmiştir. Node.js 22+ ile çalışır; ek npm bağımlılığı yoktur.

## Başlatma

```sh
npm start
```

Tarayıcıda `http://localhost:3000`. Testler için `npm test`. Render için **Node Web Service**, build `npm install --omit=dev`, start `npm start`.

## Oda oluşturma

1. Online düelloyu seç.
2. **HEPSİ BİR ARADA** (varsayılan), **BOMBA EVRİMİ**, **ÇILGIN KAOS** veya **KLASİK DÜELLO** profillerinden birini seç.
3. İstediğin arena (`HER TUR FARKLI`, `RASTGELE` veya sabit bir arena), 3/5/7 tur ve güç/kaos/kart/panik kutucuklarını ayarla.
4. Oda kur. Ayarlar sunucuda doğrulanır, odaya kaydedilir, diğer oyuncuya gönderilir ve maç boyunca sabit kalır. Davet linki odaya doğrudan katılır.

## Bomba Evrimi

Tur kaybeden oyuncu bir sonraki tur öncesi üç rastgele geliştirmeden birini seçer (14 saniye; süre dolarsa ilk seçenek). Oyun sırasında tüm oyuncular aynı fizik ve seçim durumunu görür. Geliştirmeler maç boyunca birikir, yeni maçta sıfırlanır.

- 🚀 Roket Motoru: bomba hızı +%22
- 🧲 Manyetik: uçan bomba hafifçe hedefe yönelir
- 🎱 Sekme Ustası: sekme limiti 3 yerine 5
- ⚡ Seri Atıl: atılma bekleme süresi %25 kısa
- 🛡️ Refleks: savunma bekleme süresi %25 kısa

Tur kaybeden bir bot ise seçim otomatik yapılır. Online maçta seçim sunucu tarafından yalnızca oda kurucusuna iletilir ve kurucu simülasyonunda uygulanır. İstemciden gelen seçimler aktif teklif listesiyle sınanır.

## Kapsam

Rozetler, GIF/tekrar oynatma ve ilerleme profili bilinçli olarak eklenmedi. V4 hareket, oda kodu, davet, bot, HUD ve oyun altyapısı korundu. Oda oyun simülasyonu halen kurucu tarayıcısında çalışır; tam sunucu-otoriteli anti-hile sistemi değildir. Ücretsiz Render hizmeti uykuya geçebilir.
