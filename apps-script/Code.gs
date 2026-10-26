// Tempel di Google Sheet: Extensions > Apps Script. Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Salin URL-nya ke formEndpoint di data/config.js.
// Setiap kali kode ini diubah, buat deployment baru: Deploy > Manage deployments > Edit > New version.
const COLUMNS = ["waktu", "tipe", "nama", "kategori", "ide", "kontak", "jenis", "durasi", "deskripsi"];

// Kosongkan jika skrip dibuat dari menu Extensions > Apps Script di dalam Sheet.
// Jika skrip berdiri sendiri (script.google.com), isi dengan ID Sheet (bagian antara /d/ dan /edit di URL Sheet).
const SPREADSHEET_ID = "";

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Buka URL /exec di browser: jika muncul {"ok":true,...} berarti deployment dan akses sudah benar.
function doGet() {
  return json_({ ok: true, service: "sjwtss-gathering-form" });
}

function doPost(e) {
  try {
    const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
    sheet.appendRow(COLUMNS.map(c => (e.parameter[c] || "").toString().slice(0, 1000)));
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
