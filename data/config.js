// Semua yang sering diubah ada di sini. Tidak perlu menyentuh index.html / main.js.
window.SITE_CONFIG = {
  eventName: "End of Year Gathering SJWTSS",
  // Jam mulai BELUM diberikan — ini asumsi 18:00 WIB. Ubah sesuai jam sebenarnya.
  eventStart: "2026-12-17T18:00:00+07:00",
  venue: "Sapa Cafe",
  dateLabel: "Kamis, 17 Desember 2026",
  timeLabel: "18.00 WIB (perkiraan)",

  // URL Google Apps Script Web App (lihat README.md & apps-script/Code.gs).
  // Kosong = form hanya menyimpan di browser pengunjung (mode demo).
  formEndpoint: "",

  // Galeri per tahun. Taruh file di assets/photos/<tahun>/ lalu daftarkan di sini.
  // Jika file gagal dimuat, kartu foto otomatis jatuh ke gambar placeholder.
  gallery: {
    2025: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg"],
    2024: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg"],
    2023: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg"]
  }
};
