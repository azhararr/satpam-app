# 📸 Satpam Reporter PWA

Aplikasi Progressive Web App (PWA) untuk satpam Cendekia Leadership School melaporkan situasi dengan foto, GPS, dan watermark otomatis.

## ✨ Fitur

- ✅ **Camera Only** - Hanya bisa capture langsung, tidak bisa upload foto lama
- ✅ **GPS WAJIB** - ⚠️ **TIDAK ADA FALLBACK**: Jika GPS gagal, foto tidak bisa diambil
  - Timeout: 30 detik untuk GPS lock
  - Auto-retry: 2x percobaan ulang otomatis
  - Validasi akurasi: Maksimal ±100m
- ✅ **Watermark Otomatis** - Setiap foto memiliki:
  - **Versi App** (pojok kiri atas) - untuk memastikan app tidak usang
  - Nama sekolah: Cendekia Leadership School (pojok kanan atas)
  - Tanggal & waktu capture real-time
  - Nama lokasi (dari OpenStreetMap)
  - Koordinat GPS lengkap
  - **Akurasi GPS** (±Xm)
  - Nama satpam
  - ID laporan unik
- ✅ **Share ke WhatsApp** - Langsung kirim ke grup/kontak
- ✅ **Internet Required** - Diperlukan internet untuk nama lokasi dari OpenStreetMap
- ✅ **Install as App** - Bisa diinstall di home screen seperti app native

## 🚀 Cara Deploy ke GitHub Pages

### 1. Buat Repository GitHub

1. Login ke GitHub
2. Klik "New Repository"
3. Nama: `satpam-app` (atau nama lain)
4. Public
5. Jangan centang "Add README"
6. Create Repository

### 2. Upload Files

Upload semua file di folder `satpam-app` ke repository:
- `index.html`
- `style.css`
- `app.js`
- `manifest.json`
- `sw.js`
- `icons/icon-192.png`
- `icons/icon-512.png`

### 3. Enable GitHub Pages

1. Di repository, masuk ke **Settings**
2. Scroll ke **Pages** (di sidebar kiri)
3. Di **Source**, pilih `main` branch
4. Folder: `/ (root)`
5. Klik **Save**
6. Tunggu beberapa menit, akan muncul link:
   ```
   https://username.github.io/satpam-app/
   ```

## 📱 Cara Install di HP Satpam

### Android (Chrome):

1. Buka link PWA di Chrome
2. Klik menu (⋮) di kanan atas
3. Pilih **"Add to Home Screen"** atau **"Install App"**
4. Klik **Add**
5. Icon app muncul di home screen

### iOS (Safari):

1. Buka link PWA di Safari
2. Klik tombol **Share** (ikon kotak dengan panah)
3. Scroll dan pilih **"Add to Home Screen"**
4. Klik **Add**
5. Icon app muncul di home screen

## 📖 Cara Menggunakan

### 1. Pilih Nama Satpam
- Buka app
- Pilih nama dari dropdown

### 2. Ambil Foto
- Klik tombol **"📷 Ambil Foto"**
- Izinkan akses kamera dan GPS
- Arahkan kamera ke objek
- Klik tombol **"✓ Capture"**

### 3. Review & Kirim
- Lihat preview foto dengan watermark
- Klik **"📤 Kirim ke WhatsApp"**
- Pilih kontak/grup WhatsApp
- Kirim!

Atau klik **"↺ Ulang"** untuk foto ulang.

## ⚙️ Kustomisasi

### Ubah Nama Sekolah
Edit file `app.js`, cari dan ubah:
```javascript
ctx.fillText('CENDEKIA LEADERSHIP SCHOOL', padding, yPosition);
```

### Tambah/Ubah Nama Satpam
Edit file `index.html`, di bagian `<select id="satpamName">`:
```html
<option value="Nama Baru">Nama Baru</option>
```

### Ubah Warna Tema
Edit file `manifest.json`:
```json
"theme_color": "#1a73e8"
```

Edit file `style.css`, ubah warna di:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 🔒 Keamanan & Validasi

