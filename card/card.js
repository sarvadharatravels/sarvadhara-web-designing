(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) document.documentElement.classList.add("is-reduced");
  else document.documentElement.classList.add("is-animating");

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

  function runEntrance() {
    var lines = document.querySelectorAll(".rule-edge");
    var dots = document.querySelectorAll(".dots");
    var title = document.querySelector("[data-enter='title']");
    var stagger = Array.prototype.slice.call(document.querySelectorAll("[data-stagger]"));
    var logo = document.querySelector("[data-enter='logo']");
    var rule = document.querySelector("[data-enter='rule']");

    if (reduce) {
      [logo, rule, title].concat(stagger).forEach(function (el) { if (el) el.classList.add("is-in"); });
      lines.forEach(function (el) { el.classList.add("is-on"); });
      dots.forEach(function (el) { el.classList.add("is-on"); });
      document.documentElement.classList.add("is-ready");
      return;
    }

    if (logo) logo.classList.add("is-in");

    window.setTimeout(function () {
      lines.forEach(function (el) { el.classList.add("is-on"); });
      dots.forEach(function (el) { el.classList.add("is-on"); });
      if (rule) rule.classList.add("is-in");
    }, 180);

    window.setTimeout(function () {
      typeTitle(title, function () {
        var start = 280;
        var step = 420;
        stagger.forEach(function (el, i) {
          window.setTimeout(function () { el.classList.add("is-in"); }, start + i * step);
        });
        window.setTimeout(function () {
          document.documentElement.classList.add("is-ready");
        }, start + stagger.length * step + 300);
      });
    }, 900);
  }

  function typeTitle(el, done) {
    if (!el) { if (done) done(); return; }
    var full = el.getAttribute("data-type") || el.textContent.trim();
    el.setAttribute("data-type", full);
    if (reduce) {
      el.textContent = full;
      el.classList.add("is-in");
      if (done) done();
      return;
    }
    el.textContent = "";
    el.classList.add("is-in");
    var i = 0;
    var delay = Math.max(38, Math.min(70, 800 / Math.max(full.length, 1)));
    function tick() {
      if (i <= full.length) {
        el.textContent = full.slice(0, i);
        i += 1;
        window.setTimeout(tick, delay);
      } else if (done) {
        done();
      }
    }
    tick();
  }

  function setFlip(on) {
    if (!card) return;
    card.classList.toggle("is-flipped", on);
    if (flipBtn) flipBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  if (flipBtn && card) {
    flipBtn.addEventListener("click", function () {
      setFlip(!card.classList.contains("is-flipped"));
    });
    card.addEventListener("dblclick", function () {
      setFlip(!card.classList.contains("is-flipped"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "f" || e.key === "F") {
        if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
        setFlip(!card.classList.contains("is-flipped"));
      }
    });
  }

  if (card && !reduce) {
    var scene = card.parentElement;
    scene.addEventListener("pointermove", function (e) {
      if (card.classList.contains("is-flipped")) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = "rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
    });
    scene.addEventListener("pointerleave", function () {
      card.style.transform = "";
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var data = {
        title: cfg.shareTitle || document.title,
        text: cfg.shareText || "",
        url: cfg.url || window.location.href
      };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
        return;
      }
      var url = data.url;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          toast("Link copied");
        }).catch(function () {
          fallbackCopy(url);
        });
      } else {
        fallbackCopy(url);
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast("Link copied");
    } catch (err) {
      toast("Copy this link: " + text);
    }
    document.body.removeChild(ta);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runEntrance);
  } else {
    runEntrance();
  }
})();
