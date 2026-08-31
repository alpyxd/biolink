# alpay.fun — Cyber Glassmorphism Biolink

Guns.lol estetiğinden ilham alınarak geliştirilmiş; video/gif/görsel arka plan, müzik çalar, typewriter efekti, interaktif canvas parçacıkları ve tam donanımlı yönetici paneline sahip, sıfır harici bağımlılıklı (zero-dependency) kişisel biolink platformu.

---

## ⚡ Öne Çıkan Özellikler

### 🎨 Görsel & Arayüz (Frontend)
- **macOS Liquid Glass Kartı**: Ayarlanabilir arka plan bulanıklığı (`blur`) ve opaklık (`opacity`) ile modern cam morfolojisi.
- **Dinamik Arka Plan Motoru**: MP4 / WebM video döngüsü, hareketli GIF veya yüksek çözünürlüklü görsel desteği. Karartma opaklığı ve blur filtresi panelden yönetilebilir.
- **Gelişmiş Müzik Çalar**:
  - Dönen vinil / albüm kapağı animasyonu.
  - Canlı equalizer çubukları, şarkı/sanatçı künyesi ve ses kaydırıcısı.
  - Açılışta otomatik başlatma ve **varsayılan başlangıç ses seviyesi (%)** ayarı.
- **Typewriter (Daktilo) Efekti**: Profil başlığında harf harf yazılıp silinen metin dizisi. Hız, bekleme süresi ve döngü panelden düzenlenebilir.
- **Canvas Parçacık Motoru**:
  - ❄️ Kar / Işıltı (Snow & Twinkle)
  - 🌧️ Siber Yağmur (Cyber Rain)
  - 💻 Matrix Dijital Kod Akışı
  - 🔥 Neon Korlar & Ateşböcekleri (Fireflies)
  - 🪐 Kozmik Nebula & Yıldız Tozu
  - 💫 Akıcı Fare Neon İzi (Ribbon Cursor Trail)
- **Sosyal & Özel Bağlantılar**:
  - Marka orijinal renkleri veya tek renk modu.
  - Neon ışıma (glow) açma/kapama desteği.
  - Sürükle-bırak (drag & drop) ile canlı sıralama.

---

### 🛡️ Güvenlik & Mimari (Backend)
- **Zero External Dependencies**: Yalnızca Node.js yerleşik modülleri (`node:http`, `node:sqlite`, `node:crypto`, `node:fs`) ile çalışır. `npm install` gerektirmez.
- **Kriptografik Güvenlik**: PBKDF2-SHA512 + Salt ile şifreleme, `HttpOnly` & `SameSite=Strict` oturum çerezleri.
- **Brute-Force & Rate Limiting Koruması**: 5 başarısız giriş denemesinden sonra IP adresini 15 dakika boyunca otomatik olarak kilitler.
- **Güvenlik Denetim Günlüğü (Security Audit Log)**:
  - Hatalı ve başarılı tüm admin giriş denemelerini; IP adresi, kullanıcı adı, cihaz/tarayıcı (User-Agent) ve zaman damgasıyla kaydeder.
  - Yönetim panelinden canlı olarak izlenebilir ve temizlenebilir.
- **Dizin Aşımı (Path Traversal) Koruması**: Tüm dosya okuma ve yükleme işlemlerinde sıkı sınır (`isPathInside`) denetimi.
- **Akıllı Tıklama Filtresi (Click Deduplication)**: Admin oturumu ve canlı önizleme tıklamalarını filtreler; IP başına 15 dakikalık cooldown uygulayarak doğru analitik verisi sunar.
- **Bellek DoS Koruması**: Payload boyut sınırları (JSON: 2MB, Medya Yükleme: 25MB).

---

## 📁 Proje Yapısı

```text
guns-biolink/
├── data/
│   └── biolink.db         # SQLite veritabanı (WAL modunda çalışır)
├── public/
│   ├── css/
│   │   ├── style.css      # Ana biolink sayfası stilleri
│   │   └── admin.css      # Yönetici paneli stilleri
│   ├── js/
│   │   ├── app.js         # İstemci canvas, ses ve arayüz motoru
│   │   └── admin.js       # Yönetici paneli ve API etkileşimleri
│   ├── index.html         # Ziyaretçi arayüzü
│   └── admin.html         # Yönetim paneli arayüzü
├── uploads/               # Yerel yüklenen medya dosyaları
├── server.js              # Sıfır bağımlılıklı HTTP sunucusu & SQLite API
└── README.md
```

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js**: v22.0.0 veya üzeri (`node:sqlite` desteği için)

### Başlatma

1. Terminali proje klasöründe açın:
```bash
node server.js
```

2. Tarayıcınızda açın:
- **Biolink Sayfası**: `http://localhost:3000/`
- **Admin Paneli**: `http://localhost:3000/alpy`

---

## 🔑 Yönetici Girişi

| Alan | Varsayılan Değer |
| :--- | :--- |
| **Kullanıcı Adı** | `admin` |
| **Şifre** | `admin123` |
| **Panel Yolu** | `/alpy` |

> ⚠️ **Not**: İlk girişten sonra **Güvenlik & Yedekleme** sekmesine giderek varsayılan şifrenizi değiştirmeniz önerilir.

---

## ⚙️ Yönetim Paneli Sekmeleri

1. **Genel Bakış & İstatistikler**: Toplam sayfa görüntüleme, tekil ziyaretçi, popüler bağlantılar ve 7 günlük ziyaret grafiği (Chart.js).
2. **Profil Bilgileri**: Avatar, kullanıcı adı, biyografi, rozetler ve giriş ekranı metni.
3. **Arka Plan & Medya**: Video/GIF/Görsel seçimi, blur ve opaklık ayarları.
4. **Müzik & Ses**: MP3 yükleme, albüm kapağı, otomatik çalma ve başlangıç ses seviyesi (%).
5. **Typewriter Efekti**: Dinamik metin listesi ekleme/çıkarma, yazma ve silme hızları.
6. **Sosyal & Özel Bağlantılar**: İkon seçici, özel resimli link kartları, renk modları ve glow anahtarı.
7. **Tema & Görsel Efektler**: Vurgu rengi, cam kart ayarları, cursor trail ve 6 farklı canvas efekti.
8. **Güvenlik & Yedekleme**:
   - Şifre güncelleme.
   - Tüm ayarları ve linkleri tek tıkla JSON olarak dışa aktarma (Export) ve geri yükleme (Import).
   - Canlı Güvenlik Denetim Günlüğü tablosu (IP & Giriş denemeleri).
   - İstatistik sıfırlama.

---

## 📄 Lisans
Bu proje kişisel kullanım ve açık kaynak geliştirme amacıyla hazırlanmıştır. İstediğiniz gibi özelleştirebilir ve dağıtabilirsiniz.
