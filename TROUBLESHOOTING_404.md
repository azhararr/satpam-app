# 🔧 Troubleshooting 404 Error

## ❌ Masalah: PWA Install = 404 Error

Jika setelah install PWA di Android muncul error 404, ini disebabkan oleh:
- Service Worker cache path yang salah
- Manifest start_url yang salah

## ✅ SUDAH DIPERBAIKI!

File yang sudah diperbaiki:
- ✅ `manifest.json` - start_url menggunakan `./` (relative)
- ✅ `sw.js` - semua cache path menggunakan `./` (relative)

## 🚀 Cara Deploy yang Benar

### Opsi 1: GitHub Pages (Root Directory)

**✅ RECOMMENDED**: Deploy di root repository, bukan subdirectory

```
Repository: username.github.io
File structure:
├── index.html
├── style.css
├── app.js
├── manifest.json
├── sw.js
└── icons/
    ├── icon-192.png
    └── icon-512.png

URL: https://username.github.io/
```

**Langkah-langkah:**
1. Buat repository dengan nama: `username.github.io`
2. Upload semua file ke root repository
3. Settings → Pages → Enable dari branch `main`, folder `/ (root)`
4. Buka: `https://username.github.io/`

### Opsi 2: GitHub Pages (Subdirectory)

Jika ingin di subdirectory (contoh: `/satpam-app`), file sudah diperbaiki dengan relative path.

```
Repository: my-repo
File structure:
├── index.html
├── style.css
├── app.js
└── ... (semua file)

URL: https://username.github.io/my-repo/
```

**PENTING**: 
- Pastikan buka URL dengan trailing slash: `https://username.github.io/satpam-app/`
- Jangan: `https://username.github.io/satpam-app` (tanpa slash)

### Opsi 3: Netlify (Paling Mudah - No 404 Issues)

**✅ PALING RECOMMENDED** - Tidak ada masalah path!

1. Login ke netlify.com
2. Drag & drop folder `satpam-app`
3. Tunggu deploy selesai
4. Dapat URL: `https://random-name.netlify.app`
5. Install PWA → Langsung jalan!

**Keuntungan Netlify:**
- ✅ Otomatis handle semua path
- ✅ Tidak ada 404 error
- ✅ Custom domain gratis
- ✅ HTTPS otomatis
- ✅ Deploy < 2 menit

### Opsi 4: Vercel

Sama seperti Netlify, tidak ada masalah path:
1. Login vercel.com
2. Import project
3. Deploy
4. URL: `https://project-name.vercel.app`

## 🧪 Cara Test Sebelum Install

### Test 1: Buka di Browser
1. Buka URL PWA di Chrome mobile
2. Pastikan halaman muncul (tidak 404)
3. Test camera access
4. Test GPS

### Test 2: Check Service Worker
1. Buka Chrome DevTools (Desktop)
2. Application tab → Service Workers
3. Lihat status: harus "activated and running"

### Test 3: Check Manifest
1. Chrome DevTools → Application → Manifest
2. Lihat "Start URL" dan "Scope"
3. Pastikan tidak ada error

## 🔍 Debug 404 Error

### Step 1: Check Browser Console
1. Buka PWA di Chrome
2. Menu → More Tools → Developer Tools
3. Console tab
4. Lihat error message

### Step 2: Check Network Tab
1. DevTools → Network tab
2. Refresh halaman
3. Lihat request mana yang 404
4. Biasanya: `sw.js`, `manifest.json`, atau `icons/`

### Step 3: Verify File Paths
Buka di browser langsung:
- `https://your-url.com/index.html` → Harus jalan
- `https://your-url.com/sw.js` → Harus jalan
- `https://your-url.com/manifest.json` → Harus jalan
- `https://your-url.com/icons/icon-192.png` → Harus jalan

Jika ada yang 404, berarti file tidak terupload atau path salah.

## ✅ Solusi Cepat

### Jika Masih 404 Setelah Install:

1. **Uninstall PWA** dari Android
   - Long press icon → Uninstall atau App Info → Uninstall
   
2. **Clear Cache Browser**
   - Chrome → Settings → Privacy → Clear browsing data
   - Pilih "Cached images and files"
   - Clear data

3. **Re-install PWA**
   - Buka URL lagi di Chrome
   - Menu → Add to Home Screen
   - Install

4. **Atau... Deploy Ulang di Netlify**
   - Paling cepat & tidak ada masalah!

## 📝 Checklist Sebelum Deploy

- [ ] Semua file ada (12 files total)
- [ ] File structure benar (icons/ di subdirectory)
- [ ] Upload ke root repository atau Netlify
- [ ] Test URL di browser mobile dulu
- [ ] Check service worker activated
- [ ] Baru install PWA

## 💡 Tips

**Best Practice:**
1. **Gunakan Netlify/Vercel** → Tidak ada masalah path
2. Atau **GitHub Pages di root** (`username.github.io`)
3. Hindari GitHub Pages di subdirectory kecuali perlu

**Jika Tetap Bermasalah:**
- Screenshot error message
- Check browser console
- Atau gunakan Netlify (100% work!)

---

## 🎯 Summary

**Masalah 404 sudah diperbaiki dengan:**
- ✅ Relative paths di manifest.json (`./`)
- ✅ Relative paths di sw.js (`./`)

**Deploy Recommendation:**
1. 🥇 **Netlify** - Paling mudah, no issues
2. 🥈 **Vercel** - Sama mudahnya
3. 🥉 **GitHub Pages** (root) - username.github.io

**Files sudah siap pakai!** 🚀
