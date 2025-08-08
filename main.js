import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import {
  NASA_API_KEY,
  INCLUDE_PLUTO,
  fetchPlanetaryData,
  getPlanetTextures,
  AU_IN_KM,
} from "./nasa_api.js";

/** ---------- Constants & scaling ---------- */
const DISTANCE_SCALE = 30; // 1 AU => 30 world units
const RADIUS_SCALE = 0.00005; // km -> world units (planets; the Sun is clamped separately)
const SUN_RADIUS_UNITS = 6; // make the Sun big but not overwhelming
const MAX_SPEED_MULTIPLIER = 1024;
const MIN_SPEED_MULTIPLIER = 1 / 1024;

// Default: 1 real day = 2 sec animation => 0.5 sim days / real sec
let simDaysPerSecond = 0.5;

// Simulation clock: base epoch JD (at selected date, midnight) and an offset in days
let baseJulianDay = toJulianDay(new Date());
let simDayOffset = 0; // progresses with RAF * simDaysPerSecond

/** ---------- Three.js setup ---------- */
const container = document.getElementById("canvas-container");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// Faint starfield
scene.background = new THREE.Color("#03060c");

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  20000
);
camera.position.set(0, 80, 160);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.target.set(0, 0, 0);
controls.maxDistance = 900;
controls.minDistance = 8;

const ambient = new THREE.AmbientLight(0x4a5a7f, 0.55);
scene.add(ambient);

const sunLight = new THREE.PointLight(0xfff2b0, 3.0, 0, 2.0);
scene.add(sunLight);

/** ---------- Sun ---------- */
const sunGeo = new THREE.SphereGeometry(SUN_RADIUS_UNITS, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd35c });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.name = "Sun";
scene.add(sun);

/** ---------- Globals ---------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const loader = new THREE.TextureLoader();
loader.setCrossOrigin("anonymous");

let orbitLinesVisible = true;
let planets = []; // [{ name, mesh, orbitLine, data, highResLoaded }]
let planetaryDataSource = "—"; // "horizons" or "fallback"

/** ---------- UI elements ---------- */
const toggleOrbitsBtn = document.getElementById("toggleOrbitsBtn");
const speedDownBtn = document.getElementById("speedDownBtn");
const speedUpBtn = document.getElementById("speedUpBtn");
const todayBtn = document.getElementById("todayBtn");
const resetViewBtn = document.getElementById("resetViewBtn");
const dateInput = document.getElementById("dateInput");
const speedLabel = document.getElementById("speedLabel");
const sourceLabel = document.getElementById("sourceLabel");
const banner = document.getElementById("api-banner");
const retryBtn = document.getElementById("retryBtn");

const infoCard = document.getElementById("info-card");
const infoName = document.getElementById("info-name");
const infoRadius = document.getElementById("info-radius");
const infoSpeed = document.getElementById("info-speed");
const infoDistance = document.getElementById("info-distance");
const infoAnomaly = document.getElementById("info-anomaly");
const infoPeriod = document.getElementById("info-period");
const infoClose = document.getElementById("info-close");
let selectedPlanet = null;

updateSpeedLabel();

/** ---------- Init: fetch NASA data then build scene ---------- */
((async function init() {
  // מתחילים רינדור מיד כדי שתראה את השמש גם אם ה-API איטי
  animate();

  let pack;
  try {
    // אם ה-API לא עונה תוך 4 שניות – נזרוק timeout ונשתמש בפולבאק
    pack = await Promise.race([
      fetchPlanetaryData(new Date()),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000)),
    ]);
  } catch {
    // ניסיון נוסף – הפונקציה כבר יודעת ליפול לפולבאק
    pack = await fetchPlanetaryData(new Date());
  }

  const { data, source, fallbackUsed } = pack;
  planetaryDataSource = source;
  setSourceLabel(source);
  banner.classList.toggle("hidden", !fallbackUsed);
  buildPlanets(data);
})();

