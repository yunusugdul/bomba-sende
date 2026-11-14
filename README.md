# 💣 BOMBA SENDE! REMIX — Online V3.0

İki kişinin farklı bilgisayarlardan oda kodu veya davet bağlantısıyla oynayabildiği, tarayıcı tabanlı bomba düellosu.

## Oyuncu için

- **İndirip hemen denemek:** `BOMBA-SENDE-REMIX-V3-HEMEN-OYNA.html` dosyasına çift tıkla. Python/Node gerekmez. **Tek oyunculu bot denemesi** çalışır.
- **Arkadaşınla internetten oynamak:** Önce bu projeyi Render'da Web Service olarak yayımla. Ardından sitenin adresini aç, **ONLINE DÜELLO → ODA KUR** de, ortaya çıkan **oda kodunu veya bağlantıyı** arkadaşına gönder. Arkadaşın **KATIL** der. İki oyuncu bağlandığında oda sahibi **MAÇI BAŞLAT** seçeneğini kullanır.
- **Kontroller:** WASD hareket; SPACE basılı tut / bırak: nişan alıp at; SHIFT atıl; E savun/geri sektir; Q güç kartını kullan. Fareyle nişan alabilirsin. Mobilde sanal joystick ve dokunmatik eylem tuşları vardır.
- **Oyun ekranı:** Menü ve üst başlık gizlenir; oyun alanı tarayıcı yüksekliğine sığar. Kompakt skor şeridinin altında tüm genişlik boyunca yatay fitil barı vardır. `ⓘ BİLGİ` ile kontrol rehberi açılır.

## Proje yapısı

```
server.js       # Node.js HTTP + WebSocket oda sunucusu, ek paket gerektirmez
package.json    # Node.js >=22, npm start / npm test
render.yaml     # Render Blueprint (Free web service)
public/
  index.html    # Ana sayfa, online oda ve oyun ekranı
  style.css     # Düzen / mobil görünüm / animasyonlar
  game.js       # Bomba oynanışı, eşleştirme ve iki oyunculu senkronizasyon
test/
  server.test.js # İki oyunculu oda akışını sınayan otomatik test
```

## Render'da ücretsiz yayınlama

**Önemli:** Static Site değil, **Web Service** kullan. Çünkü iki oyuncunun eş zamanlı oyun iletişimi için WebSocket sunucusu çalışıyor.

1. Projeyi bir GitHub deposuna yükle. `server.js`, `package.json`, `render.yaml`, `public/` kök dizinde bulunmalı. ZIP'i GitHub'a tek bir dosya olarak yüklemek yeterli değildir; içindeki dosyaları çıkartıp eklemek gerekir.
2. https://dashboard.render.com/ adresinde **New → Web Service** bölümünü aç; GitHub deposunu seç. (Alternatif: repo bağlıyken New → Blueprint ile `render.yaml` kullan.)
3. Free planı seç. **Build Command:** `npm install --omit=dev` ve **Start Command:** `npm start`. **Health Check Path:** `/health`.
4. Deploy başarılı olunca Render'ın verdiği `https://...onrender.com` bağlantısından oyunu aç. İki farklı tarayıcıda veya cihazda oda oluşturup ikinci oyuncuyla katılmayı deneyin.

Node.js veya Python'ı kendi bilgisayarına kurmak zorunda değilsin: Render sunucuyu kendi ortamında çalıştırır.

### Ücretsiz planla ilgili notlar

- Render ücretsiz Web Service 15 dakika trafik yoksa uyur. Yeniden açılışta yaklaşık bir dakika bekleme olabilir.
- Sunucu yeniden başladığında **bellekte tutulan odalar ve devam eden maçlar sıfırlanır**; kodun yeniden oluşturulması gerekir.
- Eşleşmeler yalnızca iki kişi içindir. Oda sahibinin tarayıcısı fizik/süre hesaplamasını yapar; kapatırsa oyun geçici olarak durabilir veya yeniden maç başlatmak gerekebilir.
- Ücretsiz planın aylık kullanım ve bant genişliği sınırları vardır. Kişisel/hobi oyunları için tasarlanmıştır.

Render kaynakları: https://render.com/docs/free ve https://render.com/docs/web-services

## Geliştirici için (isteğe bağlı)

Node.js v22+ kurulu bir bilgisayarda:

```sh
npm test
npm start
```

Sonra `http://localhost:3000` adresini ziyaret et. Testler herhangi bir NPM bağımlılığı istemez. Oyun durumunu oda kurucu hesaplar ve misafire WebSocket üzerinden iletir; misafir hareket ve eylem girdilerini gönderir. Oda bağlanma tokenları tarayıcı sekmesine özel saklanır.

## Durum

Bu teslimatın tarayıcı ekranı ve oda protokolü yerel ortamda test edildi; **Render'da canlı dağıtım yapılmış olduğu iddia edilmiyor**. Canlı dağıtımdan sonra iki farklı cihazla uçtan uca testi öneriyoruz.

## V3.1 kontrol güncellemesi

- WASD: hareket; **sol fare tuşu** (basılı tut/bırak): şarj ve fırlat; **Space**: atılma.
- E: savunma, Q: kart. Dokunmatik cihazlarda ekrandaki butonlar kullanılabilir.
- Alt beceri kartları kompakt hale getirildi.