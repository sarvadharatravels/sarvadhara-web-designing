(function () {
  const WA_NUMBER = "919940299543";
  const EMAIL = "sarvadharatravels@gmail.com";

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const waLinks = document.querySelectorAll("[data-contact=\"whatsapp\"]");
  const defaultWaText = encodeURIComponent(
    "Hello Sarvadhara Sai Web Designing, I would like a website quote. I will fill the requirement form and send it with my logo and photos."
  );
  const defaultWa = "https://wa.me/" + WA_NUMBER + "?text=" + defaultWaText;
  waLinks.forEach(function (a) {
    if (!a.getAttribute("href") || a.getAttribute("href") === "#") a.setAttribute("href", defaultWa);
  });

  const toggle = document.getElementById("navToggle");
  const drawer = document.getElementById("navDrawer");
  const backdrop = document.getElementById("navBackdrop");
  const closeBtn = document.getElementById("navDrawerClose");

  function openNav() {
    if (!drawer) return;
    drawer.hidden = false;
    if (backdrop) backdrop.hidden = false;
    document.body.style.overflow = "hidden";
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
    setTimeout(function () {
      if (!drawer.classList.contains("is-open")) {
        drawer.hidden = true;
        if (backdrop) backdrop.hidden = true;
      }
    }, 280);
  }
  if (toggle) toggle.addEventListener("click", function () {
    if (drawer && !drawer.hidden && drawer.classList.contains("is-open")) closeNav();
    else openNav();
  });
  if (closeBtn) closeBtn.addEventListener("click", closeNav);
  if (backdrop) backdrop.addEventListener("click", closeNav);
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  document.querySelectorAll("[data-package]").forEach(function (el) {
    el.addEventListener("click", function () {
      const pack = el.getAttribute("data-package");
      const select = document.getElementById("enquiryPackage");
      if (select && pack) select.value = pack;
    });
  });

  function buildMessage(data) {
    return [
      "Hello Sarvadhara Sai Web Designing, I would like a website quote.",
      "",
      "Name: " + (data.name || ""),
      "Business: " + (data.business || ""),
      "Phone: " + (data.phone || ""),
      "Email: " + (data.email || ""),
      "Package: " + (data.package || "Not sure"),
      "Message: " + (data.message || ""),
      "",
      "I will send the filled requirement form with my logo and photos."
    ].join("\n");
  }

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
      const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(buildMessage(data));
      window.open(url, "_blank", "noopener");
      if (status) status.textContent = "Opening WhatsApp with your enquiry…";
    });
  }

  const emailBtn = document.getElementById("sendEmail");
  if (emailBtn) {
    emailBtn.addEventListener("click", function () {
      const data = formData();
      if (!requireBasics(data)) return;
      const subject = "Website enquiry — " + (data.business || data.name || "Sarvadhara Sai Web Designing");
      const mailto = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(buildMessage(data));
      window.location.href = mailto;
      if (status) status.textContent = "Opening your email app…";
    });
  }
})();