/** ---------- Build planet meshes & orbits ---------- */
function buildPlanets(planetData) {
  const textures = getPlanetTextures();

  planetData.forEach((p) => {
    // Mesh
    const radiusUnits = clamp(
      p.radius_km * RADIUS_SCALE,
      0.15,
      p.name === "Jupiter" ? 1.8 : 1.2
    );
    const geom = new THREE.SphereGeometry(radiusUnits, 48, 48);

    const mat = new THREE.MeshStandardMaterial({
      color: p.fallbackColor ?? 0x888888,
      roughness: 1.0,
      metalness: 0.0,
    });

    // Low-res texture first
    const texLow = textures[p.name]?.low;
    if (texLow) {
      loader.load(
        texLow,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          mat.map = t;
          mat.needsUpdate = true;
        },
        undefined,
        () => {
          // ignore image failure; material color stays
        }
      );
    }

    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = p.name;
    mesh.userData.planet = p;

    // Orbit line (ellipse in planet's orbital plane)
    const ellipse = makeOrbitEllipse(p.elements);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x7aa2ff,
      transparent: true,
      opacity: 0.25,
    });
    const orbit = new THREE.LineLoop(ellipse, orbitMat);
    orbit.visible = orbitLinesVisible;

    scene.add(mesh);
    scene.add(orbit);

    planets.push({
      name: p.name,
      mesh,
      orbitLine: orbit,
      data: p,
      highResLoaded: false,
    });
  });
}

/** ---------- Geometry helpers ---------- */
function makeOrbitEllipse(el) {
  // Ellipse defined in its orbital plane, then rotate to ECLIPTIC J2000.
  const a_au = el.semiMajorAxis_au;
  const e = el.eccentricity ?? 0;
  const b_au = a_au * Math.sqrt(1 - e * e);

  const points = [];
  const steps = 512;
  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    // Parametric ellipse in perifocal frame:
    const x_pf = a_au * Math.cos(theta) - a_au * e; // shift so Sun at a focus
    const y_pf = b_au * Math.sin(theta);
    const z_pf = 0;

    const v = rotatePerifocalToEcliptic(x_pf, y_pf, z_pf, el);
    points.push(
      new THREE.Vector3(
        v.x * DISTANCE_SCALE,
        v.y * DISTANCE_SCALE,
        v.z * DISTANCE_SCALE
      )
    );
  }
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  return geom;
}

function rotatePerifocalToEcliptic(x, y, z, el) {
  // Using standard 3-1-3 rotations: Ω, i, ω (ascending node, inclination, argument of periapsis)
  const Ω = toRad(el.longAscNode_deg ?? 0);
  const i = toRad(el.inclination_deg ?? 0);
  const ω = toRad(el.argPeriapsis_deg ?? 0);

  // Rotation matrices combined (see Vallado): r_ECI = Rz(Ω) * Rx(i) * Rz(ω) * r_pf
  // We'll apply stepwise.
  const cosΩ = Math.cos(Ω), sinΩ = Math.sin(Ω);
  const cosi = Math.cos(i), sini = Math.sin(i);
  const cosω = Math.cos(ω), sinω = Math.sin(ω);

  // First Rz(ω)
  const x1 = x * cosω - y * sinω;
  const y1 = x * sinω + y * cosω;
  const z1 = z;

  // Then Rx(i)
  const x2 = x1;
  const y2 = y1 * cosi - z1 * sini;
  const z2 = y1 * sini + z1 * cosi;

  // Then Rz(Ω)
  const x3 = x2 * cosΩ - y2 * sinΩ;
  const y3 = x2 * sinΩ + y2 * cosΩ;
  const z3 = z2;

  return { x: x3, y: y3, z: z3 };
}

