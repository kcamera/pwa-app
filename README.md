# PWA Dashboard

A simple Progressive Web App dashboard with three widgets:

- **Clock** — live time and date, updated every second
- **Random Advice** — fetches advice from [api.adviceslip.com](https://api.adviceslip.com) on demand
- **Notepad** — persists notes across reloads via `localStorage`

## Serve locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser, or `http://<your-local-ip>:8080` on a device on the same network.

## Project structure

```
index.html          App shell
manifest.json       PWA manifest (standalone display)
service-worker.js   Cache-first static assets, network-first for advice API
app.js              Widget logic
styles.css          Mobile-first styles (no external frameworks)
icons/              Placeholder app icons (192×192 and 512×512)
```

## Install to home screen (iOS)

1. Open the local URL in Safari
2. Tap the Share button → **Add to Home Screen**
3. The app launches without browser chrome
