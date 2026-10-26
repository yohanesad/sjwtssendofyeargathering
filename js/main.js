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
  const PLACEHOLDER = "assets/hero-placeholder.svg";
  const years = Object.keys(cfg.gallery).sort((a, b) => b - a);
  const tabs = $("#year-tabs"), grid = $("#gallery");
  function showYear(y) {
    tabs.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.year === y));
    grid.replaceChildren(...cfg.gallery[y].map(f => {
      const src = `assets/photos/${y}/${f}`;
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Perbesar foto gathering ${y}`);
      const img = new Image();
      img.loading = "lazy";
      img.alt = `Gathering ${y}`;
      img.src = src;
      img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; };
      b.append(img);
      b.onclick = () => openLightbox(img.src, img.alt);
      return b;
    }));
  }
  years.forEach(y => {
    const t = document.createElement("button");
    t.className = "tab"; t.dataset.year = y; t.textContent = y; t.setAttribute("role", "tab");
    t.onclick = () => showYear(y);
    tabs.append(t);
  });
  if (years.length) showYear(years[0]);

  const lb = $("#lightbox");
  function openLightbox(src, alt) { $("img", lb).src = src; $("img", lb).alt = alt; lb.hidden = false; }
  lb.onclick = () => { lb.hidden = true; };
  document.addEventListener("keydown", e => { if (e.key === "Escape") lb.hidden = true; });

  // ---- Form ----
  document.querySelectorAll(".tab[data-form]").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".tab[data-form]").forEach(t => t.classList.toggle("active", t === tab));
      $("#form-ide").hidden = tab.dataset.form !== "ide";
      $("#form-tampil").hidden = tab.dataset.form !== "tampil";
    };
  });

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
