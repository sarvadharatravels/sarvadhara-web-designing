/* Cinematic scroll: Lenis + GSAP ScrollTrigger. Degrades if a library is missing
   or if the visitor prefers reduced motion / a narrow screen. */
(function () {
  "use strict";

  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobile = window.matchMedia("(max-width: 767px)");
  var reduced = motion.matches;
  var isMobile = mobile.matches;

  function ready(fn) {
    if (document.readyState === "complete") fn();
    else window.addEventListener("load", fn);
  }

  ready(function () {
    setStaticFallbacks();
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      showEndStates();
      initSlider();
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    var lenis = null;
    if (!reduced && typeof Lenis === "function") {
      lenis = new Lenis({
        duration: 1.05,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        smoothTouch: false
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      window.__sswLenis = lenis;
    }

    if (reduced) {
      showEndStates();
      initSlider();
      slideHeadings(true);
      return;
    }

    heroTimeline();
    if (!isMobile) {
      showcaseTimeline();
      beforeAfterTimeline();
    } else {
      lightShowcase();
      lightBeforeAfter();
    }
    slideHeadings(false);
    parallaxLayers();
    initSlider();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    });
  });

  function setStaticFallbacks() {
    document.querySelectorAll(".section-head h2").forEach(function (h) {
      h.classList.add("wd-slide-head");
    });
  }

  function showEndStates() {
    document.querySelectorAll(".wd-hero-counters").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.querySelectorAll("[data-cx-count]").forEach(function (n) {
        n.textContent = n.getAttribute("data-cx-count") || n.textContent;
      });
    });
    document.querySelectorAll(".cx-screen-final, .cx-phone-screen img").forEach(function (el) {
      el.style.opacity = "1";
    });
    var ba = document.querySelector(".cx-ba");
    if (ba) {
      ba.classList.add("is-compare");
      var after = ba.querySelector(".cx-after");
      if (after) after.style.opacity = "1";
      var label = ba.querySelector(".cx-typed");
      if (label) label.textContent = "After";
      ba.classList.add("is-done");
    }
    document.querySelectorAll(".wd-slide-head").forEach(function (h) {
      h.style.opacity = "1";
      h.style.transform = "none";
    });
  }

  function countUp(el, end, suffix, duration) {
    var start = 0;
    suffix = suffix || "";
    duration = duration || 0.9;
    var obj = { v: start };
    gsap.to(obj, {
      v: end,
      duration: duration,
      ease: "power2.out",
      onUpdate: function () { el.textContent = Math.round(obj.v) + suffix; }
    });
  }

  /* —— 1. Hero: heading shrinks/fades, video dims, gold burst, counters —— */
  function heroTimeline() {
    var hero = document.querySelector(".wd-hero");
    if (!hero) return;
    var copy = hero.querySelector(".wd-hero-copy");
    var dim = hero.querySelector(".wd-hero-dim");
    var bloom = hero.querySelector(".wd-gold-bloom");
    var counters = hero.querySelector(".wd-hero-counters");
    var devices = hero.querySelector(".wd-devices");
    var canvas = hero.querySelector(".wd-gold-burst");
    var burstPlayed = false;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: isMobile ? "+=80%" : "+=140%",
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        onUpdate: function (self) {
          if (!burstPlayed && self.progress > 0.38) {
            burstPlayed = true;
            if (canvas && !isMobile) playBurst(canvas);
          }
        }
      }
    });

    if (copy) {
      tl.to(copy, { scale: 0.72, opacity: 0, y: -40, transformOrigin: "left center", ease: "none", duration: 0.45 }, 0);
    }
    if (devices) {
      tl.to(devices, { y: 30, opacity: 0.15, ease: "none", duration: 0.5 }, 0);
    }
    if (dim) {
      tl.to(dim, { opacity: 1, ease: "none", duration: 0.4 }, 0.12);
    }
    if (bloom) {
      tl.fromTo(bloom,
        { opacity: 0, scale: 0.3 },
        { opacity: 0.95, scale: 1.15, ease: "none", duration: 0.22 },
        0.34
      );
      tl.to(bloom, { opacity: 0.15, scale: 1.45, ease: "none", duration: 0.28 }, 0.56);
    }
    if (counters) {
      tl.to(counters, { opacity: 1, scale: 1, ease: "none", duration: 0.22 }, 0.4);
    }
    tl.eventCallback("onUpdate", function () {
      if (!counters || counters._counted) return;
      if (tl.progress() > 0.42) {
        counters._counted = true;
        counters.querySelectorAll("[data-cx-count]").forEach(function (n) {
          countUp(n, parseFloat(n.getAttribute("data-cx-count") || "0"), n.getAttribute("data-suffix") || "", 0.8);
        });
      }
    });
  }

  function playBurst(canvas) {
    var parent = canvas.parentElement;
    var w = parent.clientWidth;
    var h = parent.clientHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    var cx = w * 0.55, cy = h * 0.44;
    var parts = [];
    var colors = ["#f3d789", "#c9a24d", "#ffe7a3", "#e8c56b", "#fff6d4", "#b8892f"];
    var i, a, sp, n = 110;
    for (i = 0; i < n; i++) {
      a = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.4;
      sp = 2.2 + Math.random() * 8.5;
      parts.push({
        x: cx, y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 1 + Math.random() * 3.2,
        life: 1,
        decay: 0.01 + Math.random() * 0.016,
        color: colors[i % colors.length]
      });
    }
    var start = performance.now();
    function frame(now) {
      var t = now - start;
      ctx.clearRect(0, 0, w, h);
      var alive = 0;
      for (i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.vx *= 0.99;
        p.life -= p.decay;
        if (p.life <= 0) continue;
        alive++;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (alive > 0 && t < 1800) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    }
    requestAnimationFrame(frame);
  }

  /* —— 2. 3D showcase: cards fly in and assemble on the screens (pinned) —— */
  function showcaseTimeline() {
    var section = document.querySelector(".cx-showcase");
    var pin = document.querySelector(".cx-showcase-pin");
    if (!section || !pin) return;

    var laptop = pin.querySelector(".cx-laptop");
    var phone = pin.querySelector(".cx-phone");
    var flies = gsap.utils.toArray(pin.querySelectorAll(".cx-fly"));
    var floats = gsap.utils.toArray(pin.querySelectorAll(".cx-float"));
    var mosaic = pin.querySelector(".cx-mosaic");
    var finale = pin.querySelector(".cx-screen-final");
    var phoneImg = pin.querySelector(".cx-phone-screen img");

    var starts = [
      { x: -280, y: -160, z: -180, rotY: -40, rotX: 14 },
      { x: 300, y: -130, z: -120, rotY: 36, rotX: -8 },
      { x: -240, y: 160, z: -80, rotY: -28, rotX: 8 },
      { x: 260, y: 150, z: -200, rotY: 42, rotX: 12 },
      { x: -40, y: -210, z: 80, rotY: -16, rotX: -16 },
      { x: 80, y: 200, z: 40, rotY: 18, rotX: 14 }
    ];

    /* Pose the laptop, then measure where mosaic cells sit so cards can land on them. */
    gsap.set(laptop, { rotateX: 8, rotateY: -12, xPercent: -54, yPercent: -50 });
    gsap.set(phone, { rotateX: 8, rotateY: -10, x: 0, opacity: 1 });
    gsap.set(flies, { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1, opacity: 0 });
    var cells = mosaic ? mosaic.querySelectorAll("img") : [];
    var dests = flies.map(function (el, i) {
      var cell = cells[i];
      if (!cell) return { x: 0, y: 0, scale: 0.4 };
      var a = el.getBoundingClientRect();
      var b = cell.getBoundingClientRect();
      return {
        x: (b.left + b.width / 2) - (a.left + a.width / 2),
        y: (b.top + b.height / 2) - (a.top + a.height / 2),
        scale: Math.max(0.2, Math.min(b.width / Math.max(a.width, 1), b.height / Math.max(a.height, 1)))
      };
    });

    flies.forEach(function (el, i) {
      var s = starts[i % starts.length];
      gsap.set(el, {
        x: s.x, y: s.y, z: s.z,
        rotateY: s.rotY, rotateX: s.rotX,
        opacity: 0, scale: 0.75,
        transformPerspective: 1200
      });
    });
    gsap.set(floats, { opacity: 0, z: -160, y: 30 });
    gsap.set(laptop, { rotateX: 18, rotateY: -28, xPercent: -54, yPercent: -50 });
    gsap.set(phone, { rotateX: 14, rotateY: 22, x: 60, opacity: 0.75 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=260%",
        pin: pin,
        scrub: 0.8,
        anticipatePin: 1
      }
    });

    tl.to(laptop, { rotateX: 8, rotateY: -12, duration: 0.4, ease: "none" }, 0);
    tl.to(phone, { rotateX: 8, rotateY: -10, x: 0, opacity: 1, duration: 0.4, ease: "none" }, 0.04);
    tl.to(floats, {
      opacity: 0.65, z: 0, y: 0, duration: 0.35, stagger: 0.06, ease: "none"
    }, 0.06);

    flies.forEach(function (el, i) {
      var d = dests[i];
      tl.to(el, { opacity: 1, duration: 0.1, ease: "none" }, 0.05 + i * 0.03);
      tl.to(el, {
        x: d.x, y: d.y, z: 20,
        rotateY: 0, rotateX: 0,
        scale: d.scale,
        duration: 0.5,
        ease: "none"
      }, 0.12 + i * 0.04);
    });

    tl.to(mosaic, { opacity: 1, duration: 0.14, ease: "none" }, 0.68);
    tl.to(flies, { opacity: 0, duration: 0.12, ease: "none" }, 0.74);
    tl.to(finale, { opacity: 1, duration: 0.2, ease: "none" }, 0.78);
    if (phoneImg) tl.to(phoneImg, { opacity: 1, duration: 0.2, ease: "none" }, 0.8);
    tl.to(laptop, { rotateX: 6, rotateY: -8, duration: 0.18, ease: "none" }, 0.8);
    tl.to(floats[0] || {}, { x: -16, y: -12, duration: 0.2, ease: "none" }, 0.65);
    tl.to(floats[1] || {}, { x: 14, y: 8, duration: 0.2, ease: "none" }, 0.65);
  }

  function lightShowcase() {
    var pin = document.querySelector(".cx-showcase-pin");
    if (!pin) return;
    gsap.set(pin.querySelector(".cx-screen-final"), { opacity: 1 });
    gsap.set(pin.querySelector(".cx-phone-screen img"), { opacity: 1 });
    gsap.from(pin.querySelectorAll(".cx-laptop, .cx-phone"), {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: "power2.out",
      scrollTrigger: { trigger: pin, start: "top 80%" }
    });
  }

  /* —— 3. Before → After: type label, dark beat, dissolve, then slider —— */
  function beforeAfterTimeline() {
    var section = document.querySelector(".cx-ba");
    var pin = document.querySelector(".cx-ba-pin");
    if (!section || !pin) return;
    var after = pin.querySelector(".cx-after");
    var beat = pin.querySelector(".cx-dark-beat");
    var typed = pin.querySelector(".cx-typed");
    var labelWrap = pin.querySelector(".cx-ba-label");

    var state = { phase: "before", typedOn: false };
    if (typed) typed.textContent = "";

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=200%",
        pin: pin,
        scrub: 0.75,
        anticipatePin: 1,
        onUpdate: function (self) {
          var p = self.progress;
          if (typed && p < 0.28) {
            typeTo(typed, "Before", p / 0.28);
          } else if (typed && p >= 0.28 && p < 0.48 && typed.textContent !== "Before") {
            typed.textContent = "Before";
          }
          if (p >= 0.72 && typed) {
            var t = Math.min(1, (p - 0.72) / 0.12);
            typeTo(typed, "After", t);
          }
          if (p >= 0.88) {
            section.classList.add("is-compare");
            if (labelWrap) labelWrap.classList.add("is-done");
            if (after) after.style.opacity = "1";
          } else {
            section.classList.remove("is-compare");
          }
        }
      }
    });

    tl.to({}, { duration: 0.28 }, 0);
    if (beat) {
      tl.to(beat, { opacity: 1, duration: 0.1, ease: "none" }, 0.42);
      tl.to(beat, { opacity: 0, duration: 0.12, ease: "none" }, 0.54);
    }
    if (after) {
      tl.to(after, { opacity: 1, duration: 0.16, ease: "none" }, 0.54);
    }
    tl.to({}, { duration: 0.3 }, 0.7);
  }

  function typeTo(el, word, t) {
    var n = Math.max(0, Math.min(word.length, Math.round(word.length * t)));
    var next = word.slice(0, n);
    if (el.textContent !== next) el.textContent = next;
  }

  function lightBeforeAfter() {
    var section = document.querySelector(".cx-ba");
    if (!section) return;
    var typed = section.querySelector(".cx-typed");
    var after = section.querySelector(".cx-after");
    var beat = section.querySelector(".cx-dark-beat");
    ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      once: true,
      onEnter: function () {
        if (typed) typed.textContent = "Before";
        var tl = gsap.timeline();
        if (beat) {
          tl.to(beat, { opacity: 1, duration: 0.18 });
          tl.to(beat, { opacity: 0, duration: 0.22 });
        }
        if (after) tl.to(after, { opacity: 1, duration: 0.3 }, "-=0.05");
        tl.add(function () {
          if (typed) typed.textContent = "After";
          section.classList.add("is-compare", "is-done");
        });
      }
    });
  }

  /* —— Section headings slide in from the left —— */
  function slideHeadings(instant) {
    document.querySelectorAll(".wd-slide-head").forEach(function (h) {
      if (instant) {
        gsap.set(h, { clearProps: "all" });
        return;
      }
      gsap.from(h, {
        x: isMobile ? -24 : -70,
        opacity: 0,
        duration: isMobile ? 0.45 : 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: h, start: "top 88%" }
      });
    });
  }

  /* —— Subtle parallax on decorative layers —— */
  function parallaxLayers() {
    if (isMobile) return;
    document.querySelectorAll(".wd-hero-orbs span").forEach(function (el, i) {
      gsap.to(el, {
        y: (i % 2 === 0 ? -50 : 40),
        x: (i % 2 === 0 ? 20 : -16),
        ease: "none",
        scrollTrigger: { trigger: ".wd-hero", start: "top top", end: "bottom top", scrub: true }
      });
    });
    document.querySelectorAll(".cx-orb").forEach(function (el, i) {
      gsap.to(el, {
        y: i % 2 === 0 ? -30 : 24,
        ease: "none",
        scrollTrigger: { trigger: ".cx-ba", start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* —— Draggable before/after slider —— */
  function initSlider() {
    var section = document.querySelector(".cx-ba");
    var stage = document.querySelector(".cx-ba-stage");
    var handle = document.querySelector(".cx-slider-handle");
    if (!section || !stage || !handle) return;

    function setSplit(pct) {
      pct = Math.max(4, Math.min(96, pct));
      section.style.setProperty("--split", pct + "%");
      handle.setAttribute("aria-valuenow", String(Math.round(pct)));
    }
    setSplit(50);

    var dragging = false;
    function pctFromEvent(e) {
      var rect = stage.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      return (x / rect.width) * 100;
    }
    function start(e) {
      if (!section.classList.contains("is-compare")) return;
      dragging = true;
      section.style.userSelect = "none";
      if (window.__sswLenis) window.__sswLenis.stop();
      setSplit(pctFromEvent(e));
      e.preventDefault();
    }
    function move(e) {
      if (!dragging) return;
      setSplit(pctFromEvent(e));
    }
    function end() {
      if (!dragging) return;
      dragging = false;
      section.style.userSelect = "";
      if (window.__sswLenis) window.__sswLenis.start();
    }
    handle.addEventListener("pointerdown", start);
    stage.addEventListener("pointerdown", function (e) {
      if (e.target === handle) return;
      start(e);
    });
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);

    handle.addEventListener("keydown", function (e) {
      var now = parseFloat(handle.getAttribute("aria-valuenow") || "50");
      if (e.key === "ArrowLeft") { setSplit(now - 4); e.preventDefault(); }
      if (e.key === "ArrowRight") { setSplit(now + 4); e.preventDefault(); }
      if (e.key === "Home") { setSplit(4); e.preventDefault(); }
      if (e.key === "End") { setSplit(96); e.preventDefault(); }
    });
  }
})();
