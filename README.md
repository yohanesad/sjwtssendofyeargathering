# End of Year Gathering SJWTSS 2026

Situs statis (HTML/CSS/JS, tanpa build) dengan countdown menuju 17 Desember 2026, galeri foto per tahun, dan form usul acara / daftar pengisi acara.

Coba lokal: `python3 -m http.server` lalu buka http://localhost:8000. Bisa di-deploy ke Vercel, Netlify, atau GitHub Pages apa adanya.

## Yang perlu kamu isi
1. **Jam acara** — `eventStart` di `data/config.js` (sementara 16:30 WIB).
2. **Foto hero** — simpan foto besar gathering tahun lalu sebagai `assets/hero.jpg`.
3. **Galeri** — taruh foto di `assets/photos/<tahun>/`, daftarkan nama file di `gallery` pada `data/config.js`. Tambah tahun baru dengan menambah key baru.
4. **Form** — sambungkan ke Google Sheet: ikuti komentar di `apps-script/Code.gs`, lalu isi `formEndpoint`. Selama kosong, data hanya tersimpan di browser pengunjung dan tidak sampai ke panitia.
