# 💣 BOMBA SENDE! V8 — Rövanş, hafif sohbet ve temiz kaos

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

## V8 değişiklikleri

- **Rövanş**: Oda kurucusunun rövanş isteği sunucu tarafından yeni bir `matchId` ile iki oyuncuya birlikte yayınlanır. Önceki maçın geç gelen kareleri yeni maça uygulanmaz.
- **Maç içi sohbet**: Arenanın sol altında son beş mesaj görünür. Enter giriş açar; ikinci Enter gönderip oyuna döndürür. Esc yazmayı iptal eder. Mesaj kutusu açıkken hareket tuşları bastırılır. Oda bekleme sohbeti aynen kalır.
- **Meteor kaldırıldı**: Meteor saldırıları ve sersemletmesi çıkartıldı. Kaos açık olduğunda yalnızca Turbo olayı çalışır.
- **Geri dönüş**: GitHub `backup/v6-before-rematch-chat-meteor` dalından V6'ya dönülebilir.

## V8 — Sohbet arayüzü

- Online maç sohbeti arenaya binmez: masaüstünde sol tarafta, dar ekranlarda arenanın altında yer alır.
- Lobide ve maç içinde sohbet adları kendi ekranına göre `Sen` / `O` olur; gerçek oyuncu isimleri skor tablosunda kalır.
- Tam ekran modunda, yeni mesaj gelmezse veya yazma kapandıktan sonra 3 saniye içinde sohbet solar; yeni mesaj ya da Enter ile yeniden görünür.
- Enter sohbeti açar; Enter mesajı gönderir ve yazmayı kapatır. Esc vazgeçer.
- `backup/v7-before-chat-sidebar` dalı eski sürüme dönüş içindir.

## V9 — Ortalanmış arena ve serbest sohbet

- Oyun alanı masaüstünde ve mobilde ekranın ortasına yerleşir. Sohbet için arena genişliği veya yüksekliği azaltılmaz.
- Sol alttaki sohbet artık çerçevesiz, yarı saydam ve son beş mesajla sınırlıdır. Dar ekranlarda arenanın kenarına taşabilir.
- Tam ekran modunda mesaj gelmezse veya sohbet yazma penceresi kapandıktan **4 saniye** sonra sohbet kaybolur. Enter açar; Enter gönderip kapatır; Esc iptal eder.
- Oda sohbeti, Sen/O etiketleri, oyun kuralları, rövanş ve diğer kontroller korunur.
- Geri dönüş için `backup/v8-before-centered-chat` dalı.

## Three.js 3D Arena — staging only

The original game rules, 1000×562 logical coordinate system, hitboxes, movement, physics,
rounds, upgrades, rooms and host-authoritative WebSocket protocol are unchanged.
`public/arena3d.js` is a visual-only renderer using an orthographic isometric camera.
It uses the same `game` state rendered by the original Canvas 2D renderer and maps
mouse pointers to the 2D gameplay floor using a ray/plane intersection.
If WebGL/Three.js is unavailable, the original 2D renderer remains the fallback.

* Production: `main` → https://bomba-sende.onrender.com
* Staging: `feature/3d-arena` → https://bomba-sende-3d-test.onrender.com
* Staging is a separate Render Node web service: rooms on the two sites are independent.
* Run locally with Node 22+: `npm install && npm test && npm start`.
* Test both a solo bot game and a two-browser online room on staging before merging.
* Do **not** merge this branch into `main` until the owner explicitly approves launch.

The 3D renderer's first implementation uses procedural models: stylized animated
humans, raised obstacles, feature meshes, bomb/trail, pickups, player labels,
projectile effects, glow rails, ambient lighting and dynamic shadows.
It adds no gameplay actions or rules.
