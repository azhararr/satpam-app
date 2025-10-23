# 📸 Satpam Reporter PWA

Aplikasi Progressive Web App (PWA) untuk satpam Cendekia Leadership School melaporkan situasi dengan foto, GPS, dan watermark otomatis.

## ✨ Fitur

- ✅ **Camera Only** - Hanya bisa capture langsung, tidak bisa upload foto lama
- ✅ **GPS Otomatis** - Lokasi terdeteksi otomatis dengan akurasi tinggi
- ✅ **Watermark Otomatis** - Setiap foto memiliki:
  - Nama sekolah: Cendekia Leadership School
  - Tanggal & waktu capture
  - Lokasi (dari OpenStreetMap)
  - Koordinat GPS
  - Nama satpam
  - ID laporan unik
- ✅ **Share ke WhatsApp** - Langsung kirim ke grup/kontak
- ✅ **Offline Ready** - Bisa digunakan tanpa internet (kecuali untuk nama lokasi)
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

## 🔒 Keamanan

- ✅ Hanya bisa capture dari kamera, tidak bisa upload foto lama
- ✅ GPS dan timestamp otomatis dari device
- ✅ Watermark embedded dalam foto (tidak bisa dihapus)
- ✅ ID laporan unik untuk setiap foto
- ✅ Foto tersimpan lokal di device, tidak di server

## 🛠️ Troubleshooting

### Kamera Tidak Bisa Dibuka
- Pastikan izin kamera sudah diberikan di browser
- Buka Settings → Permissions → Camera
- HTTPS wajib untuk akses kamera (GitHub Pages otomatis HTTPS)

### GPS Tidak Akurat
- Pastikan GPS device aktif
- Tunggu beberapa detik untuk GPS lock
- Gunakan di area terbuka untuk sinyal GPS lebih baik

### Lokasi Menampilkan "Lokasi tidak diketahui"
- Butuh koneksi internet untuk reverse geocoding
- Jika offline, akan fallback ke "Cendekia Leadership School"
- Koordinat GPS tetap tercatat

### Share ke WhatsApp Tidak Muncul
- Pastikan WhatsApp sudah terinstall
- Gunakan browser Chrome/Safari (default browser)
- Jika gagal, foto akan otomatis terdownload → kirim manual

## 📊 Spesifikasi Teknis

- **Framework**: Vanilla JavaScript (no dependencies)
- **PWA**: Service Worker untuk offline
- **GPS**: Geolocation API (HTML5)
- **Camera**: MediaDevices API (HTML5)
- **Geocoding**: OpenStreetMap Nominatim (gratis)
- **Share**: Web Share API (native)
- **Storage**: Local only (no backend)

## 📝 Lisensi

MIT License - bebas digunakan untuk keperluan internal sekolah.

## 👨‍💻 Support

Untuk pertanyaan atau masalah, hubungi IT Support Cendekia Leadership School.

---

**Dibuat dengan ❤️ untuk Cendekia Leadership School**
