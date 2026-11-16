// Tempel di Google Sheet: Extensions > Apps Script. Deploy > New deployment > Web app
// (Execute as: Me, Who has access: Anyone). Salin URL-nya ke formEndpoint di data/config.js.
// Setiap kali kode ini diubah, buat versi baru: Deploy > Manage deployments > pensil > Version: New version > Deploy.
//
// Data masuk ke dua tempat:
//  - Tab "Konfirmasi Kehadiran" (dibuat otomatis): satu baris per NIK. Isian ulang dengan NIK yang sama memperbarui barisnya.
//  - Tab pertama di Sheet: usulan acara dan pendaftaran pengisi acara, satu baris per isian.

const RSVP_SHEET = "Konfirmasi Kehadiran";
const RSVP_COLUMNS = ["waktu", "nik", "nama", "departemen", "shift", "hadir", "saran"];
const OTHER_COLUMNS = ["waktu", "tipe", "nama", "kategori", "ide", "kontak", "jenis", "durasi", "deskripsi"];

// Kosongkan jika skrip dibuat dari menu Extensions > Apps Script di dalam Sheet.
// Jika skrip berdiri sendiri (script.google.com), isi dengan ID Sheet (bagian antara /d/ dan /edit di URL Sheet).
const SPREADSHEET_ID = "";

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function spreadsheet_() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

// Isian orang lain masuk ke Sheet, jadi cegah sel yang dibaca sebagai rumus.
function clean_(v) {
  const s = (v || "").toString().slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function rsvpSheet_() {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(RSVP_SHEET);
  if (!sh) {
    sh = ss.insertSheet(RSVP_SHEET);
    sh.appendRow(RSVP_COLUMNS);
  }
  return sh;
}

// Buka URL /exec di browser: {"ok":true,...} berarti deployment dan akses sudah benar.
// "hadir" = jumlah NIK yang menjawab "Ya" (dipakai untuk penghitung di halaman undangan).
function doGet() {
  try {
    const sh = rsvpSheet_();
    const last = sh.getLastRow();
    let hadir = 0;
    if (last > 1) {
      hadir = sh.getRange(2, RSVP_COLUMNS.indexOf("hadir") + 1, last - 1, 1).getValues()
        .filter(r => r[0] === "Ya").length;
    }
    return json_({ ok: true, service: "sjwtss-gathering-form", hadir: hadir });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const p = e.parameter;
    if (p.tipe === "rsvp") {
      const sh = rsvpSheet_();
      const row = RSVP_COLUMNS.map(c => clean_(p[c]));
      const nik = (p.nik || "").toString().trim().toLowerCase();
      if (!nik) return json_({ ok: false, error: "NIK kosong" });
      const last = sh.getLastRow();
      let target = -1;
      if (last > 1) {
        const niks = sh.getRange(2, 2, last - 1, 1).getValues();
        for (let i = 0; i < niks.length; i++) {
          if (niks[i][0].toString().trim().toLowerCase() === nik) { target = i + 2; break; }
        }
      }
      if (target > 0) sh.getRange(target, 1, 1, row.length).setValues([row]);
      else sh.appendRow(row);
    } else {
      const sh = spreadsheet_().getSheets()[0];
      if (sh.getLastRow() === 0) sh.appendRow(OTHER_COLUMNS);
      sh.appendRow(OTHER_COLUMNS.map(c => clean_(p[c])));
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