- ✅ **Camera Only** - Hanya bisa capture dari kamera, tidak bisa upload foto lama
- ✅ **GPS WAJIB** - Tidak ada fallback lokasi palsu, GPS harus berhasil atau foto gagal
- ✅ **GPS Validation** - Akurasi maksimal ±100m, jika lebih buruk akan retry
- ✅ **Real Location Name** - Nama lokasi dari OpenStreetMap (tidak bisa palsu)
- ✅ **Timestamp Real-time** - Tanggal & waktu dari device
- ✅ **Watermark Embedded** - Tidak bisa dihapus atau dimodifikasi
- ✅ **ID Laporan Unik** - Setiap foto memiliki ID unik
- ✅ **Version Tracking** - Watermark menampilkan versi app (mencegah penggunaan app lama)
- ✅ **Local Storage** - Foto tersimpan lokal di device, tidak di server

## 🛠️ Troubleshooting

### ❌ "Gagal mendapatkan lokasi GPS"
**PENYEBAB**: GPS tidak bisa lock atau timeout (30 detik)
**SOLUSI**:
- Pastikan GPS device aktif (Settings → Location → ON)
- Tunggu di tempat terbuka (tidak di dalam gedung)
- App akan retry otomatis 2x
- Jika tetap gagal, foto TIDAK BISA diambil (ini fitur keamanan)

### ❌ "Gagal mengambil nama lokasi dari server"
**PENYEBAB**: Tidak ada koneksi internet
**SOLUSI**:
- Pastikan ada koneksi internet (WiFi atau data seluler)
- GPS coordinates berhasil, tapi butuh internet untuk nama lokasi
- Tanpa nama lokasi, foto TIDAK BISA diambil (no fake location)

### ❌ "Akurasi GPS kurang baik (>100m)"
**PENYEBAB**: Sinyal GPS lemah
**SOLUSI**:
- Pindah ke area terbuka
- Tunggu beberapa detik untuk GPS stabilize
- App akan retry otomatis sampai akurasi ≤100m

### Kamera Tidak Bisa Dibuka
- Pastikan izin kamera sudah diberikan di browser
- Buka Settings → Permissions → Camera
- HTTPS wajib untuk akses kamera (GitHub Pages otomatis HTTPS)
- Jika kamera digunakan app lain, tutup dulu app tersebut

### Share ke WhatsApp Tidak Muncul
- Pastikan WhatsApp sudah terinstall
- Gunakan browser Chrome/Safari (default browser)
- Jika gagal, foto akan otomatis terdownload → kirim manual

### ⚠️ PENTING: Persyaratan App
1. **GPS HARUS AKTIF** - Tidak bisa ambil foto tanpa GPS
2. **INTERNET REQUIRED** - Diperlukan untuk nama lokasi
3. **IZIN KAMERA & LOKASI** - Harus diberikan ke browser
4. **HTTPS** - App harus diakses via HTTPS (otomatis di GitHub Pages)

## 📊 Spesifikasi Teknis

- **Framework**: Vanilla JavaScript (no dependencies)
- **Version**: 1.0.0 (displayed on watermark)
- **PWA**: Service Worker untuk offline capability
- **GPS**: Geolocation API (HTML5)
  - High accuracy mode
  - Timeout: 30 seconds
  - Max retries: 2x
  - Max accuracy: ±100m
- **Camera**: MediaDevices API (HTML5)
  - Back camera preferred
  - Resolution: 1920x1080 ideal
- **Geocoding**: OpenStreetMap Nominatim (gratis, HTTPS)
  - User-Agent: SatpamReporter-CendekiaLeadershipSchool/1.0
  - Language: Indonesian (id)
  - Zoom level: 18 (street level)
- **Share**: Web Share API (native)
- **Storage**: Local only (no backend, no database)

## 📝 Lisensi

MIT License - bebas digunakan untuk keperluan internal sekolah.

## 👨‍💻 Support

Untuk pertanyaan atau masalah, hubungi IT Support Cendekia Leadership School.

---

**Dibuat dengan ❤️ untuk Cendekia Leadership School**
