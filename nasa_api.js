// --- QUICK FIX: force fallback so the app shows planets even if HORIZONS is slow/blocked
const FORCE_FALLBACK = true;
export const NASA_API_KEY = 'DEMO_KEY'; // For api.nasa.gov endpoints (not required here)
export const INCLUDE_PLUTO = false;
export const AU_IN_KM = 149_597_870.7;

// Horizons numeric IDs
const HORIZONS_IDS = {
  Mercury: "199",
  Venus: "299",
  Earth: "399",
  Mars: "499",
  Jupiter: "599",
  Saturn: "699",
  Uranus: "799",
  Neptune: "899",
  Pluto: "999",
};

// Physical data
const PHYSICALS = {
  Mercury: { radius_km: 2439.7, color: 0xc7b39b },
  Venus:   { radius_km: 6051.8, color: 0xe2cda1 },
  Earth:   { radius_km: 6371.0, color: 0x7fb0ff },
  Mars:    { radius_km: 3389.5, color: 0xc55a38 },
  Jupiter: { radius_km: 69911,  color: 0xd2b48c },
  Saturn:  { radius_km: 58232,  color: 0xd6c8a1 },
  Uranus:  { radius_km: 25362,  color: 0x9ad1e3 },
  Neptune: { radius_km: 24622,  color: 0x4a6cff },
  Pluto:   { radius_km: 1188.3, color: 0xcab9a6 },
};

// Fallback orbital elements
const FALLBACK_ELEMENTS = [
  {
    name: "Mercury",
    semiMajorAxis_au: 0.387098,
    eccentricity: 0.205630,
    inclination_deg: 7.005,
    longAscNode_deg: 48.331,
    argPeriapsis_deg: 29.124,
    meanAnomaly_deg: 174.796,
    meanMotion_deg_per_day: 4.09233445,
    period_days: 87.969,
    epoch_jd: 2451545.0,
  },
  {
    name: "Venus",
    semiMajorAxis_au: 0.723332,
    eccentricity: 0.006772,
    inclination_deg: 3.395,
    longAscNode_deg: 76.680,
    argPeriapsis_deg: 54.884,
    meanAnomaly_deg: 50.416,
    meanMotion_deg_per_day: 1.60213034,
    period_days: 224.701,
    epoch_jd: 2451545.0,
  },
  {
    name: "Earth",
    semiMajorAxis_au: 1.000000,
    eccentricity: 0.0167086,
    inclination_deg: 0.00005,
    longAscNode_deg: -11.26064,
    argPeriapsis_deg: 114.20783,
    meanAnomaly_deg: 358.617,
    meanMotion_deg_per_day: 0.9856076686,
    period_days: 365.256,
    epoch_jd: 2451545.0,
  },
  {
    name: "Mars",
    semiMajorAxis_au: 1.523679,
    eccentricity: 0.0934,
    inclination_deg: 1.850,
    longAscNode_deg: 49.558,
    argPeriapsis_deg: 286.502,
    meanAnomaly_deg: 19.373,
    meanMotion_deg_per_day: 0.5240329502,
    period_days: 686.980,
    epoch_jd: 2451545.0,
  },
  {
    name: "Jupiter",
    semiMajorAxis_au: 5.2044,
    eccentricity: 0.0489,
    inclination_deg: 1.303,
    longAscNode_deg: 100.464,
    argPeriapsis_deg: 273.867,
    meanAnomaly_deg: 20.020,
    meanMotion_deg_per_day: 0.08308529,
    period_days: 4332.589,
    epoch_jd: 2451545.0,
  },
  {
    name: "Saturn",
    semiMajorAxis_au: 9.5826,
    eccentricity: 0.0565,
    inclination_deg: 2.485,
    longAscNode_deg: 113.665,
    argPeriapsis_deg: 339.392,
    meanAnomaly_deg: 317.020,
    meanMotion_deg_per_day: 0.0334443,
    period_days: 10759.22,
    epoch_jd: 2451545.0,
  },
  {
    name: "Uranus",
    semiMajorAxis_au: 19.1913,
    eccentricity: 0.0457,
    inclination_deg: 0.773,
    longAscNode_deg: 74.006,
    argPeriapsis_deg: 96.998857,
    meanAnomaly_deg: 142.2386,
    meanMotion_deg_per_day: 0.0116943,
    period_days: 30687.15,
    epoch_jd: 2451545.0,
  },
  {
    name: "Neptune",
    semiMajorAxis_au: 30.07,
    eccentricity: 0.0113,
    inclination_deg: 1.770,
    longAscNode_deg: 131.784,
    argPeriapsis_deg: 272.846,
    meanAnomaly_deg: 256.228,
    meanMotion_deg_per_day: 0.005963,
    period_days: 60189.0,
    epoch_jd: 2451545.0,
  },
  {
    name: "Pluto",
    semiMajorAxis_au: 39.482,
    eccentricity: 0.2488,
    inclination_deg: 17.16,
    longAscNode_deg: 110.299,
    argPeriapsis_deg: 113.834,
    meanAnomaly_deg: 14.53,
    meanMotion_deg_per_day: 0.00396,
    period_days: 90560,
    epoch_jd: 2451545.0,
  },
];

