// Semua yang sering diubah ada di sini. Tidak perlu menyentuh index.html / main.js.
window.SITE_CONFIG = {
  eventName: "End of Year Gathering SJWTSS",
  // Jam mulai sementara 16:30 WIB. Ubah jika jam sebenarnya berbeda.
  eventStart: "2026-12-17T16:30:00+07:00",
  venue: "Sapa Cafe",
  dateLabel: "Kamis, 17 Desember 2026",
  timeLabel: "16.30 WIB",

  // URL Google Apps Script Web App (lihat README.md & apps-script/Code.gs).
  // Kosong = form hanya menyimpan di browser pengunjung (mode demo).
  formEndpoint: "https://script.google.com/macros/s/AKfycbx0wmMls9cdidIOoCf_7DegWaJOjV8YM17AYwixX61FSJPS4Xmsn4xrY_vEjI6wNs18jg/exec",

  // Galeri per tahun. Taruh file di assets/photos/<tahun>/ lalu daftarkan di sini.
  // Jika file gagal dimuat, kartu foto otomatis jatuh ke gambar placeholder.
  gallery: {
    2025: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg"],
    2024: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg"],
    2023: ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg"]
  }
};
