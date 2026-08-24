# ⚡ Guns.lol Tarzı Gelişmiş Biolink & Admin Paneli

Guns.lol benzeri karanlık/neon cyberpunk estetiğine sahip, video/gif/görsel arka planlı, typewriter efektli, sıralanabilir ve özel logolu linkli, ziyaretçi sayaçlı ve tam donanımlı yönetici paneline sahip modern biolink uygulaması.

---

## 🚀 Hızlı Başlangıç

Projeyi başlatmak için aşağıdaki yöntemlerden birini kullanabilirsiniz:

### Yöntem 1: Çift Tıklama ile Başlatma
Klasör içindeki `start.bat` veya `start.ps1` dosyasını çalıştırın.

### Yöntem 2: Terminal / PowerShell ile Başlatma
```powershell
# Antigravity ortamında:
& "$env:APPDATA\Antigravity\bin\agy-node.cmd" server.js

# Veya sisteminizde genel Node.js yüklüyse:
node server.js
```

---

## 🌐 Erişim Adresleri

- **Biolink Sayfası**: [http://localhost:3000/](http://localhost:3000/)
- **Admin Paneli**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 🔑 Varsayılan Yönetici Bilgileri:
- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`
*(Admin panelinden dilediğiniz an şifrenizi değiştirebilirsiniz)*

---

## 🌟 Öne Çıkan Özellikler

1. **Guns.lol / Cyberpunk Karanlık Estetik**:
   - Cam morfolojisi (Glassmorphism), neon ışıltılar (glow) ve özel imleç izi (cursor trail).
   - "Click anywhere to enter" açılış perdesi ve otomatik arka plan müziği.
   - Kar, yıldızlar, ateşböceği veya siber yağmur parçacık animasyonları.

2. **Dinamik Medya & Arka Plan**:
   - Arka planda MP4/WebM video döngüsü, hareketli GIF veya yüksek çözünürlüklü görsel desteği.
   - Arka plan bulanıklığı (blur) ve karartma opaklığı (overlay) ayarları.
   - Bilgisayarınızdan doğrudan video/gif/görsel/müzik yükleme veya harici URL bağlama.

3. **Profil & Typewriter Efekti**:
   - Fotoğraf veya hareketli GIF profil avatarı + ayarlanabilir döner neon ışıma halkası.
   - Profil fotoğrafının hemen altında harf harf yazılıp silinen ayarlanabilir metin dizisi (Typewriter effect).
   - Özel rozetler (Doğrulanmış, VIP, Crown, Parıltı, Alev).

4. **Sosyal Medya & Özel Linkler (Sıralanabilir & Özel Logolu)**:
   - Discord, Spotify, Instagram, Telegram, GitHub, YouTube vb. hazır sosyal medya ikonları.
   - Özel logolu veya hareketli GIF'li özel link kartları (Başlık, alt başlık, hedef URL, tıklandığında neon parıltı).
   - **Sürükle-Bırak (Drag & Drop)** ile bağlantıların sırasını canlı olarak değiştirme.
   - Her bir bağlantının tıklanma sayısını anlık olarak kaydetme.

5. **Ziyaretçi Sayacı & Detaylı Analitik Dashboard**:
   - Toplam sayfa görüntüleme, tekil ziyaretçi ve toplam link tıklama metrikleri.
   - Son 7 günlük ziyaret grafiği (Chart.js).
   - En popüler / en çok tıklanan bağlantılar listesi.
   - İsteğe bağlı olarak biolink sayfasında ziyaretçi sayısı rozetini gösterme veya gizleme.

6. **Canlı Önizleme (Live Preview Frame)**:
   - Admin panelinde ayarları değiştirirken sağ taraftaki mobil önizleme ekranında anında yapılan değişiklikleri görme.

7. **Yedekleme & Güvenlik**:
   - Tek tıkla tüm profil ayarlarını ve linkleri JSON olarak dışa aktarma (Export) ve geri yükleme (Import).
   - Şifre değiştirme ve istatistikleri sıfırlama seçeneği.

---

## 🛠️ Mimari & Veritabanı

- **Sıfır Dış Bağımlılık (Zero External npm Dependencies)**: Node.js'in yerleşik `node:sqlite`, `node:http`, `node:crypto`, `node:fs` modüllerini kullanır. Ekstra kurulum veya paket indirme gerektirmeden hızlıca çalışır.
- **Veritabanı**: `data/biolink.db` (SQLite).
- **Yüklemeler**: `uploads/` dizininde saklanır.
