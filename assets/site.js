(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header state (passive, rAF-throttled) */
  var hdr = doc.querySelector(".hdr"), ticking = false;
  function hdrState() { ticking = false; hdr.classList.toggle("at-top", window.scrollY < 24); }
  if (hdr) {
    hdrState();
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(hdrState); } }, { passive: true });
  }

  /* Mobile menu */
  var btn = doc.getElementById("menuBtn"), nav = doc.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    btn.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
    if (open) hdr.classList.remove("at-top"); else hdrState();
  }
  if (btn && nav) {
    btn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) setMenu(false); }, { passive: true });
  }

  /* Scroll reveal: only items currently below the fold get hidden, so nothing is lost if JS fails */
  if (!reduce && "IntersectionObserver" in window) {
    var vh = window.innerHeight, items = [].slice.call(doc.querySelectorAll("[data-rv]"));
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    var groups = new Map();
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.95 && !(el.closest('.works') && window.innerWidth <= 640)) {
        var p = el.parentElement, i = groups.get(p) || 0; groups.set(p, i + 1);
        el.style.setProperty("--rd", Math.min(i, 5) * 0.07 + "s");
        el.classList.add("rv"); io.observe(el);
      }
    });
  }

  /* Pointer glow on cards (cheap: CSS vars only) */
  if (window.matchMedia && matchMedia("(hover: hover)").matches) {
    doc.querySelectorAll(".tile,.glass").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
  }

  /* Enquiry form */
  var WA = "919940299543", EMAIL = "info@sarvadharasai.in";
  var form = doc.getElementById("enquiryForm"), status = doc.getElementById("formStatus");
  if (form) {
    var val = function (n) { var el = form.elements.namedItem(n); return el ? el.value.trim() : ""; };
    var data = function () { return { name: val("name"), business: val("business"), phone: val("phone"), email: val("email"), pkg: val("package"), msg: val("message") }; };
    var message = function (d) {
      return ["Hello Sarvadhara Sai Web Designing, I would like a quote.", "",
        "Name: " + d.name, "Business: " + d.business, "Phone: " + d.phone, "Email: " + d.email,
        "Interested in: " + d.pkg, "Message: " + d.msg].join("\n");
    };
    var ok = function (d) {
      if (!d.name || !d.phone) { status.textContent = "Please add your name and phone number."; return false; }
      status.textContent = ""; return true;
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var d = data(); if (!ok(d)) return;
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(message(d)), "_blank", "noopener");
      status.textContent = "Opening WhatsApp with your enquiry…";
    });
    var em = doc.getElementById("sendEmail");
    if (em) em.addEventListener("click", function () {
      var d = data(); if (!ok(d)) return;
      location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Website enquiry — " + (d.business || d.name)) + "&body=" + encodeURIComponent(message(d));
      status.textContent = "Opening your email app…";
    });
  }

  /* Background music: playlist with crossfade, starts on first interaction */
  var A = doc.getElementById("bgmA"), B = doc.getElementById("bgmB"), sbtn = doc.getElementById("soundBtn");
  if (!A || !B || !sbtn) return;
  var TRACKS = ["assets/audio/playlist-1.mp3", "assets/audio/playlist-2.mp3", "assets/audio/playlist-3.mp3"];
  var VOL = 0.35, XF = 3, KEY = "sswd-music";
  var cur = A, nxt = B, idx = 0, on = false, fading = false, wasOnBeforeHide = false;
  var pref = null; try { pref = localStorage.getItem(KEY); } catch (e) {}
  A.volume = 0; B.volume = 0;

  function fade(el, to, ms, done) {
    if (el._f) clearInterval(el._f);
    var from = el.volume, steps = Math.max(1, Math.round(ms / 50)), i = 0;
    el._f = setInterval(function () {
      i++; var v = from + (to - from) * (i / steps);
      el.volume = Math.min(1, Math.max(0, v));
      if (i >= steps) { clearInterval(el._f); el._f = null; if (done) done(); }
    }, 50);
  }
  function ui() {
    sbtn.classList.toggle("is-on", on);
    sbtn.setAttribute("aria-pressed", String(on));
    sbtn.setAttribute("aria-label", on ? "Pause background music" : "Play background music");
  }
  function save() { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {} }
  function start() {
    on = true; ui();
    var p = cur.play();
    if (p && p.catch) p.catch(function () { on = false; ui(); });
    fade(cur, VOL, 2500);
  }
  function stop() {
    on = false; ui();
    [A, B].forEach(function (el) { fade(el, 0, 600, function () { el.pause(); }); });
    fading = false;
  }
  function prepNext() {
    var n = (idx + 1) % TRACKS.length;
    if (nxt.getAttribute("src") !== TRACKS[n]) { nxt.src = TRACKS[n]; nxt.preload = "auto"; nxt.load(); }
  }
  function crossfade() {
    if (fading) return; fading = true;
    prepNext();
    var old = cur; cur = nxt; nxt = old; idx = (idx + 1) % TRACKS.length;
    cur.currentTime = 0; cur.volume = 0;
    var p = cur.play(); if (p && p.catch) p.catch(function () {});
    fade(cur, on ? VOL : 0, XF * 1000);
    fade(old, 0, XF * 1000, function () { old.pause(); fading = false; });
  }
  function onTime(e) {
    var el = e.target; if (el !== cur || !on || !el.duration) return;
    var left = el.duration - el.currentTime;
    if (left < 30) prepNext();
    if (left < XF + 0.25) crossfade();
  }
  A.addEventListener("timeupdate", onTime); B.addEventListener("timeupdate", onTime);
  A.addEventListener("ended", function () { if (cur === A && on) crossfade(); });
  B.addEventListener("ended", function () { if (cur === B && on) crossfade(); });

  sbtn.addEventListener("click", function () { if (on) stop(); else start(); save(); });

  function firstGesture(e) {
    ["pointerdown", "keydown", "touchstart"].forEach(function (t) { doc.removeEventListener(t, firstGesture, true); });
    if (sbtn.contains(e.target)) return;           // the toggle handles itself
    if (pref !== "off" && !on) start();
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (t) { doc.addEventListener(t, firstGesture, { capture: true, passive: true }); });

  doc.addEventListener("visibilitychange", function () {
    if (doc.hidden) { wasOnBeforeHide = on; if (on) { A.pause(); B.pause(); } }
    else if (wasOnBeforeHide && on) { var p = cur.play(); if (p && p.catch) p.catch(function () {}); cur.volume = VOL; }
  });
  ui();
})();
