/* Sarvadhara Sai — signature opening: intro control, WebGL globe, live website build */
const doc = document, root = doc.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Intro ---------- */
let introResolve; const introDone = new Promise(r => (introResolve = r));
(function intro() {
  const el = doc.getElementById("intro");
  if (!root.classList.contains("has-intro") || !el) { introResolve(); return; }
  // aim the emblem's exit at the globe
  const g = doc.getElementById("globe");
  if (g) {
    const r = g.getBoundingClientRect(), m = el.querySelector(".intro__mark").getBoundingClientRect();
    const gx = r.left + r.width / 2 - (m.left + m.width / 2), gy = r.top + r.height / 2 - (m.top + m.height / 2);
    el.style.setProperty("--gx", gx.toFixed(0) + "px"); el.style.setProperty("--gy", gy.toFixed(0) + "px");
    el.style.setProperty("--gs", Math.max(.35, Math.min(1.2, (r.width * .62) / m.width)).toFixed(2));
  }
  let ended = false;
  const end = (skipped) => {
    if (ended) return; ended = true;
    if (skipped) root.classList.add("has-intro-skip");
    setTimeout(() => { root.classList.remove("has-intro", "has-intro-skip"); introResolve(); }, skipped ? 360 : 0);
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach(t => removeEventListener(t, skip, true));
  };
  const skip = () => end(true);
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach(t => addEventListener(t, skip, { capture: true, passive: true }));
  // the emblem flies into the globe: fade the (fallback) globe in underneath it as it travels
  setTimeout(() => g && g.classList.add("is-in"), 2350);
  // warm the cache for three.js during the intro (network only, no parsing)
  ["./vendor/three.module.min.js", "./globe-points.js"].forEach(u => { const l = doc.createElement("link"); l.rel = "prefetch"; l.href = new URL(u, import.meta.url).href; doc.head.appendChild(l); });
  setTimeout(() => end(false), 3300);
})();

