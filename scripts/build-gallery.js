// Membuat data/gallery.json dari isi folder assets/photos/<tahun>/.
// Dijalankan Netlify saat deploy (lihat netlify.toml); bisa juga dijalankan manual: node scripts/build-gallery.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const photosDir = path.join(root, "assets", "photos");
const exts = /\.(jpe?g|png|webp|avif)$/i;

const gallery = {};
for (const entry of fs.readdirSync(photosDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || !/^\d{4}$/.test(entry.name)) continue;
  const files = fs.readdirSync(path.join(photosDir, entry.name)).filter(f => exts.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length) gallery[entry.name] = files;
}

fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(path.join(root, "data", "gallery.json"), JSON.stringify(gallery, null, 2) + "\n");
const total = Object.values(gallery).reduce((n, f) => n + f.length, 0);
console.log(`gallery.json: ${Object.keys(gallery).length} tahun, ${total} foto`);