/** ---------- Animation ---------- */
const clock = new THREE.Clock();
function animate() {
  const dt = clock.getDelta(); // seconds since last frame
  simDayOffset += dt * simDaysPerSecond;

  const jd = baseJulianDay + simDayOffset;

  // Update planets
  for (const p of planets) {
    const pos = planetPositionAtJD(p.data.elements, jd);
    p.mesh.position.set(
      pos.x * DISTANCE_SCALE,
      pos.y * DISTANCE_SCALE,
      pos.z * DISTANCE_SCALE
    );

    // Spin the planet slowly for visual interest (not physically accurate here)
    p.mesh.rotation.y += 0.01;

    // High-res texture upgrade when close
    maybeUpgradeTexture(p);
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

/** ---------- Orbit propagation (Kepler) ---------- */
function planetPositionAtJD(el, jd) {
  const a = el.semiMajorAxis_au;
  const e = el.eccentricity ?? 0;
  const i = toRad(el.inclination_deg ?? 0);
  const Ω = toRad(el.longAscNode_deg ?? 0);
  const ω = toRad(el.argPeriapsis_deg ?? 0);

  // Mean motion n (deg/day)
  const n_deg = el.meanMotion_deg_per_day ?? (360.0 / (el.period_days ?? 365.25));
  const n = toRad(n_deg); // rad/day

  const M0 = toRad(el.meanAnomaly_deg ?? 0);
  const t_days = jd - (el.epoch_jd ?? J2000());
  const M = wrapRad(M0 + n * t_days);

  // Solve Kepler for E
  const E = solveKepler(M, e);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);

  // Perifocal coordinates
  const x_pf = a * (cosE - e);
  const y_pf = a * Math.sqrt(1 - e * e) * sinE;
  const z_pf = 0;

  // Rotate to ecliptic
  const cosΩ = Math.cos(Ω), sinΩ = Math.sin(Ω);
  const cosi = Math.cos(i), sini = Math.sin(i);
  const cosω = Math.cos(ω), sinω = Math.sin(ω);

  // As in rotation helper but inline for speed
  const x1 = x_pf * cosω - y_pf * sinω;
  const y1 = x_pf * sinω + y_pf * cosω;
  const z1 = 0;

  const x2 = x1;
  const y2 = y1 * cosi - z1 * sini;
  const z2 = y1 * sini + z1 * cosi;

  const x3 = x2 * cosΩ - y2 * sinΩ;
  const y3 = x2 * sinΩ + y2 * cosΩ;
  const z3 = z2;

  return { x: x3, y: y3, z: z3 };
}

/** Solve Kepler’s equation M = E - e sin E via Newton-Raphson */
function solveKepler(M, e) {
  let E = e < 0.8 ? M : Math.PI;
  const maxIter = 20;
  for (let i = 0; i < maxIter; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = -f / fp;
    E += dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

/** ---------- Selection & Info Card ---------- */
window.addEventListener("pointerdown", onPointerDown);
function onPointerDown(ev) {
  pointer.x = (ev.clientX / renderer.domElement.clientWidth) * 2 - 1;
  pointer.y = -(ev.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(planets.map((p) => p.mesh), false);
  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    const record = planets.find((p) => p.mesh === mesh);
    if (record) {
      selectedPlanet = record;
      showInfoCard(record);
    }
  }
}

function showInfoCard(rec) {
  const p = rec.data;
  const jd = baseJulianDay + simDayOffset;
  const pos = planetPositionAtJD(p.elements, jd);
  const r_au = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
  const r_km = r_au * AU_IN_KM;

  // True anomaly from E:
  const e = p.elements.eccentricity ?? 0;
  const n_deg = p.elements.meanMotion_deg_per_day ?? (360 / (p.elements.period_days ?? 365.25));
  const M0 = toRad(p.elements.meanAnomaly_deg ?? 0);
  const t_days = jd - (p.elements.epoch_jd ?? J2000());
  const M = wrapRad(M0 + toRad(n_deg) * t_days);
  const E = solveKepler(M, e);
  const tanHalfNu = Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2);
  const nu = wrapRad(2 * Math.atan(tanHalfNu)); // true anomaly

  document.getElementById("info-name").textContent = p.name;
  document.getElementById("info-radius").textContent = `${fmtNum(p.radius_km)} km`;
  document.getElementById("info-speed").textContent = p.meanOrbitalSpeed_kms
    ? `${p.meanOrbitalSpeed_kms.toFixed(2)} km/s`
    : "—";
  document.getElementById("info-distance").textContent = `${r_au.toFixed(3)} AU  (${fmtNum(r_km)} km)`;
  document.getElementById("info-anomaly").textContent = `${toDeg(nu).toFixed(2)}°`;
  document.getElementById("info-period").textContent = `${(p.elements.period_days ?? 0).toFixed(1)} days`;

  document.getElementById("info-card").classList.remove("hidden");
}

document.getElementById("info-close").addEventListener("click", () => document.getElementById("info-card").classList.add("hidden"));

/** ---------- High-res texture upgrade when close ---------- */
function maybeUpgradeTexture(rec) {
  if (rec.highResLoaded) return;
  const camDist = camera.position.distanceTo(rec.mesh.position);
  const trigger = 12 + rec.mesh.geometry.parameters.radius * 40;
  if (camDist < trigger) {
    const urls = getPlanetTextures()[rec.name];
    const hi = urls?.high;
    if (hi) {
      loader.load(
        hi,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          const mat = rec.mesh.material;
          mat.map = t;
          mat.needsUpdate = true;
          rec.highResLoaded = true;
        },
        undefined,
        () => {}
      );
    }
  }
}

/** ---------- UI handlers ---------- */
toggleOrbitsBtn.addEventListener("click", () => {
  orbitLinesVisible = !orbitLinesVisible;
  planets.forEach((p) => (p.orbitLine.visible = orbitLinesVisible));
});

speedUpBtn.addEventListener("click", () => {
  simDaysPerSecond = clamp(simDaysPerSecond * 2, MIN_SPEED_MULTIPLIER, MAX_SPEED_MULTIPLIER);
  updateSpeedLabel();
});
speedDownBtn.addEventListener("click", () => {
  simDaysPerSecond = clamp(simDaysPerSecond / 2, MIN_SPEED_MULTIPLIER, MAX_SPEED_MULTIPLIER);
  updateSpeedLabel();
});

todayBtn.addEventListener("click", () => {
  const now = new Date();
  baseJulianDay = toJulianDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  simDayOffset = 0;
  dateInput.valueAsDate = now;
});

dateInput.valueAsDate = new Date();
dateInput.addEventListener("change", (e) => {
  const chosen = e.target.value ? new Date(e.target.value) : new Date();
  baseJulianDay = toJulianDay(new Date(chosen.getFullYear(), chosen.getMonth(), chosen.getDate()));
  simDayOffset = 0;
});

resetViewBtn.addEventListener("click", () => {
  camera.position.set(0, 80, 160);
  controls.target.set(0, 0, 0);
  controls.update();
  simDaysPerSecond = 0.5;
  updateSpeedLabel();
});

retryBtn.addEventListener("click", async () => {
  banner.classList.add("hidden");
  // Clear current planets
  for (const p of planets) {
    scene.remove(p.mesh);
    scene.remove(p.orbitLine);
  }
  planets = [];
  const { data, source, fallbackUsed } = await fetchPlanetaryData(new Date());
  planetaryDataSource = source;
  setSourceLabel(source);
  banner.classList.toggle("hidden", !fallbackUsed);
  buildPlanets(data);
});

function setSourceLabel(src) {
  const nice = src === "horizons" ? "NASA HORIZONS" : "Fallback";
  sourceLabel.textContent = `Source: ${nice}`;
  sourceLabel.style.color = src === "horizons" ? "var(--success)" : "var(--warning)";
}

/** ---------- Utilities ---------- */
function updateSpeedLabel() {
  // Invert: how many seconds per sim day?
  const secondsPerDay = 1 / simDaysPerSecond;
  // Format as “1 day = X sec”
  const label =
    secondsPerDay >= 1
      ? `1 day = ${secondsPerDay.toFixed(0)} sec`
      : `${(1 / secondsPerDay).toFixed(1)} days/sec`;
  speedLabel.textContent = label;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function toRad(d) { return (d * Math.PI) / 180; }
function toDeg(r) { return (r * 180) / Math.PI; }
function wrapRad(r) {
  let x = r % (2 * Math.PI);
  if (x < 0) x += 2 * Math.PI;
  return x;
}

function toJulianDay(date) {
  // Meeus algorithm; treat date as UTC midnight
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 5);
  const JD = Math.floor(365.25 * (y + 4716))
    + Math.floor(30.6001 * (m + 1))
    + D + B - 1524.5;
  return JD;
}

function J2000() { return 2451545.0; } // 2000-01-01 12:00 TT

function fmtNum(n) {
  // Human-readable large number formatting
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return n.toFixed(0);
}

/** ---------- Resize ---------- */
window.addEventListener("resize", () => {
  const { innerWidth: w, innerHeight: h } = window;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
