(function () {
  const WA_NUMBER = "919940299543";
  const EMAIL = "sarvadharatravels@gmail.com";
  const MUSIC_SRC = "assets/audio/bg-music.mp3";
  const MUSIC_VOL = 0.35;

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const defaultWaText = encodeURIComponent(
    "Hello Sarvadhara Sai Web Designing, I would like a quote for a website or digital e-card. I will fill the requirement form and send it with my logo and photos."
  );
  const defaultWa = "https://wa.me/" + WA_NUMBER + "?text=" + defaultWaText;
  document.querySelectorAll("[data-contact=\"whatsapp\"]").forEach(function (a) {
    if (!a.getAttribute("href") || a.getAttribute("href") === "#") a.setAttribute("href", defaultWa);
  });

  /* —— Nav drawer —— */
  const toggle = document.getElementById("navToggle");
  const drawer = document.getElementById("navDrawer");
  const backdrop = document.getElementById("navBackdrop");
  const closeBtn = document.getElementById("navDrawerClose");

  function openNav() {
    if (!drawer) return;
    drawer.hidden = false;
    if (backdrop) backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    if (window.__sswLenis) window.__sswLenis.stop();
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    requestAnimationFrame(function () {
      drawer.classList.add("is-open");
      if (backdrop) backdrop.classList.add("is-open");
    });
  }
  function closeNav() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (window.__sswLenis) window.__sswLenis.start();
    setTimeout(function () {
      if (!drawer.classList.contains("is-open")) {
        drawer.hidden = true;
        if (backdrop) backdrop.hidden = true;
      }
    }, 320);
  }
  if (toggle) toggle.addEventListener("click", function () {
    if (drawer && drawer.classList.contains("is-open")) closeNav();
    else openNav();
  });
  if (closeBtn) closeBtn.addEventListener("click", closeNav);
  if (backdrop) backdrop.addEventListener("click", closeNav);
  if (drawer) drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* —— Package preselect —— */
  document.querySelectorAll("[data-package]").forEach(function (el) {
    el.addEventListener("click", function () {
      const pack = el.getAttribute("data-package");
      const select = document.getElementById("enquiryPackage");
      if (select && pack) select.value = pack;
    });
  });

  /* —— Enquiry form —— */
  function formData() {
    const f = document.getElementById("enquiryForm");
    if (!f) return null;
    return {
      name: (f.elements.namedItem("name") || {}).value || "",
      business: (f.elements.namedItem("business") || {}).value || "",
      phone: (f.elements.namedItem("phone") || {}).value || "",
      email: (f.elements.namedItem("email") || {}).value || "",
      package: (f.elements.namedItem("package") || {}).value || "Not sure",
      message: (f.elements.namedItem("message") || {}).value || ""
    };
  }
  function buildMessage(data) {
    return [
      "Hello Sarvadhara Sai Web Designing, I would like a quote.",
      "",
      "Name: " + (data.name || ""),
      "Business: " + (data.business || ""),
      "Phone: " + (data.phone || ""),
      "Email: " + (data.email || ""),
      "Interested in: " + (data.package || "Not sure"),
      "Message: " + (data.message || ""),
      "",
      "I will send the filled requirement form with my logo and photos."
    ].join("\n");
  }
  const form = document.getElementById("enquiryForm");
  const status = document.getElementById("formStatus");
  function requireBasics(data) {
    if (!data.name || !data.phone) {
      if (status) status.textContent = "Please enter your name and phone number.";
      return false;
    }
    if (status) status.textContent = "";
    return true;
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = formData();
      if (!requireBasics(data)) return;
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(buildMessage(data)), "_blank", "noopener");
      if (status) status.textContent = "Opening WhatsApp with your enquiry…";
    });
  }
  const emailBtn = document.getElementById("sendEmail");
  if (emailBtn) {
    emailBtn.addEventListener("click", function () {
      const data = formData();
      if (!requireBasics(data)) return;
      const subject = "Website / E-card enquiry — " + (data.business || data.name || "Sarvadhara Sai Web Designing");
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(buildMessage(data));
      if (status) status.textContent = "Opening your email app…";
    });
  }

  /* —— Hero video: reduced motion fallback —— */
  const video = document.querySelector(".wd-hero-video");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  function applyMotion() {
    if (!video) return;
    if (motion.matches) {
      video.pause();
      video.removeAttribute("autoplay");
      video.classList.add("is-static");
    } else {
      video.classList.remove("is-static");
      const p = video.play();
      if (p && p.catch) p.catch(function () {});
    }
  }
  applyMotion();
  if (motion.addEventListener) motion.addEventListener("change", applyMotion);
  document.addEventListener("visibilitychange", function () {
    if (!video || motion.matches) return;
    if (document.hidden) video.pause();
    else video.play().catch(function () {});
  });

  /* —— Background music: off by default, fade in, remember —— */
  const musicBtn = document.getElementById("musicToggle");
  let audio = null;
  let musicOn = localStorage.getItem("ssw-music") === "on";
  let fading = null;

  function ensureAudio() {
    if (audio) return audio;
    audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.preload = "none";
    audio.volume = 0;
    return audio;
  }
  function fadeTo(target, ms) {
    const a = ensureAudio();
    if (fading) cancelAnimationFrame(fading);
    const start = a.volume;
    const t0 = performance.now();
    function step(now) {
      const t = Math.min(1, (now - t0) / ms);
      a.volume = start + (target - start) * t;
      if (t < 1) fading = requestAnimationFrame(step);
    }
    fading = requestAnimationFrame(step);
  }
  function setMusicUI() {
    if (!musicBtn) return;
    musicBtn.classList.toggle("is-on", musicOn);
    musicBtn.setAttribute("aria-pressed", musicOn ? "true" : "false");
    const tip = musicBtn.querySelector(".wd-music-tip");
    if (tip) tip.textContent = musicOn ? "Music on — click to stop" : "Play music";
    musicBtn.setAttribute("aria-label", musicOn ? "Stop background music" : "Play background music");
  }
  function startMusic() {
    const a = ensureAudio();
    musicOn = true;
    localStorage.setItem("ssw-music", "on");
    setMusicUI();
    a.play().then(function () { fadeTo(MUSIC_VOL, 900); }).catch(function () {
      musicOn = false;
      localStorage.setItem("ssw-music", "off");
      setMusicUI();
    });
  }
  function stopMusic() {
    musicOn = false;
    localStorage.setItem("ssw-music", "off");
    setMusicUI();
    if (!audio) return;
    fadeTo(0, 400);
    setTimeout(function () { if (!musicOn && audio) audio.pause(); }, 420);
  }
  const musicHint = document.getElementById("musicHint");
  const MUSIC_HINT_KEY = "ssw-music-hint";
  function hideMusicHint() {
    if (musicHint) musicHint.classList.add("is-hidden");
    try { localStorage.setItem(MUSIC_HINT_KEY, "hidden"); } catch (e) {}
  }
  try {
    if (musicHint && localStorage.getItem(MUSIC_HINT_KEY) === "hidden") {
      musicHint.classList.add("is-hidden");
    }
  } catch (e) {}

  if (musicBtn) {
    setMusicUI();
    musicBtn.addEventListener("click", function () {
      hideMusicHint();
      if (musicOn) stopMusic();
      else startMusic();
    });
    /* Resume only after a prior choice, and only on a later user gesture if autoplay is blocked */
    if (musicOn) {
      const resume = function () {
        document.removeEventListener("click", resume);
        if (localStorage.getItem("ssw-music") === "on") startMusic();
      };
      document.addEventListener("click", resume, { once: true });
    }
  }

  /* —— Scroll progress, back to top —— */
  const bar = document.getElementById("scrollProgress");
  const toTop = document.getElementById("toTop");
  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    if (bar) bar.style.width = pct + "%";
    if (toTop) toTop.classList.toggle("is-visible", doc.scrollTop > 600);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function (e) {
    e.preventDefault();
    if (window.__sswLenis && !motion.matches) window.__sswLenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: motion.matches ? "auto" : "smooth" });
  });

  /* —— Scroll reveal —— */
  if (!motion.matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* —— Counters —— */
  function animateCounter(el) {
    const end = parseFloat(el.getAttribute("data-count") || "0");
    const suffix = el.getAttribute("data-suffix") || "";
    const prefix = el.getAttribute("data-prefix") || "";
    const dur = 1100;
    const t0 = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = end % 1 === 0 ? Math.round(end * eased) : (end * eased).toFixed(0);
      el.textContent = prefix + val + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCounter(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  /* —— Digital services tabs / accordion —— */
  const tablist = document.getElementById("dsTabs");
  if (tablist) {
    const tabs = Array.from(tablist.querySelectorAll("[role=tab]"));
    const panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    function activate(id, focus) {
      tabs.forEach(function (t, i) {
        const on = t.id === id;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (panels[i]) panels[i].hidden = !on;
        if (on && focus) t.focus();
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { activate(t.id, false); });
      t.addEventListener("keydown", function (e) {
        const i = tabs.indexOf(t);
        if (e.key === "ArrowRight") { e.preventDefault(); activate(tabs[(i + 1) % tabs.length].id, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); activate(tabs[(i - 1 + tabs.length) % tabs.length].id, true); }
      });
    });
    /* Mobile accordion: clicking a selected tab is fine; panels stack visually via CSS */
  }
})();
