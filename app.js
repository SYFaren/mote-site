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
        "Linux, Windows, macOS, FreeBSD, OpenBSD, DOS и браузер. Один core — разные оверлеи при сборке.",
      cta_dl: "Скачать",
      cta_packed: "UPX",
      cta_rel: "Releases",
      try_title: "Онлайн‑редактор",
      try_hint: "Тот же mote, собранный в WebAssembly.",
      try_start: "Запустить",
      try_full: "Отдельная вкладка",
      dl_title: "Скачать",
      dl_hint: "Выберите систему — покажем только нужные файлы из GitHub Releases.",
      linux_h: "Linux",
      linux_p: "X11, Wayland, SDL2, консоль TTY и framebuffer. Выберите CPU ниже.",
      macos_h: "macOS",
      macos_p: "Нативные сборки: TTY‑консоль и SDL2. Apple Silicon (arm64) в CI.",
      bsd_h: "BSD",
      freebsd_h: "FreeBSD",
      freebsd_p: "amd64: console, X11 и SDL2.",
      openbsd_h: "OpenBSD",
      openbsd_p: "amd64: console, X11 и SDL2.",
      bsd_flavor: "Дистрибутив:",
      win_h: "Windows",
      win_p: "GDI‑окно и отдельная консольная сборка. x86_64 и i686.",
      dos_h: "DOS",
      dos_p: "FreeDOS / DOSBox, сборка DJGPP, текстовый VGA.",
      web_h: "WebAssembly",
      web_p: "Архив mote-web.zip: распакуйте и откройте mote.html через локальный HTTP‑сервер.",
      zip_note: "Или всё сразу по папкам:",
      loading: "Загрузка релизов…",
      gal_title: "Скриншоты",
      gal_hint: "По одному кадру на бэкенд (Linux / Windows / DOS / Web).",
      gal_empty: "Скриншоты для этой системы пока не добавлены.",
      site_src: "исходники сайта",
      real_shots: "реальные скриншоты",
      close: "[ закрыть ]",
      no_assets: "Для этой системы в релизе пока нет файлов.",
      open_rel: "Открыть Releases",
      all_zip: "★ Все платформы (zip)",
      web_zip: "★ WebAssembly (zip)",
      checksums: "Контрольные суммы SHA256",
      packed: "UPX",
      fetch_err: "Не удалось загрузить релиз."
    },
    en: {
      tag: "tiny multi-platform editor · SYFaren",
      nav_try: "Online",
      nav_dl: "Download",
      nav_shots: "Screenshots",
      hero_title: "One C89 core — many platforms",
      hero_lead:
        "Linux, Windows, macOS, FreeBSD, OpenBSD, DOS and the browser. One core — pick an overlay at build time.",
      cta_dl: "Download",
      cta_packed: "UPX",
      cta_rel: "Releases",
      try_title: "Online editor",
      try_hint: "The same mote, built as WebAssembly.",
      try_start: "Start",
      try_full: "Open in a tab",
      dl_title: "Download",
      dl_hint: "Pick an OS — we filter GitHub Release assets for you.",
      linux_h: "Linux",
      linux_p: "X11, Wayland, SDL2, TTY console and framebuffer. Pick your CPU below.",
      macos_h: "macOS",
      macos_p: "Native console and SDL2 builds. Apple Silicon (arm64) from CI.",
      bsd_h: "BSD",
      freebsd_h: "FreeBSD",
      freebsd_p: "amd64: console, X11 and SDL2.",
      openbsd_h: "OpenBSD",
      openbsd_p: "amd64: console, X11 and SDL2.",
      bsd_flavor: "Flavor:",
      win_h: "Windows",
      win_p: "GDI window plus console build. x86_64 and i686.",
      dos_h: "DOS",
      dos_p: "FreeDOS / DOSBox, DJGPP build, VGA text mode.",
      web_h: "WebAssembly",
      web_p: "Archive mote-web.zip: unpack and open mote.html via a local HTTP server.",
      zip_note: "Or everything in folders:",
      loading: "Loading releases…",
      gal_title: "Screenshots",
      gal_hint: "One frame per backend (Linux / Windows / DOS / Web).",
      gal_empty: "No screenshots for this OS yet.",
      site_src: "site source",
      real_shots: "real screenshots",
      close: "[ close ]",
      no_assets: "No assets for this OS in the latest release yet.",
      open_rel: "Open Releases",
      all_zip: "★ All platforms (zip)",
      web_zip: "★ WebAssembly (zip)",
      checksums: "SHA256 checksums",
      packed: "UPX",
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
      { src: "gallery/plat-windows-console.png", title: "Console", cap_ru: "ConHost", cap_en: "ConHost" }
    ],
    dos: [{ src: "gallery/plat-dos.png", title: "DOS", cap_ru: "VGA text", cap_en: "VGA text" }],
    web: [{ src: "gallery/plat-web-wasm.png", title: "WASM", cap_ru: "браузер", cap_en: "browser" }]
  };

  var BACKEND_LABEL = {
    console: { ru: "консоль TTY", en: "TTY console" },
    x11: { ru: "X11 GUI", en: "X11 GUI" },
    sdl: { ru: "SDL2 GUI", en: "SDL2 GUI" },
    sdl2: { ru: "SDL2 GUI", en: "SDL2 GUI" },
    wayland: { ru: "Wayland", en: "Wayland" },
    fbdev: { ru: "framebuffer", en: "framebuffer" },
    gui: { ru: "GUI (GDI)", en: "GUI (GDI)" },
    winconsole: { ru: "консоль", en: "console" }
  };

  var OS_LABEL = {
    linux: "Linux",
    macos: "macOS",
    freebsd: "FreeBSD",
    openbsd: "OpenBSD",
    windows: "Windows",
    dos: "DOS"
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
    var archRow = $("arch-row");
    if (archRow) {
      archRow.hidden = os !== "linux" && os !== "windows";
      archRow.setAttribute("data-for", os);
    }
    var bsdRow = $("bsd-row");
    if (bsdRow) bsdRow.hidden = os !== "bsd";
    document.querySelectorAll(".arch-tab").forEach(function (b) {
      var forOs = b.getAttribute("data-for-os");
      b.hidden = forOs && forOs !== os;
    });
    if (os === "windows") {
      var cur = document.body.getAttribute("data-arch") || "amd64";
      if (cur !== "amd64" && cur !== "i686") setArch("amd64");
    }
    try { localStorage.setItem("mote-os", os); } catch (e) {}
    renderGallery();
    if (window.__MOTE_RELEASE) renderAssets(window.__MOTE_RELEASE);
  }

  function setBsd(bsd) {
    document.body.setAttribute("data-bsd", bsd);
    document.querySelectorAll(".bsd-tab").forEach(function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-bsd") === bsd);
    });
    document.querySelectorAll("[data-bsd-hint]").forEach(function (el) {
      el.hidden = el.getAttribute("data-bsd-hint") !== bsd;
    });
    try { localStorage.setItem("mote-bsd", bsd); } catch (e) {}
    if (window.__MOTE_RELEASE) renderAssets(window.__MOTE_RELEASE);
  }

  function setArch(arch) {
    document.body.setAttribute("data-arch", arch);
    document.querySelectorAll(".arch-tab").forEach(function (b) {
      b.classList.toggle("is-on", b.getAttribute("data-arch") === arch);
    });
    document.querySelectorAll("[data-arch-hint]").forEach(function (el) {
      el.hidden = el.getAttribute("data-arch-hint") !== arch;
    });
    try { localStorage.setItem("mote-arch", arch); } catch (e) {}
    if (window.__MOTE_RELEASE) renderAssets(window.__MOTE_RELEASE);
  }

  function fmtSize(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function parseAsset(name) {
    var n = name.toLowerCase();
    if (n === "sha256sums") return { kind: "meta", id: "sha256" };
    if (n.indexOf("all-platforms") >= 0) return { kind: "meta", id: "all" };
    if (n === "mote-web.zip") return { kind: "meta", id: "web" };

    var isUpx = /\.upx(\.exe)?$/i.test(name);
    var stem = name.replace(/\.upx(\.exe)?$/i, function (m) {
      return /\.exe$/i.test(m) ? ".exe" : "";
    });

    var m = stem.match(
      /^mote-(macos|freebsd|openbsd|netbsd|linux|windows|dos)-(?:(i686|arm64|armhf|riscv64|amd64)-)?([a-z0-9]+)(\.exe)?$/i
    );
    if (m) {
      var os = m[1].toLowerCase();
      var arch = m[2] ? m[2].toLowerCase() : (os === "dos" ? "i686" : "amd64");
      var backend = m[3].toLowerCase();
      if (backend === "sdl") backend = "sdl2";
      if (backend === "console" && os === "windows") backend = "winconsole";
      return { kind: "bin", os: os, arch: arch, backend: backend, upx: isUpx, key: os + "|" + arch + "|" + backend };
    }

    m = stem.match(/^mote-linux-(console|x11|sdl2|sdl3|wayland|fbdev)$/i);
    if (m) {
      return {
        kind: "bin",
        os: "linux",
        arch: "amd64",
        backend: m[1].toLowerCase(),
        upx: isUpx,
        key: "linux|amd64|" + m[1].toLowerCase(),
        legacy: true
      };
    }

    m = stem.match(/^mote-windows-(gui|console)\.exe$/i);
    if (m) {
      var be = m[1].toLowerCase() === "gui" ? "gui" : "winconsole";
      return {
        kind: "bin",
        os: "windows",
        arch: "amd64",
        backend: be,
        upx: isUpx,
        key: "windows|amd64|" + be,
        legacy: true
      };
    }

    if (n === "mote-dos.exe") {
      return { kind: "bin", os: "dos", arch: "i686", backend: "dos", upx: isUpx, key: "dos|i686|dos" };
    }

    return null;
  }

  function osTabFor(parsed) {
    if (parsed.os === "freebsd" || parsed.os === "openbsd" || parsed.os === "netbsd") return "bsd";
    return parsed.os;
  }

  function matchesFilter(parsed, os, arch, bsd) {
    if (parsed.kind === "meta") {
      if (parsed.id === "all") return true;
      if (parsed.id === "sha256") return true;
      if (parsed.id === "web") return os === "web";
      return false;
    }
    if (osTabFor(parsed) !== os) return false;
    if (os === "linux" || os === "windows") return parsed.arch === arch;
    if (os === "bsd") return parsed.os === bsd;
    return true;
  }

  function hideLegacyDuplicates(items) {
    var modern = {};
    items.forEach(function (it) {
      if (it.parsed.kind !== "bin" || !it.parsed.legacy) return;
      modern[it.parsed.key] = true;
    });
    var hasModern = {};
    items.forEach(function (it) {
      if (it.parsed.kind !== "bin" || it.parsed.legacy) return;
      hasModern[it.parsed.key] = true;
    });
    return items.filter(function (it) {
      if (it.parsed.kind !== "bin" || !it.parsed.legacy) return true;
      return !hasModern[it.parsed.key];
    });
  }

  function backendRank(be) {
    var order = { console: 1, winconsole: 1, x11: 2, sdl2: 3, sdl: 3, wayland: 4, fbdev: 5, gui: 2, dos: 1 };
    return order[be] || 50;
  }

  function labelForGroup(parsed) {
    var lang = document.body.getAttribute("data-lang") || "ru";
    var bl = BACKEND_LABEL[parsed.backend];
    var bt = bl ? (lang === "ru" ? bl.ru : bl.en) : parsed.backend;
    var osn = OS_LABEL[parsed.os] || parsed.os;
    if (parsed.os === "dos") return "DOS · i686 · VGA";
    if (parsed.os === "windows") return osn + " · " + parsed.arch + " · " + bt;
    if (parsed.os === "macos" || parsed.os === "freebsd" || parsed.os === "openbsd") {
      return osn + " · " + parsed.arch + " · " + bt;
    }
    if (parsed.arch === "amd64" && parsed.legacy) return osn + " · amd64 · " + bt;
    return osn + " · " + parsed.arch + " · " + bt;
  }

  function metaLabel(id) {
    if (id === "all") return t("all_zip");
    if (id === "web") return t("web_zip");
    if (id === "sha256") return t("checksums");
    return id;
  }

  function renderAssets(release) {
    var box = $("assets");
    var os = document.body.getAttribute("data-os") || "linux";
    var arch = document.body.getAttribute("data-arch") || "amd64";
    var bsd = document.body.getAttribute("data-bsd") || "freebsd";
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

    var items = release.assets.map(function (a) {
      return { asset: a, parsed: parseAsset(a.name) };
    }).filter(function (it) {
      return it.parsed && matchesFilter(it.parsed, os, arch, bsd);
    });
    items = hideLegacyDuplicates(items);

    var meta = [];
    var groups = {};
    items.forEach(function (it) {
      if (it.parsed.kind === "meta") {
        meta.push(it);
        return;
      }
      var k = it.parsed.key;
      if (!groups[k]) groups[k] = { parsed: it.parsed, std: null, upx: null };
      if (it.parsed.upx) groups[k].upx = it.asset;
      else groups[k].std = it.asset;
    });

    var metaOrder = { all: 0, web: 1, sha256: 2 };
    meta.sort(function (a, b) {
      return (metaOrder[a.parsed.id] || 9) - (metaOrder[b.parsed.id] || 9);
    });

    var binList = Object.keys(groups).map(function (k) { return groups[k]; });
    binList.sort(function (a, b) {
      return backendRank(a.parsed.backend) - backendRank(b.parsed.backend) ||
        labelForGroup(a.parsed).localeCompare(labelForGroup(b.parsed));
    });

    if (!meta.length && !binList.length) {
      box.innerHTML += '<p class="err">' + t("no_assets") + "</p>";
      return;
    }

    function addRow(opts) {
      var row = document.createElement("div");
      row.className = "asset" + (opts.star ? " asset-star" : "");
      var actions = opts.actions.map(function (act) {
        return '<a class="btn' + (act.primary ? " primary" : "") + '" download="' + act.name +
          '" href="' + act.url + '">' + act.label + "</a>";
      }).join("");
      row.innerHTML =
        "<div><div class=\"name\">" + opts.title + "</div>" +
        "<div class=\"meta\">" + opts.meta + "</div></div>" +
        '<div class="asset-actions">' + actions + "</div>";
      box.appendChild(row);
    }

    meta.forEach(function (it) {
      var a = it.asset;
      addRow({
        star: it.parsed.id === "all" || it.parsed.id === "web",
        title: metaLabel(it.parsed.id),
        meta: a.name + " · " + fmtSize(a.size),
        actions: [{ name: a.name, url: a.browser_download_url, label: t("cta_dl"), primary: true }]
      });
    });

    binList.forEach(function (g) {
      if (!g.std && !g.upx) return;
      var primary = g.std || g.upx;
      var metaParts = [];
      if (g.std) metaParts.push(g.std.name + " · " + fmtSize(g.std.size));
      if (g.upx) metaParts.push(g.upx.name + " · " + fmtSize(g.upx.size));
      var actions = [];
      if (g.std) {
        actions.push({
          name: g.std.name,
          url: g.std.browser_download_url,
          label: t("cta_dl"),
          primary: true
        });
      }
      if (g.upx) {
        actions.push({
          name: g.upx.name,
          url: g.upx.browser_download_url,
          label: t("cta_packed"),
          primary: !g.std
        });
      }
      addRow({
        title: labelForGroup(g.parsed),
        meta: metaParts.join("  ·  "),
        actions: actions
      });
    });
  }

  function renderGallery() {
    var grid = $("gallery-grid");
    var os = document.body.getAttribute("data-os") || "linux";
    var lang = document.body.getAttribute("data-lang") || "ru";
    var items = GALLERY[os] || [];
    grid.innerHTML = "";
    if (!items.length) {
      grid.innerHTML = '<p class="hint gal-empty">' + t("gal_empty") + "</p>";
      return;
    }
    items.forEach(function (it) {
      var card = document.createElement("a");
      card.className = "shot-card shot";
      card.href = it.src;
      card.setAttribute("data-cap", "mote — " + it.title);
      card.innerHTML =
        '<span class="frame"><img src="' + it.src + '" alt="' + it.title + '" loading="lazy" /></span>' +
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
  document.querySelectorAll(".arch-tab").forEach(function (b) {
    b.addEventListener("click", function () { setArch(b.getAttribute("data-arch")); });
  });

  document.querySelectorAll(".bsd-tab").forEach(function (b) {
    b.addEventListener("click", function () { setBsd(b.getAttribute("data-bsd")); });
  });

  var savedLang = "ru";
  var savedOs = "linux";
  var savedArch = "amd64";
  var savedBsd = "freebsd";
  try {
    savedLang = localStorage.getItem("mote-lang") || savedLang;
    savedOs = localStorage.getItem("mote-os") || savedOs;
    savedArch = localStorage.getItem("mote-arch") || savedArch;
    savedBsd = localStorage.getItem("mote-bsd") || savedBsd;
  } catch (e) {}
  setLang(savedLang);
  setArch(savedArch);
  setBsd(savedBsd);
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
