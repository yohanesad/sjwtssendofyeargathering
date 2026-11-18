(function () {
  const cfg = window.SITE_CONFIG;
  const $ = (s, el = document) => el.querySelector(s);

  document.querySelectorAll("[data-bind]").forEach(el => { el.textContent = cfg[el.dataset.bind] || ""; });

  // ---- Countdown ----
  const target = new Date(cfg.eventStart).getTime();
  const pad = n => String(n).padStart(2, "0");
  function tick() {
    const diff = target - Date.now();
    const msg = $("#live-msg");
    if (diff <= 0) {
      $("#countdown").hidden = true;
      msg.hidden = false;
      msg.textContent = Date.now() - target < 864e5 ? "Acara sedang berlangsung! 🎉" : "Terima kasih sudah hadir! Sampai jumpa tahun depan.";
      return;
    }
    const s = Math.floor(diff / 1000);
    $("#cd-d").textContent = Math.floor(s / 86400);
    $("#cd-h").textContent = pad(Math.floor(s % 86400 / 3600));
    $("#cd-m").textContent = pad(Math.floor(s % 3600 / 60));
    $("#cd-s").textContent = pad(s % 60);
    setTimeout(tick, 1000 - Date.now() % 1000);
  }
  tick();

  // ---- Galeri ----
  // Daftar foto dibuat otomatis dari folder assets/photos/<tahun>/ (scripts/build-gallery.js).
  const PLACEHOLDERS = ["1.svg", "2.svg", "3.svg", "4.svg", "5.svg", "6.svg"].map(f => `assets/placeholder/${f}`);
  const tabs = $("#year-tabs"), grid = $("#gallery");
  let gallery = {};

  // Di Netlify, thumbnail dikecilkan lewat Netlify Image CDN; jika tidak tersedia, pakai file asli.
  const thumb = src => `/.netlify/images?url=${encodeURIComponent("/" + src)}&w=720`;

  function photoButton(src, alt, small) {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Perbesar foto: " + alt);
    const img = new Image();
    img.loading = "lazy";
    img.alt = alt;
    let triedOriginal = !small;
    img.onerror = () => {
      if (!triedOriginal) { triedOriginal = true; img.src = src; }
    };
    img.src = small ? thumb(src) : src;
    b.append(img);
    b.onclick = () => openLightbox(src, alt);
    return b;
  }

  function showYear(y) {
    tabs.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.year === y));
    grid.replaceChildren(...gallery[y].map(f => photoButton(`assets/photos/${y}/${f}`, `Gathering ${y}`, true)));
  }

  function renderGallery() {
    const years = Object.keys(gallery).sort((a, b) => b - a);
    if (!years.length) {
      $("#gallery-note").hidden = false;
      grid.replaceChildren(...PLACEHOLDERS.map(src => photoButton(src, "Contoh foto", false)));
      return;
    }
    years.forEach(y => {
      const t = document.createElement("button");
      t.className = "tab"; t.dataset.year = y; t.textContent = y; t.setAttribute("role", "tab");
      t.onclick = () => showYear(y);
      tabs.append(t);
    });
    showYear(years[0]);
  }

  fetch("data/gallery.json", { cache: "no-store" })
    .then(r => (r.ok ? r.json() : {}))
    .catch(() => ({}))
    .then(data => { gallery = data || {}; renderGallery(); });

  const lb = $("#lightbox");
  function openLightbox(src, alt) { $("img", lb).src = src; $("img", lb).alt = alt; lb.hidden = false; }
  lb.onclick = () => { lb.hidden = true; };
  document.addEventListener("keydown", e => { if (e.key === "Escape") lb.hidden = true; });

  // ---- Form ----
  document.querySelectorAll("form.card").forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const status = $(".status", form), btn = $("button[type=submit]", form);
      const data = Object.fromEntries(new FormData(form));
      data.tipe = form.dataset.type;
      if (data.shift === "Lainnya" && data.shift_lain) data.shift = "Lainnya: " + data.shift_lain;
      delete data.shift_lain;
      if (data.tipe === "rsvp") {
        // Skrip penerima versi lama hanya mengenal kolom usulan/pengisi acara. Salin isian ke kolom itu juga
        // supaya tidak ada yang hilang; skrip versi baru mengabaikannya dan memakai kolom aslinya.
        Object.assign(data, { kontak: data.nik, kategori: data.departemen, jenis: data.shift, ide: data.saran, deskripsi: data.hadir });
      }
      data.waktu = new Date().toISOString();
      btn.disabled = true;
      status.className = "status"; status.textContent = "Mengirim…";
      try {
        if (cfg.formEndpoint) {
          const res = await fetch(cfg.formEndpoint, { method: "POST", body: new URLSearchParams(data) });
          const out = await res.json();
          if (!out.ok) throw new Error(out.error || "server menolak");
          status.textContent = form.dataset.success || "Terima kasih! Masukanmu sudah terkirim.";
        } else {
          const key = "sjwtss-demo-submissions";
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          list.push(data); localStorage.setItem(key, JSON.stringify(list));
          status.textContent = "Mode demo: server belum disambungkan, jadi data hanya tersimpan di browser ini (belum sampai ke panitia).";
        }
        status.classList.add("ok");
        form.reset();
        if (form.dataset.type === "rsvp") loadRsvpCount();
      } catch (err) {
        status.classList.add("err");
        console.error(err);
        status.textContent = "Gagal mengirim, data belum tersimpan. Coba lagi sebentar.";
      } finally {
        btn.disabled = false;
      }
    });
  });
  $("#dress-img").onclick = () => openLightbox("assets/dresscode.jpg", "Contoh dress code");

  // ---- Info acara: peta, kalender, bagikan ----
  const start = new Date(cfg.eventStart), end = new Date(cfg.eventEnd);
  const mapsQuery = encodeURIComponent(cfg.mapsQuery);
  $("#map").src = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;
  $("#btn-maps").href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const utc = d => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const title = `${cfg.eventName} 2026`;
  const place = `${cfg.venue}, ${cfg.city}`;
  $("#btn-gcal").href = "https://calendar.google.com/calendar/render?" + new URLSearchParams({
    action: "TEMPLATE", text: title, dates: `${utc(start)}/${utc(end)}`, location: place,
    details: `Undangan ${title}. Dress code: ${cfg.dressCode}. Konfirmasi kehadiran: ${cfg.siteUrl || location.href.split("#")[0]}`
  });

  $("#btn-ics").onclick = () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SJWTSS//Gathering 2026//ID", "BEGIN:VEVENT",
      `UID:sjwtss-gathering-2026@${location.hostname || "local"}`,
      `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`,
      `SUMMARY:${title}`, `LOCATION:${place}`,
      `DESCRIPTION:Undangan ${title}. Dress code: ${cfg.dressCode}`, "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "sjwtss-gathering-2026.ics";
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  $("#btn-share").onclick = async () => {
    const url = cfg.siteUrl || location.href.split("#")[0];
    const text = `Kamu diundang ke ${title}, ${cfg.dateLabel} pukul ${cfg.timeLabel} di ${place}. Dress code: ${cfg.dressCode}. Konfirmasi kehadiran di sini:`;
    const note = $("#share-status");
    try {
      if (navigator.share) { await navigator.share({ title, text, url }); return; }
      await navigator.clipboard.writeText(`${text} ${url}`);
      note.textContent = "Teks undangan dan link sudah disalin. Tinggal tempel di grup.";
    } catch (err) {
      if (err && err.name === "AbortError") return;
      note.textContent = "Salin link ini untuk dibagikan: " + url;
    }
  };

  // ---- Form konfirmasi: kolom shift "Lainnya" dan jumlah yang sudah hadir ----
  const shiftOther = $("#r-shift-lain");
  document.querySelectorAll('#form-rsvp input[name="shift"]').forEach(r => {
    r.addEventListener("change", () => {
      const other = $("#shift-other").checked;
      shiftOther.hidden = !other;
      shiftOther.required = other;
    });
  });
  $("#form-rsvp").addEventListener("reset", () => { shiftOther.hidden = true; shiftOther.required = false; });

  function loadRsvpCount() {
    if (!cfg.formEndpoint) return;
    fetch(cfg.formEndpoint, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (!d || !d.ok || !(d.hadir > 0)) return;
        const el = $("#rsvp-count");
        el.textContent = `${d.hadir} rekan sudah konfirmasi hadir. Kamu kapan?`;
        el.hidden = false;
      })
      .catch(() => {});
  }
  loadRsvpCount();
})();
