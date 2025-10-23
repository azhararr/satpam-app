# ⚡ Quick Start Guide

## 🎯 Untuk Satpam (User)

### Install App:
1. Buka link yang diberikan di browser HP (Chrome/Safari)
2. Klik menu (⋮) → **"Add to Home Screen"**
3. Icon "Satpam Reporter" muncul di home screen

### Cara Pakai:
1. Buka app dari icon
2. **Pilih nama** dari dropdown
3. Klik **"📷 Ambil Foto"**
4. Izinkan akses kamera & GPS (pertama kali)
5. Arahkan kamera & klik **"✓ Capture"**
6. Review foto (ada watermark otomatis)
7. Klik **"📤 Kirim ke WhatsApp"**
8. Pilih kontak/grup → Kirim!

---

## 🛠️ Untuk Admin (Deploy)

### Cara Tercepat - GitHub Pages:

1. **Login GitHub** → Buat repository baru
2. **Upload semua file** dari folder `satpam-app`
3. **Settings** → **Pages** → Enable
4. **Dapatkan link** (contoh: https://username.github.io/satpam-app)
5. **Share link** ke satpam

Total waktu: **5-10 menit**

### Alternatif - Netlify (Lebih Mudah):

1. **Login Netlify** (www.netlify.com)
2. **Drag & drop** folder `satpam-app`
3. **Dapatkan link** otomatis
4. **Share link** ke satpam

Total waktu: **2-3 menit**

---

## 📋 Checklist Deploy

- [ ] Upload semua 7 file (index.html, style.css, app.js, manifest.json, sw.js, + 2 icons)
- [ ] Enable HTTPS (otomatis di GitHub/Netlify)
- [ ] Test di HP: buka link
- [ ] Test camera access
- [ ] Test GPS location
- [ ] Test capture & watermark
- [ ] Test share to WhatsApp
- [ ] Install app di home screen
- [ ] Share link ke semua satpam

---

## 🎨 Kustomisasi (Optional)

### Ganti Nama Satpam:
Edit `index.html` → cari `<select id="satpamName">` → tambah/ubah nama

### Ganti Warna:
Edit `style.css` → ubah warna gradient di bagian atas

### Ganti Nama Sekolah:
Edit `app.js` → cari `'CENDEKIA LEADERSHIP SCHOOL'` → ganti

---

## ❓ FAQ

**Q: Apakah butuh server sendiri?**
A: Tidak! Pakai GitHub Pages/Netlify yang gratis.

**Q: Apakah foto tersimpan di server?**
A: Tidak. Foto hanya di HP satpam, langsung share ke WhatsApp.

**Q: Apakah bisa offline?**
A: Ya, tapi nama lokasi butuh internet (GPS tetap jalan).

**Q: Apakah bisa fake foto lama?**
A: Tidak bisa! Hanya bisa capture langsung dari kamera.

**Q: Berapa biaya?**
A: **100% GRATIS** (GitHub Pages/Netlify gratis selamanya).

---

## 🚨 Troubleshooting Cepat

| Problem | Solution |
|---------|----------|
| Camera tidak buka | Pastikan HTTPS aktif & izinkan permission |
| GPS tidak akurat | Tunggu beberapa detik, pastikan di area terbuka |
| Tidak bisa share | Install WhatsApp, atau foto akan auto download |
| Icon tidak muncul | Upload folder `icons/` dengan 2 file PNG |
| PWA tidak bisa install | Refresh browser, pastikan HTTPS aktif |

---

**Butuh bantuan lebih? Baca `DEPLOYMENT.md` atau `README.md`**
