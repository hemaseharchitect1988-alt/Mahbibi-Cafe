(function () {
"use strict";
var FA = "۰۱۲۳۴۵۶۷۸۹";
function fa(n) { return String(n).replace(/\d/g, function (d) { return FA[d]; }); }
function el(tag, cls, text) {
var e = document.createElement(tag);
if (cls) e.className = cls;
if (text != null) e.textContent = text;
return e;
}
function card(item) {
var c = el("article", "card");
var ph = el("div", "ph");
var img = new Image();
img.alt = item.name;
img.width = 480; img.height = 360;
img.loading = "lazy"; img.decoding = "async";
img.onload = function () { img.className = "ok"; };
img.onerror = function () { img.remove(); };
img.src = item.image;
ph.appendChild(img);
var info = el("div", "info");
info.appendChild(el("h3", "", item.name));
info.appendChild(el("p", "price", item.price == null ? "" : fa(item.price)));
c.appendChild(ph); c.appendChild(info);
return c;
}
function render(data) {
var nav = document.getElementById("cats");
var main = document.getElementById("menu");
var navFrag = document.createDocumentFragment();
var mainFrag = document.createDocumentFragment();
data.categories.forEach(function (cat) {
var a = el("a", "", cat.title);
a.href = "#" + cat.id;
a.dataset.id = cat.id;
navFrag.appendChild(a);
var sec = el("section", "sec");
sec.id = cat.id;
sec.appendChild(el("h2", "", cat.title));
var grid = el("div", "grid");
cat.items.forEach(function (it) { grid.appendChild(card(it)); });
sec.appendChild(grid);
mainFrag.appendChild(sec);
});
nav.appendChild(navFrag);
main.textContent = "";
main.appendChild(mainFrag);
setupNav(nav);
}
function setupNav(nav) {
var links = nav.querySelectorAll("a");
var byId = {};
links.forEach(function (a) { byId[a.dataset.id] = a; });
nav.addEventListener("click", function (e) {
var a = e.target.closest("a");
if (!a) return;
e.preventDefault();
var sec = document.getElementById(a.dataset.id);
if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
});
if (!("IntersectionObserver" in window)) return;
var current = null;
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (en) {
if (!en.isIntersecting) return;
var a = byId[en.target.id];
if (!a || a === current) return;
if (current) current.classList.remove("on");
a.classList.add("on");
current = a;
var left = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
nav.scrollTo({ left: left, behavior: "smooth" });
});
}, { rootMargin: "-20% 0px -70% 0px" });
document.querySelectorAll(".sec").forEach(function (s) { io.observe(s); });
}
fetch("menu.json")
.then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
.then(render)
.catch(function () {
document.getElementById("menu").innerHTML = '<p class="loading">بارگذاری منو انجام نشد. لطفاً اتصال اینترنت را بررسی و صفحه را دوباره باز کنید.</p>';
});
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
var hadController = !!navigator.serviceWorker.controller;
var reloaded = false;
navigator.serviceWorker.addEventListener("controllerchange", function () {
if (hadController && !reloaded) { reloaded = true; location.reload(); }
});
window.addEventListener("load", function () {
navigator.serviceWorker.register("sw.js").catch(function () {});
});
}
})();