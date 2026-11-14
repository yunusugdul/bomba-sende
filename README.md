# BOMBA SENDE! — Online V4

İki oyunculu gerçek zamanlı oda oyunu. Node.js 22+ gereklidir; oyuncuların bilgisayarına kurulum gerekmez.

## Başlatma

`npm start` — HTTP/WebSocket sunucusunu başlatır (`PORT` ortam değişkenini destekler).

`npm test` — oda ve HTTP sunucusu testleri.

## Online kontrol

- `WASD`: yürü
- Sol fare: basılı tutarak bomba şarj et, bırakınca fırlat
- `SPACE`: hızlı atıl
- `E`: bombayı savuştur
- `Q`: kart kullan

## Eşitleme

Kurucu tarayıcı tüm fizik/sonuçların tek otoritesidir. Konuk kontrolü WebSocket ile kurucuya iletilir; konuk 30 Hz snapshot akışı üzerinden ~95 ms gecikmeli görsel enterpolasyon kullanır. Aynı olaylar ve pozisyonlar her iki tarafın aynı sunucu otoritesinden gelir; ağ gecikmesi nedeniyle ekrandaki anlar tam olarak milisaniye eşzamanlı değildir. Konuk, oyunun fizik durumunu yerel olarak yeniden hesaplamaz. Oda bağlantısında `?room=ABC123` otomatik katılım yapar.

Render için: `npm install --omit=dev`, ardından `npm start`, servis türü Web Service (free).