(function () {
  "use strict";
  var WA = "919940299543", EMAIL = "info@sarvadharasai.in";
  var btn = document.getElementById("menuBtn"), nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    btn.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
  }
  if (btn && nav) {
    btn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 920) setMenu(false); });
  }
  var form = document.getElementById("enquiryForm"), status = document.getElementById("formStatus");
  if (!form) return;
  function val(n) { var el = form.elements.namedItem(n); return el ? el.value.trim() : ""; }
  function data() { return { name: val("name"), business: val("business"), phone: val("phone"), email: val("email"), pkg: val("package"), msg: val("message") }; }
  function message(d) {
    return ["Hello Sarvadhara Sai Web Designing, I would like a quote.", "",
      "Name: " + d.name, "Business: " + d.business, "Phone: " + d.phone, "Email: " + d.email,
      "Interested in: " + d.pkg, "Message: " + d.msg].join("\n");
  }
  function ok(d) {
    if (!d.name || !d.phone) { status.textContent = "Please add your name and phone number."; return false; }
    status.textContent = ""; return true;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault(); var d = data(); if (!ok(d)) return;
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(message(d)), "_blank", "noopener");
    status.textContent = "Opening WhatsApp with your enquiry…";
  });
  var em = document.getElementById("sendEmail");
  if (em) em.addEventListener("click", function () {
    var d = data(); if (!ok(d)) return;
    location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Website enquiry — " + (d.business || d.name)) + "&body=" + encodeURIComponent(message(d));
    status.textContent = "Opening your email app…";
  });
})();
