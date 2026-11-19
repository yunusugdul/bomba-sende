# NØVA — Kendi Evrenini Yarat

A high-end interactive creative-coding website in Turkish. Every universe is generated procedurally in Canvas 2D and can be shared with a reproducible URL.

## Features

- Procedural interactive planet with volumetric bands, layered orbits, drifting starfield and pointer-reactive energy waves
- Word-seeded, shareable universes (deterministic random generation)
- Five selectable atmospheres: Nebula, Solar, Abyss, Zen, Chaos
- Adjustable star density, audiovisual ambient synthesis with Web Audio API
- Exportable 1400 × 1800 PNG poster, social sharing / copy link
- Surprise mode and keyboard shortcuts: Space, R, M, S, ?
- Mobile-responsive, keyboard-accessible controls, reduced-motion support
- No framework, no build step, no runtime dependency, no analytics or tracking

## Run locally

Open `index.html` in a browser or run a static server:

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080`. Audio playback requires a user click; clipboard sharing requires HTTPS or localhost.

## Deploy to Render

Static Site, build command `echo 'No build needed'`, publish directory `wow-site` if publishing this folder inside its GitHub parent repository; otherwise `.`. The site was designed to live in a separate Git branch without changing any existing default-branch project.