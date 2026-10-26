# End of Year Gathering SJWTSS 2026

Situs statis (HTML/CSS/JS, tanpa build) dengan countdown menuju 17 Desember 2026, galeri foto per tahun, dan form usul acara / daftar pengisi acara.

Coba lokal: `python3 -m http.server` lalu buka http://localhost:8000. Bisa di-deploy ke Vercel, Netlify, atau GitHub Pages apa adanya.

## Menambah foto galeri
Taruh foto di `assets/photos/<tahun>/` (misalnya `assets/photos/2025/`). Netlify membuat daftar galeri otomatis saat deploy (`scripts/build-gallery.js`), jadi tidak ada file lain yang perlu diedit. Format: jpg, jpeg, png, webp, avif. Tahun baru = folder baru bernama empat digit.

Lewat web GitHub: buka folder `assets/photos`, klik **Add file → Upload files**, seret foto, lalu **Commit changes** ke branch produksi. Untuk tahun baru, pilih **Create new file** dan ketik `2022/.gitkeep` sebagai nama, lalu unggah fotonya ke folder itu.

## Pengaturan lain
- **Jam acara** — `eventStart` dan `timeLabel` di `data/config.js`.
- **Foto hero** — ganti `assets/hero.jpg`.
- **Form** — `formEndpoint` di `data/config.js` berisi URL Google Apps Script (`apps-script/Code.gs`).
