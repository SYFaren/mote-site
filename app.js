(function () {
  var cfg = window.MOTE_SITE || {};
  var owner = cfg.owner || "SYFaren";
  var repo = cfg.repo || "mote";
  var siteRepo = cfg.siteRepo || "mote-site";
  var base = "https://github.com/" + owner + "/" + repo;
  var site = "https://github.com/" + owner + "/" + siteRepo;
  var api = "https://api.github.com/repos/" + owner + "/" + repo + "/releases/latest";

  var I18N = {
    ru: {
      tag: "крошечный редактор · SYFaren",
      nav_try: "Онлайн",
      nav_dl: "Скачать",
      nav_shots: "Скриншоты",
      hero_title: "Один C89‑core — много платформ",
      hero_lead:
        "Linux, Windows, DOS и браузер. Оверлей выбирается при сборке; ядро остаётся общим и компактным.",
      cta_dl: "Скачать",
      cta_rel: "Releases",
      try_title: "Онлайн‑редактор",
      try_hint: "Тот же mote, собранный в WebAssembly.",
      try_start: "Запустить",
      try_full: "Отдельная вкладка",
      dl_title: "Скачать",
      dl_hint: "Выберите систему — покажем только нужные файлы из GitHub Releases.",
      linux_h: "Linux / Unix",
      linux_p: "X11, Wayland, SDL2, консоль TTY и framebuffer.",
      win_h: "Windows",
      win_p: "GDI‑окно и отдельная консольная сборка.",
      dos_h: "DOS",
      dos_p: "FreeDOS / DOSBox, сборка DJGPP, текстовый VGA.",
      web_h: "WebAssembly",
      web_p: "Один архив mote-web.zip: распакуйте и откройте mote.html через локальный HTTP‑сервер.",
      zip_note: "Или всё сразу по папкам:",
      loading: "Загрузка релизов…",
      gal_title: "Скриншоты",
      gal_hint: "По одному кадру на бэкенд выбранной системы. Нажмите, чтобы увеличить.",
      site_src: "исходники сайта",
      real_shots: "реальные скриншоты",
      close: "[ закрыть ]",
      no_assets: "Для этой системы в релизе пока нет файлов.",
      open_rel: "Открыть Releases",
      all_zip: "★ Все платформы (zip)",
      web_zip: "★ WebAssembly (zip)",
      checksums: "Контрольные суммы SHA256",
      packed: "упакованный",
      fetch_err: "Не удалось загрузить релиз."
    },
    en: {
      tag: "tiny multi-platform editor · SYFaren",
      nav_try: "Online",
      nav_dl: "Download",
      nav_shots: "Screenshots",
      hero_title: "One C89 core — many platforms",
      hero_lead:
        "Linux, Windows, DOS and the browser. Pick an overlay at build time; the core stays shared and tiny.",
      cta_dl: "Download",
      cta_rel: "Releases",
      try_title: "Online editor",
      try_hint: "The same mote, built as WebAssembly.",
      try_start: "Start",
      try_full: "Open in a tab",
      dl_title: "Download",
      dl_hint: "Pick an OS — we filter GitHub Release assets for you.",
      linux_h: "Linux / Unix",
      linux_p: "X11, Wayland, SDL2, TTY console and framebuffer.",
      win_h: "Windows",
      win_p: "GDI window plus a dedicated console build.",
      dos_h: "DOS",
      dos_p: "FreeDOS / DOSBox, DJGPP build, VGA text mode.",
      web_h: "WebAssembly",
      web_p: "One archive mote-web.zip: unpack and open mote.html via a local HTTP server.",
      zip_note: "Or everything in folders:",
      loading: "Loading releases…",
      gal_title: "Screenshots",
      gal_hint: "One frame per backend for the selected OS. Click to enlarge.",
      site_src: "site source",
      real_shots: "real screenshots",
      close: "[ close ]",
      no_assets: "No assets for this OS in the latest release yet.",
      open_rel: "Open Releases",
      all_zip: "★ All platforms (zip)",
      web_zip: "★ WebAssembly (zip)",
      checksums: "SHA256 checksums",
      packed: "packed",
      fetch_err: "Could not load the release."
    }
  };

  var GALLERY = {
    linux: [
      { src: "gallery/plat-linux-x11.png", title: "X11", cap_ru: "классическое окно", cap_en: "classic window" },
      { src: "gallery/plat-linux-wayland.png", title: "Wayland", cap_ru: "xdg-shell", cap_en: "xdg-shell" },
      { src: "gallery/plat-linux-sdl2.png", title: "SDL2", cap_ru: "портативный GUI", cap_en: "portable GUI" },
      { src: "gallery/plat-linux-console.png", title: "Console", cap_ru: "truecolor TTY", cap_en: "truecolor TTY" }
    ],
    windows: [
      { src: "gallery/plat-windows-gui.png", title: "GUI", cap_ru: "GDI окно", cap_en: "GDI window" },
      { src: "gallery/plat-windows-console.png", title: "Console", cap_ru: "ConHost (вид как TTY)", cap_en: "ConHost (TTY-like)" }
    ],
    dos: [
      { src: "gallery/plat-dos.png", title: "DOS", cap_ru: "VGA text", cap_en: "VGA text" }
    ],
    web: [
      { src: "gallery/plat-web-wasm.png", title: "WASM", cap_ru: "браузерная оболочка", cap_en: "browser shell" }
    ]
  };

  function $(id) { return document.getElementById(id); }
  function t(key) {
    var lang = document.body.getAttribute("data-lang") || "ru";
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = key ? t(key) : "";
      /* Skip missing keys so a stale build never paints "try_title" literally. */
      if (key && val && val !== key) el.textContent = val;
    });
    document.documentElement.lang = document.body.getAttribute("data-lang") || "ru";
    document.title = "mote — " + t("hero_title");
    renderGallery();
    if (window.__MOTE_RELEASE) renderAssets(window.__MOTE_RELEASE);
  }

  function setLang(lang) {
    document.body.setAttribute("data-lang", lang);
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem("mote-lang", lang); } catch (e) {}
    applyI18n();
  }

  function setOs(os) {
    document.body.setAttribute("data-os", os);
    document.querySelectorAll(".os-tab").forEach(function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-os") === os);
    });
    document.querySelectorAll(".os-panel").forEach(function (p) {
      p.hidden = p.getAttribute("data-panel") !== os;
    });
    try { localStorage.setItem("mote-os", os); } catch (e) {}
    renderGallery();
    if (window.__MOTE_RELEASE) renderAssets(window.__MOTE_RELEASE);
  }

  function fmtSize(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function assetOs(name) {
    var n = name.toLowerCase();
    if (n.indexOf("all-platforms") >= 0 || n === "sha256sums") return "all";
    if (n.indexOf("windows") >= 0 || /\.exe$/.test(n) && n.indexOf("dos") < 0) return "windows";
    if (n.indexOf("dos") >= 0) return "dos";
    if (n === "mote-web.zip" || n.indexOf(".wasm") >= 0 ||
        n === "mote.html" || n === "mote.js" || n === "mote.data")
      return "web";
    if (n.indexOf("linux") >= 0 || n.indexOf("wayland") >= 0 || n.indexOf("sdl") >= 0 ||
        n.indexOf("fbdev") >= 0 || n.indexOf("console") >= 0 && n.indexOf("win") < 0)
      return "linux";
    return "other";
  }

  function labelFor(name) {
    var n = name.toLowerCase();
    if (n.indexOf("all-platforms") >= 0) return t("all_zip");
    if (n === "mote-web.zip") return t("web_zip");
    if (n === "sha256sums") return t("checksums");
    if (n.indexOf("wayland") >= 0) return "Linux · Wayland";
    if (n.indexOf("sdl3") >= 0) return "Linux · SDL3";
    if (n.indexOf("sdl2") >= 0 || n.indexOf("sdl") >= 0) return "Linux · SDL2";
    if (n.indexOf("fbdev") >= 0) return "Linux · framebuffer";
    if (n.indexOf("x11") >= 0) return "Linux · X11";
    if (n.indexOf("console") >= 0 && n.indexOf("windows") < 0) return "Unix · console";
    if (n.indexOf("windows-gui") >= 0) return "Windows · GUI";
    if (n.indexOf("windows-console") >= 0) return "Windows · console";
    if (n.indexOf("dos") >= 0) return "DOS";
    if (n.indexOf("html") >= 0 || n.indexOf("wasm") >= 0 || n === "mote.js" || n === "mote.data")
      return "Web · " + name;
    if (n.indexOf("upx") >= 0) return name + " (" + t("packed") + ")";
    return name;
  }

  function rank(name) {
    var n = name.toLowerCase();
    if (n.indexOf("all-platforms") >= 0) return 0;
    if (n === "mote-web.zip") return 2;
    if (n === "sha256sums") return 3;
    if (n.indexOf("upx") >= 0) return 80;
    return 10;
  }

  function renderAssets(release) {
    var box = $("assets");
    var os = document.body.getAttribute("data-os") || "linux";
    box.innerHTML = "";
    if (!release || !release.assets || !release.assets.length) {
      box.innerHTML =
        '<p class="err">' + t("no_assets") +
        ' <a href="' + base + '/releases">' + t("open_rel") + "</a></p>";
      return;
    }
    var head = document.createElement("p");
    head.className = "hint";
    head.innerHTML =
      '<a href="' + base + "/releases/tag/" + encodeURIComponent(release.tag_name) + '">' +
      release.tag_name + "</a>";
    box.appendChild(head);

    var list = release.assets.filter(function (a) {
      var o = assetOs(a.name);
      return o === os || o === "all";
    }).sort(function (a, b) {
      return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name);
    });

    if (!list.length) {
      box.innerHTML += '<p class="err">' + t("no_assets") + "</p>";
      return;
    }

    list.forEach(function (a) {
      var row = document.createElement("div");
      row.className = "asset";
      if (a.name.toLowerCase().indexOf("all-platforms") >= 0 ||
          a.name.toLowerCase() === "mote-web.zip") row.className += " asset-star";
      row.innerHTML =
        "<div><div class=\"name\">" + labelFor(a.name) + "</div>" +
        "<div class=\"meta\">" + a.name + " · " + fmtSize(a.size) + "</div></div>" +
        '<a class="btn" download="' + a.name + '" href="' + a.browser_download_url + '">' +
        t("cta_dl") + "</a>";
      box.appendChild(row);
    });
  }

  function renderGallery() {
    var grid = $("gallery-grid");
    var os = document.body.getAttribute("data-os") || "linux";
    var lang = document.body.getAttribute("data-lang") || "ru";
    var items = GALLERY[os] || [];
    grid.innerHTML = "";
    items.forEach(function (it) {
      var card = document.createElement("a");
      card.className = "shot-card shot";
      card.href = it.src;
      card.setAttribute("data-cap", "mote — " + it.title);
      card.innerHTML =
        '<span class="frame"><img src="' + it.src + '" alt="' + it.title + '" /></span>' +
        '<div class="cap"><b>' + it.title + "</b>" +
        (lang === "ru" ? it.cap_ru : it.cap_en) + "</div>";
      card.addEventListener("click", function (e) {
        e.preventDefault();
        openLb(it.src, "mote — " + it.title);
      });
      grid.appendChild(card);
    });
  }

  var lb = $("lightbox");
  var lbImg = $("lb-img");
  var lbCap = $("lb-cap");
  function openLb(href, cap) {
    lbImg.src = href;
    lbCap.textContent = cap || "";
    lb.hidden = false;
  }
  function closeLb(e) {
    if (e) e.preventDefault();
    lb.hidden = true;
    lbImg.src = "";
  }

  $("gh-link").href = base;
  $("gh-releases").href = base + "/releases/latest";
  $("gh-site").href = site;
  $("lb-close").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lb.hidden) closeLb();
  });

  (function setupTry() {
    var btn = $("try-start");
    var wrap = $("try-wrap");
    if (!btn || !wrap) return;
    btn.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.className = "try-frame";
      frame.title = "mote wasm";
      frame.src = "play/mote.html";
      frame.allow = "autoplay";
      wrap.innerHTML = "";
      wrap.appendChild(frame);
    });
  })();

  document.querySelectorAll(".lang-btn").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  document.querySelectorAll(".os-tab").forEach(function (b) {
    b.addEventListener("click", function () { setOs(b.getAttribute("data-os")); });
  });

  var savedLang = "ru";
  var savedOs = "linux";
  try {
    savedLang = localStorage.getItem("mote-lang") || savedLang;
    savedOs = localStorage.getItem("mote-os") || savedOs;
  } catch (e) {}
  setLang(savedLang);
  setOs(savedOs);

  fetch(api, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (rel) {
      window.__MOTE_RELEASE = rel;
      renderAssets(rel);
    })
    .catch(function () {
      $("assets").innerHTML =
        '<p class="err">' + t("fetch_err") +
        ' <a href="' + base + '/releases/latest">' + t("open_rel") + "</a></p>";
    });
})();
