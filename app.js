(function () {
  var cfg = window.MOTE_SITE || {};
  var owner = cfg.owner || "SYFaren";
  var repo = cfg.repo || "mote";
  var siteRepo = cfg.siteRepo || "mote-site";
  var base = "https://github.com/" + owner + "/" + repo;
  var site = "https://github.com/" + owner + "/" + siteRepo;
  var api = "https://api.github.com/repos/" + owner + "/" + repo + "/releases/latest";

  function $(id) { return document.getElementById(id); }

  $("gh-link").href = base;
  $("gh-releases").href = base + "/releases/latest";
  $("gh-src").href = base;
  $("gh-site").href = site;
  var hint = $("dl-hint");
  if (hint) {
    hint.innerHTML =
      "Кнопки <b>Скачать</b> — прямые ссылки на ассеты из Releases " +
      "<code>" + owner + "/" + repo + "</code> (не из сайта).";
  }

  function fmtSize(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(2) + " MB";
  }

  function labelFor(name) {
    var n = name.toLowerCase();
    if (n.indexOf("mote-x") >= 0 || n.indexOf("motex") >= 0) {
      if (n.indexOf("win") >= 0 || n.indexOf(".exe") >= 0) return "mote-x · Windows";
      return "mote-x · Linux";
    }
    if (n.indexOf("mote") >= 0) {
      if (n.indexOf("win") >= 0 || n.indexOf(".exe") >= 0) return "mote · Windows";
      return "mote · Linux";
    }
    return name;
  }

  function render(release) {
    var box = $("assets");
    box.innerHTML = "";
    if (!release || !release.assets || !release.assets.length) {
      box.innerHTML =
        '<p class="err">Пока нет файлов в релизе. После <code>gh release create</code> ' +
        'здесь появятся кнопки <b>Скачать</b>. ' +
        '<a href="' + base + '/releases">Открыть Releases</a></p>';
      return;
    }

    var head = document.createElement("p");
    head.className = "hint";
    head.innerHTML =
      "Прямые ссылки из <a href=\"" + base + "/releases/tag/" +
      encodeURIComponent(release.tag_name) + "\">" +
      release.tag_name + "</a> · <code>" + owner + "/" + repo + "</code>";
    box.appendChild(head);

    release.assets.forEach(function (a) {
      var row = document.createElement("div");
      row.className = "asset";
      row.innerHTML =
        "<div>" +
          '<div class="name">' + labelFor(a.name) + "</div>" +
          '<div class="meta">' + a.name + " · " + fmtSize(a.size) + "</div>" +
        "</div>" +
        '<a class="btn" download="' + a.name + '" href="' +
          a.browser_download_url + '">Скачать</a>';
      box.appendChild(row);
    });
  }

  fetch(api, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(render)
    .catch(function () {
      $("assets").innerHTML =
        '<p class="err">Не удалось загрузить релиз. ' +
        '<a href="' + base + '/releases/latest">Скачать на GitHub</a></p>';
    });

  /* Gallery lightbox */
  var lb = $("lightbox");
  var lbImg = $("lb-img");
  var lbCap = $("lb-cap");
  var lbClose = $("lb-close");

  function openLb(href, cap) {
    lbImg.src = href;
    lbImg.alt = cap || "";
    lbCap.textContent = cap || "";
    lb.hidden = false;
  }
  function closeLb(e) {
    if (e) e.preventDefault();
    lb.hidden = true;
    lbImg.src = "";
  }

  document.querySelectorAll("a.shot").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      openLb(a.getAttribute("href"), a.getAttribute("data-cap"));
    });
  });
  lbClose.addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLb();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lb.hidden) closeLb();
  });
})();
