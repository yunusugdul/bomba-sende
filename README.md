# 💣 BOMBA SENDE! V7 — Rövanş, hafif sohbet ve temiz kaos

V6 üzerine güncelleme; Node.js 22+, ek npm bağımlılığı yoktur. Kullanıcıların bilgisayarına Python/Node.js kurması gerekmez; oyunu canlı web sitesinden oynarlar.

## Çalıştırma

```bash
npm start
npm test
```

Render Node Web Service: ücretsiz plan, `npm install --omit=dev` build, `npm start` başlatma. Ana GitHub deposu `yunusugdul/bomba-sende`.

## Yenilikler

- Harita/mod seçimi odadan ayrıldıktan sonra hemen açılır (F5 gerekmez).
- Oynanışı etkilemeyen alan daralması daha önce kaldırıldı; yeni sürümde meteor yağmuru da tamamen kaldırıldı. Kaos ayarı açıkken yalnızca Turbo etkinleşir.
- **Buz Labirenti** içinde 27–44 birim yarıçaplı, 5–8 saniye yaşayan küçük kar bölgeleri belirir. İçlerine giren normal hareket hızı **%30 azalır** (0.7×). Bölge konumları oyun kurucusunun simülasyonundan konuk istemciye iletilir.
- Lobi sohbeti korunur. Maç içinde sol altta saydam bir sohbet gösterilir; son **5 mesaj** görünür. Enter ile yazılır, Enter ile gönderilip oyun tuşlarına dönülür; Esc iptal eder. Her mesaj en fazla 180 karakterdir; sunucu filtreleme ve 650 ms hız sınırı uygular. Son 40 mesaj yalnızca odada tutulur, sunucu yeniden başlayınca silinir.
- Patlama sonrası **sonraki tur bomba kazanan oyuncunun elinde** başlar (ilk tur rastgele).
- Oda oluşturma menüsü sayfanın üst kısmına taşındı; online odada ön izleme gizlenir.
- Oda kurucusu sekmeden ayrılırsa/bağlantısı koparsa misafir **“Oyun duraklatıldı”** bilgisi görür. Kurucu geri döndüğünde veya bağlantı onarıldığında oyun sürdürülür. Kurucu tarayıcısının baştan yüklenmesi durumunda maçı yeniden başlatmak gerekebilir.
- **9 geliştirme:** eski beşli + **Hayalet Bomba** (iç engellerden geçer; dış sınırlardan geçmez), **Hızlı Şarj**, **Çevik Adım**, **Serin Kan**. Manyetik yönelim hafif artırıldı. Kaybedene üç rastgele geliştirme önerilir.
- Oda oluştururken gelişmelerin **maç boyunca birikmesi** (varsayılan) veya **her tur sıfırlanması** seçilir. “Her tur sıfırlansın” modunda bir önceki turun gücü silinir, ardından kaybeden yeni bir güç seçer ve bu güç sonraki tur geçerlidir.
- Önceki tuş düzeni değişmedi: **WASD** hareket, **sol tık** fırlatma, **Space** atılma, **E** savunma, **Q** kart. Maç içi sohbet **Enter** ile açılıp gönderilir.

## Sınırlar

Oyun fizik/süre hesabını halen oda kurucusunun tarayıcısı yürütür; Render bağlantıları ve sohbeti yönetir. Bu sürüm sunucu-taraflı fizik / anti-hile mimarisine dönüş değildir. Ücretsiz Render servisi bir süre kullanılmadığında uyuyabilir. Rozet ve tekrar/gif özellikleri eklenmemiştir.

V5 yedeği GitHub'da: `backup/v5-before-chat-snow-upgrades`. V4 yedeği: `backup/v4-before-evolution`.

## V7 değişiklikleri

- **Rövanş**: Oda kurucusunun rövanş isteği sunucu tarafından yeni bir `matchId` ile iki oyuncuya birlikte yayınlanır. Önceki maçın geç gelen kareleri yeni maça uygulanmaz.
- **Maç içi sohbet**: Arenanın sol altında son beş mesaj görünür. Enter giriş açar; ikinci Enter gönderip oyuna döndürür. Esc yazmayı iptal eder. Mesaj kutusu açıkken hareket tuşları bastırılır. Oda bekleme sohbeti aynen kalır.
- **Meteor kaldırıldı**: Meteor saldırıları ve sersemletmesi çıkartıldı. Kaos açık olduğunda yalnızca Turbo olayı çalışır.
- **Geri dönüş**: GitHub `backup/v6-before-rematch-chat-meteor` dalından V6'ya dönülebilir.

## V8 — Sohbet arayüzü

- Online maç sohbeti arenanın üstünü kapatmaz: masaüstünde arena solunda, dar ekranlarda altında görünür.
- Sohbet isimleri her oyuncuya göre `Sen` ve `O` olarak gösterilir; skor tablosundaki oyuncu isimleri korunur.
- Tam ekranda, yeni mesaj gelmezse 3 saniye sonra sohbet solar. Enter veya yeni mesaj onu tekrar gösterir. Yazarken gizlenmez.
- Enter sohbet yazmayı açar, tekrar Enter gönderip kapatır. Esc mesajı iptal eder.
- Geri dönüş yedeği: `backup/v7-before-chat-sidebar`.