/* ---------- 2. Live website build ---------- */
const THEMES = [
  { key: "restaurant", url: "yourbusiness.in", logo: "Annapoorna", h1: "Home-style meals,", h2: "served with warmth.", b1: "Order now", b2: "Menu", shot: "assets/img/portfolio/restaurant-desktop-880.webp" },
  { key: "clinic", url: "yourclinic.in", logo: "Sree Health", h1: "Care you can walk", h2: "into today.", b1: "Book visit", b2: "Hours", shot: "assets/img/portfolio/clinic-desktop-880.webp" },
  { key: "boutique", url: "yourboutique.in", logo: "Kaveri", h1: "Festive weaves,", h2: "everyday ease.", b1: "Shop now", b2: "Lookbook", shot: "assets/img/portfolio/boutique-desktop-880.webp" }
];
function startBuild() {
  const b = doc.getElementById("build"); if (!b) return;
  b.classList.add("is-in");
  if (reduce) return; // static finished site
  const sk = b.querySelector(".sk"), typed = b.querySelector(".build__typed"), shot = b.querySelector(".build__shot"), cur = b.querySelector(".build__cursor");
  const t = sel => b.querySelector(sel);
  THEMES.forEach(th => { const i = new Image(); i.src = th.shot; });
  // stagger index for skeleton pieces
  [...sk.querySelectorAll("i,b")].forEach((n, i) => n.style.setProperty("--sd", (i * 0.055).toFixed(3) + "s"));
  let visible = true, paused = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(b);
  const wait = ms => new Promise(res => {
    let left = ms, last = performance.now();
    const tick = now => { if (visible && !doc.hidden) left -= now - last; last = now; left <= 0 ? res() : requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const step = n => b.setAttribute("data-step", String(n));
  const cursor = (x, y) => { cur.style.setProperty("--cx", x); cur.style.setProperty("--cy", y); };
  b.classList.add("is-anim");
  (async function loop() {
    let k = 0;
    for (;;) {
      const th = THEMES[k % THEMES.length];
      step(0); typed.textContent = ""; sk.dataset.theme = th.key;
      t(".sk__logo .sk__t").textContent = th.logo; t(".sk__h1 .sk__t").textContent = th.h1; t(".sk__h1--2 .sk__t").textContent = th.h2;
      const bt = b.querySelectorAll(".sk__btn .sk__t"); bt[0].textContent = th.b1; bt[1].textContent = th.b2;
      await wait(450);
      shot.src = th.shot;
      cursor("40%", "-6%"); await wait(700);           // cursor to URL bar
      b.classList.add("is-typing"); step(1);
      for (const ch of th.url) { typed.textContent += ch; await wait(70 + Math.random() * 60); }
      await wait(300); b.classList.remove("is-typing");
      cursor("70%", "70%");
      step(2); await wait(1500);                         // wireframe blocks
      step(3); await wait(1100);                         // real colour + images
      step(4); await wait(1100);                         // text and buttons
      cursor("16%", "62%"); await wait(800);             // hover the button
      cur.classList.add("click"); await wait(250); cur.classList.remove("click");
      step(5); await wait(900);                          // finished site
      step(6);                                           // ✓ Live
      cursor("88%", "120%");
      await wait(k === 0 ? 3200 : 2600);
      k++;
    }
  })();
}

/* ---------- 3. WebGL globe ---------- */
async function startGlobe() {
  const host = doc.getElementById("globe"); if (!host) return;
  let THREE, POINTS;
  try {
    const c = doc.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) throw new Error("no webgl");
    [THREE, POINTS] = await Promise.all([import("./vendor/three.module.min.js"), import("./globe-points.js").then(m => m.default)]);
  } catch (e) { return; } // fallback image stays
  const W = () => host.clientWidth, H = () => host.clientHeight;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (e) { return; }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr); renderer.setSize(W(), H(), false);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100); camera.position.set(0, 0, 4.6);
  const world = new THREE.Group(); scene.add(world);
  const globe = new THREE.Group(); world.add(globe);
  world.rotation.x = 0.32; world.rotation.z = -0.12;

  const ll = (lat, lon, r = 1) => {
    const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
  };
  const GOLD = new THREE.Color("#E8CC86"), GOLD2 = new THREE.Color("#C9A24D");

  // core sphere with fresnel rim
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.995, 64, 64), new THREE.ShaderMaterial({
    uniforms: { c1: { value: new THREE.Color("#1c0509") }, c2: { value: new THREE.Color("#5a1424") }, rim: { value: GOLD } },
    vertexShader: "varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform vec3 c1;uniform vec3 c2;uniform vec3 rim;varying vec3 vN;varying vec3 vV;void main(){float f=1.-max(dot(vN,vV),0.);vec3 col=mix(c2,c1,pow(1.-f,.6));col+=rim*pow(f,3.5)*.55;gl_FragColor=vec4(col,1.);}"
  })));
  // atmosphere
  const atm = new THREE.Mesh(new THREE.SphereGeometry(1.18, 64, 64), new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color("#E3B866") } }, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: "varying vec3 vN;varying vec3 vP;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vP=normalize(mv.xyz);gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform vec3 c;varying vec3 vN;varying vec3 vP;void main(){float i=pow(max(0.,dot(vN,vP)),2.6);gl_FragColor=vec4(c,i*.9);}"
  }));
  world.add(atm);

  // dot-matrix continents
  const n = POINTS.length / 2, pos = new Float32Array(n * 3), rnd = new Float32Array(n);
  for (let i = 0; i < n; i++) { const v = ll(POINTS[i * 2], POINTS[i * 2 + 1], 1.003); pos.set([v.x, v.y, v.z], i * 3); rnd[i] = Math.random(); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); pg.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
  const pMat = new THREE.ShaderMaterial({
    uniforms: { size: { value: 2.3 * dpr }, time: { value: 0 }, c1: { value: GOLD }, c2: { value: GOLD2 } }, transparent: true, depthWrite: false,
    vertexShader: "uniform float size;uniform float time;attribute float rnd;varying float vR;varying float vF;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*position);vF=smoothstep(-.1,.45,dot(n,normalize(-mv.xyz)));vR=rnd;gl_PointSize=size*(0.75+0.5*rnd)*(4.6/-mv.z);gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform vec3 c1;uniform vec3 c2;uniform float time;varying float vR;varying float vF;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);if(d>.5)discard;float a=smoothstep(.5,.15,d);float tw=.75+.25*sin(time*1.6+vR*40.);gl_FragColor=vec4(mix(c2,c1,vR),a*vF*tw);}"
  });
  globe.add(new THREE.Points(pg, pMat));

  // Chennai + arcs
  const CHN = [13.08, 80.27];
  const DEST = [[25.2, 55.27], [51.5, -0.12], [40.71, -74.0], [1.35, 103.8], [-33.87, 151.2], [35.68, 139.7], [-1.29, 36.82], [48.85, 2.35], [-23.55, -46.63]];
  const arcMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, c: { value: GOLD } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: "attribute float t;attribute float off;varying float vT;varying float vO;void main(){vT=t;vO=off;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float time;uniform vec3 c;varying float vT;varying float vO;void main(){float cyc=mod(time*.22+vO,1.6);float grow=clamp(cyc*1.4,0.,1.);if(vT>grow)discard;float fade=1.-smoothstep(1.05,1.6,cyc);float head=smoothstep(.18,0.,abs(vT-grow));gl_FragColor=vec4(c,(0.35+head*1.2)*fade);}"
  });
  const a0 = ll(CHN[0], CHN[1]);
  DEST.forEach((d, j) => {
    const a1 = ll(d[0], d[1]), seg = 80, P = [], T = [], O = [];
    const ang = a0.angleTo(a1), lift = 0.12 + ang * 0.16;
    for (let i = 0; i <= seg; i++) {
      const s = i / seg, v = new THREE.Vector3().copy(a0).lerp(a1, s).normalize().multiplyScalar(1 + Math.sin(Math.PI * s) * lift);
      P.push(v.x, v.y, v.z); T.push(s); O.push(j * 0.17);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("t", new THREE.Float32BufferAttribute(T, 1)); g.setAttribute("off", new THREE.Float32BufferAttribute(O, 1));
    globe.add(new THREE.Line(g, arcMat));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: GOLD })); dot.position.copy(ll(d[0], d[1], 1.006)); globe.add(dot);
  });
  // Chennai marker: dot + pulsing ring
  const cm = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 16), new THREE.MeshBasicMaterial({ color: "#FFF1C9" })); cm.position.copy(ll(CHN[0], CHN[1], 1.008)); globe.add(cm);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.04, 40), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  ring.position.copy(ll(CHN[0], CHN[1], 1.01)); ring.lookAt(new THREE.Vector3(0, 0, 0)); globe.add(ring);

  // orbit ring + plane
  const orbit = new THREE.Group(); orbit.rotation.set(1.15, 0, -0.35); world.add(orbit);
  const R = 1.36, oc = [];
  for (let i = 0; i <= 160; i++) { const a = i / 160 * Math.PI * 2; oc.push(Math.cos(a) * R, 0, Math.sin(a) * R); }
  const og = new THREE.BufferGeometry(); og.setAttribute("position", new THREE.Float32BufferAttribute(oc, 3));
  const orbitLine = new THREE.Line(og, new THREE.LineDashedMaterial({ color: GOLD, dashSize: 0.03, gapSize: 0.045, transparent: true, opacity: 0.45 }));
  orbitLine.computeLineDistances(); orbit.add(orbitLine);
  const cv = doc.createElement("canvas"); cv.width = cv.height = 128; const cx = cv.getContext("2d");
  cx.translate(64, 64); cx.fillStyle = "#F3D38A"; cx.shadowColor = "rgba(255,220,140,.9)"; cx.shadowBlur = 10;
  cx.beginPath(); // plane pointing +x
  cx.moveTo(46, 0); cx.quadraticCurveTo(40, -6, 30, -6); cx.lineTo(-30, -5); cx.lineTo(-44, -18); cx.lineTo(-50, -18); cx.lineTo(-42, -4);
  cx.lineTo(-44, 4); cx.lineTo(-50, 18); cx.lineTo(-44, 18); cx.lineTo(-30, 5); cx.lineTo(30, 6); cx.quadraticCurveTo(40, 6, 46, 0); cx.fill();
  cx.beginPath(); cx.moveTo(8, -5); cx.lineTo(-8, -46); cx.lineTo(-18, -46); cx.lineTo(-10, -5); cx.fill();
  cx.beginPath(); cx.moveTo(8, 5); cx.lineTo(-8, 46); cx.lineTo(-18, 46); cx.lineTo(-10, 5); cx.fill();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const planeHolder = new THREE.Object3D(); orbit.add(planeHolder);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  plane.rotation.x = -Math.PI / 2; planeHolder.add(plane);
  // trail
  const TR = 60, tp = new Float32Array((TR + 1) * 3), ta = [];
  for (let i = 0; i <= TR; i++) ta.push(i / TR);
  const tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.BufferAttribute(tp, 3)); tg.setAttribute("t", new THREE.Float32BufferAttribute(ta, 1));
  const trail = new THREE.Line(tg, new THREE.ShaderMaterial({ uniforms: { c: { value: GOLD } }, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: "attribute float t;varying float vT;void main(){vT=t;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform vec3 c;varying float vT;void main(){gl_FragColor=vec4(c,vT*vT*.9);}" }));
  orbit.add(trail);

  // face Chennai first
  const f = ll(CHN[0], CHN[1]); globe.rotation.y = Math.atan2(-f.x, f.z) + 0.35;

  // interaction: mouse tilt, touch horizontal drag (vertical scroll untouched)
  let tx = 0, ty = 0, rx = 0, ry = 0, spin = 0, drag = null, vel = 0;
  addEventListener("pointermove", e => {
    if (e.pointerType === "mouse") { tx = (e.clientY / innerHeight - .5) * 0.35; ty = (e.clientX / innerWidth - .5) * 0.6; }
  }, { passive: true });
  const cvs = renderer.domElement;
  cvs.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, h: null }; }, { passive: true });
  addEventListener("pointermove", e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (drag.h === null && Math.hypot(dx, dy) > 6) drag.h = Math.abs(dx) > Math.abs(dy);
    if (drag.h) { vel = dx * 0.006; spin += vel; drag.x = e.clientX; drag.y = e.clientY; }
    else if (drag.h === false && e.pointerType !== "mouse") { tx = Math.max(-.2, Math.min(.2, dy * 0.002)); }
  }, { passive: true });
  ["pointerup", "pointercancel"].forEach(t => addEventListener(t, () => { drag = null; }, { passive: true }));

  // render loop with offscreen / hidden pause
  let onScreen = true, raf = 0, last = performance.now(), time = 0, lastW = 0, lastH = 0;
  new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen) kick(); }, { threshold: 0 }).observe(host);
  doc.addEventListener("visibilitychange", () => { if (!doc.hidden) kick(); });
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  let firstFrame = true;
  function frame(now) {
    raf = 0;
    if (!onScreen || doc.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    const w = W(), h = H();
    if (w !== lastW || h !== lastH) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); lastW = w; lastH = h; }
    rx += (tx - rx) * 0.05; ry += (ty - ry) * 0.05;
    if (!drag) { vel *= 0.94; spin += vel; }
    globe.rotation.y += dt * 0.07;
    world.rotation.x = 0.32 + rx; world.rotation.y = ry + spin;
    pMat.uniforms.time.value = time; arcMat.uniforms.time.value = time;
    const s = 1 + (time * 0.8 % 1) * 2.2; ring.scale.set(s, s, s); ring.material.opacity = 1 - (time * 0.8 % 1);
    const a = time * 0.42;
    planeHolder.position.set(Math.cos(a) * R, 0, Math.sin(a) * R); planeHolder.rotation.y = -(a + Math.PI / 2);
    for (let i = 0; i <= TR; i++) { const b = a - (TR - i) * 0.012; tp[i * 3] = Math.cos(b) * R; tp[i * 3 + 1] = 0; tp[i * 3 + 2] = Math.sin(b) * R; }
    tg.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; host.classList.add("has-gl"); }
    raf = requestAnimationFrame(frame);
  }
  kick();
}

/* ---------- Choreography ---------- */
introDone.then(() => {
  // load three.js only after the intro (and after first paint), so the intro stays smooth
  const go = () => startGlobe();
  "requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 600 }) : setTimeout(go, 200);
  const g = doc.getElementById("globe");
  setTimeout(() => g && g.classList.add("is-in"), reduce ? 0 : 150);   // globe (already in if the intro played)
  setTimeout(startBuild, reduce ? 0 : 1000);                            // then the build sequence
});
