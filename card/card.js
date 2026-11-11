(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]static\b/.test(location.search);
  var card = document.getElementById("card");
  var flipBtn = document.getElementById("flipBtn");
  var shareBtn = document.getElementById("shareBtn");
  var toastEl = document.getElementById("toast");
  var cfg = window.SARVADHARA_CARD || {};

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }

  // Split title lines into per-letter spans. Full text is laid out from the start,
  // so the "typing" only changes opacity and nothing ever shifts or overlaps.
  var chars = [];
  Array.prototype.forEach.call(document.querySelectorAll(".face--front .title .tl"), function (line) {
    var text = line.textContent;
    line.textContent = "";
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "ch";
      s.textContent = text[i];
      line.appendChild(s);
      chars.push(s);
    }
  });

  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function finish() {
    all(".face--front [data-reveal], .face--front .deco").forEach(function (el) { el.classList.add("is-in"); });
    chars.forEach(function (c) { c.classList.add("is-in"); });
    root.classList.add("is-ready");
  }

  function run() {
    if (reduce) { finish(); return; }
    var emblem = document.querySelector(".face--front .emblem");
    var decos = all(".face--front .deco");
    var seq = all(".face--front [data-reveal]").filter(function (el) { return el !== emblem; });
    if (emblem) emblem.classList.add("is-in");
    setTimeout(function () { decos.forEach(function (d) { d.classList.add("is-in"); }); }, 250);
    var t = 700, step = Math.max(28, Math.min(60, 1300 / Math.max(chars.length, 1)));
    chars.forEach(function (c, i) { setTimeout(function () { c.classList.add("is-in"); }, t + i * step); });
    t += chars.length * step + 250;
    seq.forEach(function (el, i) { setTimeout(function () { el.classList.add("is-in"); }, t + i * 380); });
    setTimeout(finish, t + seq.length * 380 + 600);
  }

  root.classList.add("js");

  function setFlip(on) {
    card.classList.toggle("is-flipped", on);
    flipBtn.setAttribute("aria-pressed", on ? "true" : "false");
    flipBtn.textContent = on ? "Show front" : "Flip card";
  }
  if (card && flipBtn) {
    flipBtn.addEventListener("click", function () { setFlip(!card.classList.contains("is-flipped")); });
    card.addEventListener("dblclick", function () { setFlip(!card.classList.contains("is-flipped")); });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var data = { title: cfg.shareTitle || document.title, text: cfg.shareText || "", url: cfg.url || location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data.url).then(function () { toast("Link copied"); }, function () { toast(data.url); });
      } else { toast(data.url); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
