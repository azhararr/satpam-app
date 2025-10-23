# 🚀 Panduan Deploy PWA Satpam Reporter

## Opsi 1: GitHub Pages (Recommended - Gratis & Mudah)

### Step-by-step:

1. **Buat GitHub Account** (jika belum punya)
   - Kunjungi: https://github.com
   - Sign up gratis

2. **Buat Repository Baru**
   - Klik tombol hijau "New" atau "+"
   - Repository name: `satpam-app`
   - Pilih "Public"
   - Jangan centang "Add README"
   - Klik "Create repository"

3. **Upload Files**
   - Di halaman repository yang baru dibuat
   - Klik "uploading an existing file"
   - Drag & drop semua file dari folder `satpam-app`:
     ```
     index.html
     style.css
     app.js
     manifest.json
     sw.js
     icons/icon-192.png
     icons/icon-512.png
     ```
   - Klik "Commit changes"

4. **Enable GitHub Pages**
   - Masuk ke tab "Settings" (di menu atas)
   - Klik "Pages" (di sidebar kiri)
   - Di "Source", pilih branch `main`
   - Folder: `/ (root)`
   - Klik "Save"
   - Tunggu 2-5 menit

5. **Dapatkan Link PWA**
   - Link akan muncul di bagian atas:
     ```
     https://USERNAME.github.io/satpam-app/
     ```
   - Contoh: https://sekolahcendekia.github.io/satpam-app/
   - Share link ini ke satpam

---

## Opsi 2: Netlify (Alternative - Gratis)

1. **Buat Account Netlify**
   - Kunjungi: https://www.netlify.com
   - Sign up gratis (bisa pakai GitHub account)

2. **Deploy via Drag & Drop**
   - Login ke Netlify Dashboard
   - Drag & drop folder `satpam-app` ke area deploy
   - Tunggu proses upload & deploy
   - Dapatkan link: `https://random-name.netlify.app`

3. **Custom Domain (Optional)**
   - Klik "Domain settings"
   - Ubah nama menjadi: `satpam-cendekia.netlify.app`

---

## Opsi 3: Vercel (Alternative - Gratis)

1. **Buat Account Vercel**
   - Kunjungi: https://vercel.com
   - Sign up gratis

2. **Import Project**
   - Klik "Add New..." → "Project"
   - Connect dengan GitHub (atau upload manual)
   - Deploy
   - Dapatkan link: `https://satpam-app.vercel.app`

---

## ✅ Setelah Deploy

### Test PWA:
1. Buka link di HP (Chrome/Safari)
2. Test camera access
3. Test GPS location
4. Test capture photo
5. Test share to WhatsApp

### Install di HP Satpam:
1. Buka link di browser
2. Klik menu → "Add to Home Screen"
3. Icon app muncul di home screen
4. Buka seperti app biasa

---

## 🔄 Update PWA (Jika Ada Perubahan)

### GitHub Pages:
1. Edit file di repository
2. Commit changes
3. Otomatis update dalam beberapa menit
4. Satpam refresh browser untuk update

### Netlify/Vercel:
1. Re-upload file atau push ke GitHub
2. Otomatis re-deploy
3. Update langsung

---

## 🆘 Troubleshooting Deploy

### "HTTPS required" error
- ✅ GitHub Pages otomatis HTTPS
- ✅ Netlify/Vercel otomatis HTTPS
- ❌ Jangan pakai HTTP biasa (tidak akan jalan)

### Camera tidak bisa akses
- Pastikan HTTPS aktif
- Izinkan permission di browser settings

### PWA tidak muncul "Add to Home Screen"
- Pastikan file manifest.json terupload
- Pastikan service worker (sw.js) terupload
- Refresh halaman beberapa kali
- Coba di Chrome/Safari mobile

### Icon tidak muncul
- Pastikan folder `icons/` terupload
- Check file icon-192.png dan icon-512.png ada

---

## 📞 Butuh Bantuan?

Kontak IT Support atau buka issue di GitHub repository.

---

**Selamat menggunakan Satpam Reporter PWA! 🎉**