export function getPlanetTextures() {
  return {
    Mercury: {
      low: "https://images-assets.nasa.gov/image/PIA19216/PIA19216~small.jpg",
      high: "https://images-assets.nasa.gov/image/PIA19216/PIA19216~orig.jpg",
    },
    Venus: {
      low: "https://images-assets.nasa.gov/image/PIA00159/PIA00159~small.jpg",
      high: "https://images-assets.nasa.gov/image/PIA00159/PIA00159~orig.jpg",
    },
    Earth: {
      low: "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200407.3x5400x2700.jpg",
      high: "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200407.3x5400x2700.jpg",
    },
    Mars: {
      low: "https://images-assets.nasa.gov/image/PIA00407/PIA00407~small.jpg",
      high: "https://images-assets.nasa.gov/image/PIA00407/PIA00407~orig.jpg",
    },
    Jupiter: {
      low: "https://images-assets.nasa.gov/image/PIA22946/PIA22946~small.jpg",
      high: "https://images-assets.nasa.gov/image/PIA22946/PIA22946~orig.jpg",
    },
    Saturn: {
      low: "https://images-assets.nasa.gov/image/PIA21046/PIA21046~small.jpg",
      high: "https://images-assets.nasa.gov/image/PIA21046/PIA21046~orig.jpg",
    },
    Uranus: {
      low: "https://images-assets.nasa.gov/image/PIA18182/PIA18182~small.jpg",
      high: "https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg",
    },
    Neptune: {
      low: "https://images-assets.nasa.gov/image/PIA01492/PIA01492~small.jpg",
      high: "https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg",
    },
    Pluto: {
      low: "https://images-assets.nasa.gov/image/PIA19952/PIA19952~small.jpg",
      high: "https://images-assets.nasa.gov/image/PIA19952/PIA19952~orig.jpg",
    },
  };
}

/**
 * Fetch planetary data (orbital elements from HORIZONS, physical sizes from PHYSICALS).
 * Returns { data: PlanetRecord[], source: "horizons"|"fallback", fallbackUsed: boolean }
 */
