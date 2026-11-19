/* هر بار قیمت/محصول/تصویر/فایلی تغییر کرد، فقط شماره VERSION را یکی زیاد کنید. */
var VERSION = 3;
var CACHE = "mahbibi-menu-v" + VERSION;
var CORE = ["./", "index.html", "style.css", "app.js", "menu.json", "manifest.json",
  "logo.svg", "vazirmatn-regular.woff2", "vazirmatn-bold.woff2", "icon-192.png", "icon-512.png"];

function fresh(u) { return new Request(u, { cache: "reload" }); }

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(CORE.map(fresh)).then(function () {
        // تصاویر محصولات: تلاش جداگانه؛ نبودن یک تصویر مانع نصب نمی‌شود
        return fetch(fresh("menu.json")).then(function (r) { return r.json(); }).then(function (d) {
          var jobs = [];
          d.categories.forEach(function (cat) {
            cat.items.forEach(function (it) {
              jobs.push(c.add(fresh(it.image)).catch(function () {}));
            });
          });
          return Promise.all(jobs);
        }).catch(function () {});
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE && k.indexOf("mahbibi-menu-") === 0; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function networkFirst(req) {
  return new Promise(function (resolve) {
    var done = false;
    var timer = setTimeout(function () {
      caches.match(req, { ignoreSearch: true }).then(function (m) { if (m && !done) { done = true; resolve(m); } });
    }, 3000);
    fetch(req).then(function (r) {
      clearTimeout(timer);
      if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      if (!done) { done = true; resolve(r); }
    }).catch(function () {
      clearTimeout(timer);
      caches.match(req, { ignoreSearch: true }).then(function (m) { if (!done) { done = true; resolve(m || Response.error()); } });
    });
  });
}

function cacheFirst(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (m) {
    if (m) return m;
    return fetch(req).then(function (r) {
      if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return r;
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === "navigate" || /\/data\/menu\.json$/.test(url.pathname)) {
    e.respondWith(networkFirst(req));
  } else {
    e.respondWith(cacheFirst(req));
  }
});
