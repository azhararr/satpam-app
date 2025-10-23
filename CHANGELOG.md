# Changelog - Satpam Reporter PWA

## Version 1.0.0 (2025-10-23)

### 🔒 MAJOR SECURITY UPDATE - GPS STRICT MODE
### 🎨 UI/UX REDESIGN - NATIVE MOBILE APP LOOK

#### ✅ Added

**Security Features:**
- **Version watermark** di pojok kiri atas foto (v1.0.0 dalam hijau)
- **GPS akurasi indicator** pada watermark (menampilkan ±Xm)
- **Retry mechanism** untuk GPS (otomatis retry 2x jika timeout/akurasi buruk)
- **GPS validation** - menolak akurasi GPS >100m
- **Error messages lebih informatif** dengan solusi spesifik
- **Version tracking** di manifest.json
- **GPS pre-check** sebelum membuka kamera
- **Camera error handling** yang lebih detail

**UI/UX Features:**
- **Auto-start camera** - Camera langsung aktif saat pilih nama satpam
- **Native mobile design** - Full-screen camera seperti app native
- **Big capture button** - Tombol capture bulat besar putih (80px) seperti Instagram/Camera
- **Circular action buttons** - Semua tombol berbentuk bulat dengan icon
- **Full-width toast notification** - Notifikasi full-width di paling atas layar
- **Glassmorphism effects** - Backdrop blur dan transparency untuk modern look
- **Smooth animations** - Pulse animation pada tombol capture, fade-in transitions
- **Dark theme** - Background hitam penuh untuk fokus pada foto
- **Gradient overlays** - Gradient di bottom untuk kontras tombol
- **Responsive safe areas** - Support untuk notch di iPhone X+

#### 🚨 Changed (BREAKING)

**Security Changes:**
- **NO FALLBACK LOCATION**: Jika GPS gagal mendapatkan lokasi, foto **TIDAK BISA diambil**
- **NO FAKE LOCATION**: Jika gagal mendapat nama lokasi dari OpenStreetMap, foto **GAGAL TOTAL**
- **GPS timeout diperpanjang**: Dari 10 detik → 30 detik
- **Reverse geocoding lebih strict**: Harus dapat nama lokasi valid atau reject
- **Geocoding zoom level**: Dari default → 18 (street-level precision)
- **User-Agent** untuk Nominatim API diperbaiki sesuai best practice
- **Internet REQUIRED**: App sekarang WAJIB punya internet untuk geocoding

**UI/UX Changes:**
- **Auto-start workflow**: Tidak ada lagi tombol "Ambil Foto" di awal - langsung buka camera
- **Full-screen layout**: Camera dan preview menggunakan seluruh layar (100vh)
- **Bottom controls**: Tombol-tombol di bottom dengan gradient overlay
- **Icon-only buttons**: Tombol menggunakan emoji/icon tanpa text
- **Toast position**: Notifikasi pindah dari center ke top full-width
- **Color scheme**: Dari light theme → dark theme (black background)

#### 🔧 Fixed
- Fallback "Cendekia Leadership School" **DIHAPUS** (security risk)
- GPS retry pada timeout error
- GPS retry pada akurasi buruk (>100m)
- Error messages memberikan context yang lebih baik
- Camera error handling lebih specific per error type

#### 📝 Technical Details
**GPS Configuration:**
- High accuracy mode: `enabled`
- Timeout: `30000ms` (30 seconds)
- Max retries: `2`
- Max acceptable accuracy: `±100m`
- Maximum age: `0` (always fresh)

**Geocoding (OpenStreetMap):**
- User-Agent: `SatpamReporter-CendekiaLeadershipSchool/1.0 (Security App)`
- Language: `Indonesian (id)`
- Zoom level: `18` (street-level)
- Priority: road → suburb → neighbourhood → city
- No fallback to fake data

**Watermark Layout:**
- Version: Pojok kiri atas (hijau)
- School name: Pojok kanan atas
- Info box: Pojok kiri bawah (time, date, location, GPS, accuracy)
- Satpam & ID: Pojok kanan bawah

**UI Design Specs:**
- **Capture Button**: 80px circle, white, pulse animation
- **Secondary Buttons**: 60px circles, glassmorphism
- **Toast**: Full-width top bar, 3px bottom border
- **Camera View**: Full-screen, object-fit: cover
- **Preview View**: Full-screen, object-fit: contain
- **Color Palette**: 
  - Background: #000 (black)
  - Primary: #4CAF50 (green)
  - Error: #e74c3c (red)
  - Warning: #FFC107 (yellow)
  - WhatsApp: #25D366 (green)

#### ⚠️ Migration Notes
**Untuk user yang sudah pakai versi lama:**

1. **GPS harus aktif** - Versi lama mungkin masih bisa ambil foto tanpa GPS (fallback). Versi 1.0.0 TIDAK BISA.

2. **Internet wajib** - Versi lama bisa ambil foto offline (fallback ke nama sekolah). Versi 1.0.0 TIDAK BISA tanpa internet.

3. **Area terbuka** - GPS harus akurasi ≤100m. Di dalam gedung mungkin gagal terus.

4. **Version watermark** - Foto dari versi lama tidak ada tulisan "v1.0.0", mudah terdeteksi.

5. **Clear cache** - Setelah deploy, user harus clear cache browser atau force reload (Ctrl+Shift+R) untuk dapat versi baru.

#### 🎯 Why These Changes?

**Problem sebelumnya:**
- Satpam bisa ambil foto di mana saja, lalu claim lokasi "Cendekia Leadership School" (fake)
- Tidak ada validasi GPS akurasi
- Tidak ada cara mendeteksi app versi lama vs baru
- GPS timeout terlalu singkat, sering gagal

**Solution:**
- NO FALLBACK = GPS harus valid atau foto GAGAL
- Nama lokasi harus real dari OpenStreetMap
- Version watermark mencegah penggunaan app lama
- Retry mechanism meningkatkan success rate GPS
- Akurasi GPS ditampilkan untuk transparency

---

**Breaking Changes**: ⚠️ Yes
**Backward Compatible**: ❌ No
**Requires Re-deployment**: ✅ Yes
**Requires User Re-install**: ❌ No (PWA auto-update)