export async function fetchPlanetaryData(dateObj) {
  if (FORCE_FALLBACK) {
    const targets = [
      "Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune",
      ...(INCLUDE_PLUTO ? ["Pluto"] : []),
    ];
    const records = FALLBACK_ELEMENTS
      .filter((el) => targets.includes(el.name))
      .map((el) => {
        const phys = PHYSICALS[el.name];
        const p = el.period_days ?? 365.256 * Math.pow(el.semiMajorAxis_au, 1.5);
        return {
          name: el.name,
          radius_km: phys.radius_km,
          fallbackColor: phys.color,
          elements: el,
          meanOrbitalSpeed_kms: (2 * Math.PI * (el.semiMajorAxis_au * AU_IN_KM)) / (p * 86400),
        };
      });
    return { data: records, source: "fallback", fallbackUsed: true };
  }

  const targets = [
    "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune",
    ...(INCLUDE_PLUTO ? ["Pluto"] : []),
  ];

  // Try HORIZONS first
  try {
    const elements = await fetchHorizonsElements(targets, dateObj);
    const records = targets.map((name) => {
      const el = elements[name];
      const phys = PHYSICALS[name];
      const period_days = el.period_days ?? estimatePeriodDays(el.semiMajorAxis_au);
      return {
        name,
        radius_km: phys.radius_km,
        fallbackColor: phys.color,
        elements: {
          ...el,
          period_days,
        },
        meanOrbitalSpeed_kms: averageOrbitalSpeed(el.semiMajorAxis_au, period_days),
      };
    });

    return { data: records, source: "horizons", fallbackUsed: false };
  } catch (err) {
    console.warn("HORIZONS failed, using fallback:", err);
    const records = FALLBACK_ELEMENTS
      .filter((el) => targets.includes(el.name))
      .map((el) => {
        const phys = PHYSICALS[el.name];
        const p = el.period_days ?? estimatePeriodDays(el.semiMajorAxis_au);
        return {
          name: el.name,
          radius_km: phys.radius_km,
          fallbackColor: phys.color,
          elements: el,
          meanOrbitalSpeed_kms: averageOrbitalSpeed(el.semiMajorAxis_au, p),
        };
      });

    return { data: records, source: "fallback", fallbackUsed: true };
  }
}

async function fetchHorizonsElements(names, dateObj) {
  const dateStr = isoDate(dateObj); // YYYY-MM-DD
  const center = "500@0"; // Solar System Barycenter
  const params = [
    "format=json",
    "MAKE_EPHEM=YES",
    "EPHEM_TYPE=ELEMENTS",
    "OBJ_DATA=NO",
    "OUT_UNITS=AU-D",
    "REF_PLANE=ECLIPTIC",
    "REF_SYSTEM=J2000",
    `CENTER=${encodeURIComponent(center)}`,
    `START_TIME=${encodeURIComponent(dateStr)}`,
    `STOP_TIME=${encodeURIComponent(dateStr)}`,
    "STEP_SIZE=1%20d",
  ].join("&");

  const results = await Promise.all(
    names.map(async (name) => {
      const id = HORIZONS_IDS[name];
      const url = `https://ssd.jpl.nasa.gov/api/horizons.api?COMMAND=${id}&${params}`;
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error(`HORIZONS HTTP ${res.status}`);
      const json = await res.json();
      const text = json.result || json.data || "";
      const parsed = parseHorizonsElements(text);
      if (!parsed) throw new Error(`Parse fail for ${name}`);
      return [name, parsed];
    })
  );

  return Object.fromEntries(results);
}

function parseHorizonsElements(text) {
  const blockMatch = text.match(/\$\$SOE([\s\S]*?)\$\$EOE/);
  if (!blockMatch) return null;
  const block = blockMatch[1];

  const pick = (label) => {
    const re = new RegExp(`\\b${label}\\s*=\\s*([\\d.+\\-Ee]+)`);
    const m = block.match(re);
    return m ? parseFloat(m[1]) : undefined;
  };

  const EC = pick("EC");
  const IN = pick("IN");
  const OM = pick("OM");
  const W = pick("\\bW\\b");
  const MA = pick("MA");
  const A = pick("\\bA\\b");
  const PR = pick("PR");
  const N = pick("\\bN\\b");
  const epochJD = (() => {
    const m = block.match(/JDTDB\s*=\s*([0-9.]+)/);
    return m ? parseFloat(m[1]) : 2451545.0;
  })();

  if (A === undefined) return null;
  return {
    semiMajorAxis_au: A,
    eccentricity: EC ?? 0,
    inclination_deg: IN ?? 0,
    longAscNode_deg: OM ?? 0,
    argPeriapsis_deg: W ?? 0,
    meanAnomaly_deg: MA ?? 0,
    period_days: PR,
    epoch_jd: epochJD,
    meanMotion_deg_per_day: N,
  };
}

function isoDate(d) { return d.toISOString().slice(0, 10); }
function estimatePeriodDays(a_au) {
  return 365.256 * Math.pow(a_au, 1.5);
}
function averageOrbitalSpeed(a_au, period_days) {
  const a_km = a_au * AU_IN_KM;
  const circumference_km = 2 * Math.PI * a_km;
  const seconds = period_days * 86400;
  return circumference_km / seconds;
}
