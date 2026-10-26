// Tempel di Google Sheet: Extensions > Apps Script. Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Salin URL-nya ke formEndpoint di data/config.js.
const COLUMNS = ["waktu", "tipe", "nama", "kategori", "ide", "kontak", "jenis", "durasi", "deskripsi"];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
  sheet.appendRow(COLUMNS.map(c => (e.parameter[c] || "").toString().slice(0, 1000)));
  return ContentService.createTextOutput("ok");
}
