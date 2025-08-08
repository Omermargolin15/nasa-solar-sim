# NASA-Powered 3D Solar System Simulator (Three.js)

An interactive, production-ready 3D Solar System you can run locally by just opening `index.html` — no build step required.  
It fetches **real planetary orbital elements** from NASA/JPL **HORIZONS** (via the Solar System Dynamics API) and applies **NASA image textures** for planets. If the API isn’t reachable (CORS/offline/rate limits), a **graceful offline fallback** with vetted orbital/physical data kicks in automatically.

> **Highlights**
> - 3D scene with Sun + 8 planets (Pluto optional to enable).
> - Live orbital elements from NASA HORIZONS (J2000/Ecliptic), with Kepler propagation.
> - Click any planet to open a compact **Info Card** (name, radius, speed, distance from Sun, current true anomaly).
> - **Time controls**: speed ±, jump to date, “Today”, and reset camera.
> - Toggle orbits on/off, smooth camera orbits/zoom (desktop & mobile).
> - **Performance-aware**: requestAnimationFrame loop, low-res textures by default, **auto-upgrade** to high-res textures when you zoom in.

---

## Features

- **Three.js** rendering: physically-inspired lighting (Sun as bright emitter + ambient light), responsive UI.
- **NASA API integration**
  - **JPL SSD HORIZONS API** for orbital elements per planet (semi-major axis, eccentricity, inclination, ascending node, argument of periapsis, mean anomaly, period).
  - **NASA Image and Video Library** texture URLs (loaded on demand).
- **Scales:** Distances and radii are scaled for visibility while preserving relative proportions.
- **Graceful fallback:** If HORIZONS or textures fail, you still get a working simulator.

---

## Screenshots (placeholders)

- `screenshots/hero.png`
- `screenshots/info-card.png`
- `screenshots/mobile.png`

---

## NASA APIs

- **JPL SSD HORIZONS** (no API key required) — ephemerides/orbital elements used to compute positions:
  - Docs: https://ssd.jpl.nasa.gov/horizons/
  - JSON endpoint used in this project (queried per planet/date).
- **NASA Image and Video Library** (textures; no key required):
  - Docs: https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf
- (Optional) **api.nasa.gov** services support a **DEMO_KEY**; we expose `NASA_API_KEY` in `nasa_api.js` so you can paste your own if you later add more endpoints.
  - Get your key here: https://api.nasa.gov/

> **Note:** Some government endpoints occasionally restrict cross-origin requests. This app auto-falls back to local static data; you’ll see an in-app notice if that happens.

---

## How to Run Locally

**Easiest:** Just double-click `index.html`.  
That’s it — it loads Three.js from a CDN and runs entirely in the browser.

If your browser blocks local file cross-origin module loads, open with a tiny static server:

```sh
# Python 3
python -m http.server 8080
# then browse http://localhost:8080
```

---

## Deploy (Free)

### GitHub Pages
1. Create a new repo and push these files.
2. In repo settings → **Pages**, set branch to `main` and folder `/root` (or `/docs` if you move files there).
3. Wait for the green check; your site URL will appear in Pages settings.

### Vercel
1. Import the repo in https://vercel.com/new (framework: “Other”).
2. Deploy. (No server code needed.)

---

## Configuration

Open `nasa_api.js`:
- Optionally replace `export const NASA_API_KEY = 'DEMO_KEY';` with your key if you plan to extend the app to api.nasa.gov endpoints.
- Toggle Pluto by setting `INCLUDE_PLUTO = true`.

---

## MIT License

This project is released under the MIT License. See the license statement at the end of this README.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
