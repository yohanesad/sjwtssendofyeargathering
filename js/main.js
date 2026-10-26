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
  function selectForm(name) {
    document.querySelectorAll(".choice").forEach(c => {
      const on = c.dataset.form === name;
      c.classList.toggle("active", on);
      c.setAttribute("aria-selected", on);
    });
    $("#form-ide").hidden = name !== "ide";
    $("#form-tampil").hidden = name !== "tampil";
  }
  document.querySelectorAll(".choice").forEach(c => { c.onclick = () => selectForm(c.dataset.form); });
  document.querySelectorAll("[data-open]").forEach(a => { a.addEventListener("click", () => selectForm(a.dataset.open)); });

  document.querySelectorAll("form.card").forEach(form => {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const status = $(".status", form), btn = $("button[type=submit]", form);
      const data = Object.fromEntries(new FormData(form));
      data.tipe = form.dataset.type;
      data.waktu = new Date().toISOString();
      btn.disabled = true;
      status.className = "status"; status.textContent = "Mengirim…";
      try {
        if (cfg.formEndpoint) {
          const res = await fetch(cfg.formEndpoint, { method: "POST", body: new URLSearchParams(data) });
          const out = await res.json();
          if (!out.ok) throw new Error(out.error || "server menolak");
          status.textContent = "Terima kasih! Masukanmu sudah terkirim.";
        } else {
          const key = "sjwtss-demo-submissions";
          const list = JSON.parse(localStorage.getItem(key) || "[]");
          list.push(data); localStorage.setItem(key, JSON.stringify(list));
          status.textContent = "Mode demo: server belum disambungkan, jadi data hanya tersimpan di browser ini (belum sampai ke panitia).";
        }
        status.classList.add("ok");
        form.reset();
      } catch (err) {
        status.classList.add("err");
        console.error(err);
        status.textContent = "Gagal mengirim, data belum tersimpan. Coba lagi sebentar.";
      } finally {
        btn.disabled = false;
      }
    });
  });
})();
