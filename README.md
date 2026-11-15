# 💣 BOMBA SENDE! V6 — Online oda, sohbet, kar ve yeni geliştirmeler

V5 üzerine güncelleme; Node.js 22+, ek npm bağımlılığı yoktur. Kullanıcıların bilgisayarına Python/Node.js kurması gerekmez; oyunu canlı web sitesinden oynarlar.

## Çalıştırma

```bash
npm start
npm test
```

Render Node Web Service: ücretsiz plan, `npm install --omit=dev` build, `npm start` başlatma. Ana GitHub deposu `yunusugdul/bomba-sende`.

## Yenilikler

- Harita/mod seçimi odadan ayrıldıktan sonra hemen açılır (F5 gerekmez).
- Oynanışı etkilemeyen alan daralması kaldırıldı; kaos olarak Turbo ve Meteor Yağmuru korundu.
- **Buz Labirenti** içinde 27–44 birim yarıçaplı, 5–8 saniye yaşayan küçük kar bölgeleri belirir. İçlerine giren normal hareket hızı **%30 azalır** (0.7×). Bölge konumları oyun kurucusunun simülasyonundan konuk istemciye iletilir.
- Lobi ve maç içi **oda sohbeti**: en fazla 180 karakter, mesaj sunucu tarafından filtrelenir ve 650 ms gönderim sınırına tabidir. En son 40 mesaj yalnızca oda üyeleri arasında tutulur; sunucu yeniden başlayınca silinir.
- Patlama sonrası **sonraki tur bomba kazanan oyuncunun elinde** başlar (ilk tur rastgele).
- Oda oluşturma menüsü sayfanın üst kısmına taşındı; online odada ön izleme gizlenir.
- Oda kurucusu sekmeden ayrılırsa/bağlantısı koparsa misafir **“Oyun duraklatıldı”** bilgisi görür. Kurucu geri döndüğünde veya bağlantı onarıldığında oyun sürdürülür. Kurucu tarayıcısının baştan yüklenmesi durumunda maçı yeniden başlatmak gerekebilir.
- **9 geliştirme:** eski beşli + **Hayalet Bomba** (iç engellerden geçer; dış sınırlardan geçmez), **Hızlı Şarj**, **Çevik Adım**, **Serin Kan**. Manyetik yönelim hafif artırıldı. Kaybedene üç rastgele geliştirme önerilir.
- Oda oluştururken gelişmelerin **maç boyunca birikmesi** (varsayılan) veya **her tur sıfırlanması** seçilir. “Her tur sıfırlansın” modunda bir önceki turun gücü silinir, ardından kaybeden yeni bir güç seçer ve bu güç sonraki tur geçerlidir.
- Önceki tuş düzeni değişmedi: **WASD** hareket, **sol tık** fırlatma, **Space** atılma, **E** savunma, **Q** kart.

## Sınırlar

Oyun fizik/süre hesabını halen oda kurucusunun tarayıcısı yürütür; Render bağlantıları ve sohbeti yönetir. Bu sürüm sunucu-taraflı fizik / anti-hile mimarisine dönüş değildir. Ücretsiz Render servisi bir süre kullanılmadığında uyuyabilir. Rozet ve tekrar/gif özellikleri eklenmemiştir.

V5 yedeği GitHub'da: `backup/v5-before-chat-snow-upgrades`. V4 yedeği: `backup/v4-before-evolution`.
