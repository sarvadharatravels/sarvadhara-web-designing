/* Instant wow, ambient motion, video autoplay fallback, marquees, cursor/ripples.
   Complements cinematic.js. Only prefers-reduced-motion turns this off. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    if (reduced) {
      document.body.classList.remove("cx-introing");
      document.body.classList.add("cx-intro-done", "cx-reduce");
      var intro = document.getElementById("cx-intro");
      if (intro) intro.classList.add("is-done");
      showPosters();
      return;
    }
    document.body.classList.add("cx-introing");
    scheduleIntroDone();
    initVideos();
    initAmbient();
    initCursor();
    initRipples();
    initMagnetic();
  });

  function scheduleIntroDone() {
    var intro = document.getElementById("cx-intro");
    setTimeout(function () {
      document.body.classList.remove("cx-introing");
      document.body.classList.add("cx-intro-done");
      if (intro) intro.classList.add("is-done");
      playHeroEntrance();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 1900);
  }

  function playHeroEntrance() {
    var words = document.querySelectorAll(".wd-hero .cx-word");
    var rest = document.querySelectorAll(".wd-hero .eyebrow, .wd-hero .wd-tagline, .wd-hero .lead, .wd-hero-actions, .wd-hero-note");
    document.body.classList.add("cx-js-enter");
    /* If GSAP is ready, re-run the wow so a pin restart cannot hide the copy. */
    if (typeof gsap !== "undefined" && words.length) {
      gsap.fromTo(words, { opacity: 0, y: 24, filter: "blur(12px)" }, {
        opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7,
        stagger: 0.08, ease: "power3.out", overwrite: true
      });
      if (rest.length) {
        gsap.fromTo(rest, { opacity: 0, y: 14 }, {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.08,
          delay: 0.28, ease: "power2.out", overwrite: true,
          onComplete: function () { document.body.classList.add("cx-hero-in"); }
        });
      } else {
        document.body.classList.add("cx-hero-in");
      }
    } else {
      document.body.classList.add("cx-hero-in");
    }
  }

  /* —— Video autoplay with Ken Burns poster fallback —— */
  var videos = [];

  function boxOf(v) {
    return v.closest(".wd-hero-media, .cx-videobox, .cx-screen") || v.parentElement;
  }

  function setState(v, playing) {
    var box = boxOf(v);
    if (!box) return;
    box.classList.toggle("is-playing", playing);
    box.classList.toggle("is-static", !playing);
  }

  function tryPlay(v) {
    if (!v) return;
    try { v.muted = true; v.defaultMuted = true; v.setAttribute("muted", ""); } catch (e) {}
    var p = v.play();
    if (p && p.then) {
      p.then(function () { setState(v, true); }).catch(function () { setState(v, false); });
    }
  }

  function hydrate(v) {
    if (v.dataset.src && !v.getAttribute("src") && !v.querySelector("source[src]")) {
      var src = v.dataset.src;
      var s = document.createElement("source");
      s.src = src; s.type = "video/mp4";
      v.appendChild(s);
      v.load();
    }
  }

  function initVideos() {
    videos = Array.prototype.slice.call(document.querySelectorAll("video"));
    videos.forEach(function (v) {
      v.muted = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("webkit-playsinline", "");
      v.setAttribute("muted", "");
      v.addEventListener("playing", function () { setState(v, true); });
      v.addEventListener("pause", function () {
        if (!document.hidden && v.readyState >= 2 && v.currentTime > 0) {
          /* Low Power Mode often pauses; keep the Ken Burns poster if it won't resume */
          setTimeout(function () { if (v.paused) setState(v, false); }, 200);
        }
      });
      v.addEventListener("error", function () { setState(v, false); });
    });

    /* Hero (and any preload=auto/metadata already in DOM) — try immediately */
    document.querySelectorAll("video[data-auto]").forEach(function (v) {
      hydrate(v);
      tryPlay(v);
    });

    /* Lazy lower videos */
    var lazy = document.querySelectorAll("video[data-src]");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          hydrate(en.target);
          tryPlay(en.target);
          io.unobserve(en.target);
        });
      }, { rootMargin: "200px 0px" });
      lazy.forEach(function (v) { io.observe(v); });
    } else {
      lazy.forEach(function (v) { hydrate(v); tryPlay(v); });
    }

    function resumeAll() {
      videos.forEach(function (v) {
        if (v.dataset.src) hydrate(v);
        if (v.paused) tryPlay(v);
      });
    }
    ["touchstart", "touchend", "pointerdown", "click", "scroll", "wheel"].forEach(function (ev) {
      window.addEventListener(ev, resumeAll, { passive: true, once: true });
    });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) resumeAll();
    });

    /* After media arrives, refresh ScrollTrigger (iOS address bar / sizes) */
    var refresh = function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); };
    videos.forEach(function (v) {
      v.addEventListener("loadeddata", refresh, { once: true });
    });
    window.addEventListener("load", function () { setTimeout(refresh, 60); });
  }

  function showPosters() {
    document.querySelectorAll(".wd-hero-media, .cx-videobox").forEach(function (b) {
      b.classList.add("is-static");
    });
  }

  /* —— Ambient gold particles on the hero canvas —— */
  function initAmbient() {
    var canvas = document.getElementById("cx-ambient");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var parts = [];
    var mobile = window.matchMedia("(max-width: 767px)").matches;
    var n = mobile ? 24 : 55;
    var running = true;

    function size() {
      var parent = canvas.parentElement;
      var w = parent.clientWidth, h = parent.clientHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: w, h: h };
    }
    var dim = size();
    window.addEventListener("resize", function () { dim = size(); }, { passive: true });

    var colors = ["rgba(243,215,137,", "rgba(201,162,77,", "rgba(255,233,168,", "rgba(232,197,107,"];
    for (var i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * dim.w,
        y: Math.random() * dim.h,
        r: 1 + Math.random() * (mobile ? 2.2 : 3.4),
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.35,
        a: 0.25 + Math.random() * 0.55,
        c: colors[i % colors.length]
      });
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, dim.w, dim.h);
      for (i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = dim.h + 8; p.x = Math.random() * dim.w; }
        if (p.x < -10) p.x = dim.w + 8;
        if (p.x > dim.w + 10) p.x = -8;
        ctx.beginPath();
        ctx.fillStyle = p.c + p.a + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
  }

  /* —— Desktop cursor glow —— */
  function initCursor() {
    var el = document.getElementById("cx-cursor");
    if (!el || !fine || reduced) return;
    window.addEventListener("pointermove", function (e) {
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
      el.classList.add("is-on");
    }, { passive: true });
    window.addEventListener("pointerleave", function () { el.classList.remove("is-on"); });
  }

  /* —— Magnetic buttons (desktop) —— */
  function initMagnetic() {
    if (!fine || reduced || typeof gsap === "undefined") return;
    document.querySelectorAll(".btn-gold, .btn-maroon, .btn-whatsapp").forEach(function (btn) {
      btn.classList.add("cx-magnetic");
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.22;
        gsap.to(btn, { x: x, y: y, duration: 0.25, ease: "power2.out" });
      });
      btn.addEventListener("pointerleave", function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "power3.out" });
      });
    });
  }

  /* —— Tap ripples (mobile and click) —— */
  function initRipples() {
    document.addEventListener("pointerdown", function (e) {
      var btn = e.target.closest && e.target.closest(".btn");
      if (!btn) return;
      var r = btn.getBoundingClientRect();
      var span = document.createElement("span");
      span.className = "cx-ripple";
      var size = Math.max(r.width, r.height);
      span.style.width = span.style.height = size + "px";
      span.style.left = (e.clientX - r.left - size / 2) + "px";
      span.style.top = (e.clientY - r.top - size / 2) + "px";
      btn.appendChild(span);
      setTimeout(function () { span.remove(); }, 650);
    }, { passive: true });
  }
})();
