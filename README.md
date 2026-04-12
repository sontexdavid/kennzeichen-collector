# Kennzeichen Sammeln

A web app for collecting German vehicle license plate codes. Perfect for road trips — discover and collect all 474 German Kennzeichen!

**[Play now](https://sontexdavid.github.io/kennzeichen-collector/)**

## Features

- **List** — Searchable list of all 474 German license plate codes with filters by state and collection status
- **Map** — Interactive map of Germany with progress visualization per state
- **Statistics** — Overall progress, per-state breakdown, and recently collected plates
- **Detail view** — Info for each Kennzeichen with license plate styling
- **Offline support** — Works without internet connection (PWA)
- **Mobile-first** — Designed for use on the go

## Tech

- Vanilla HTML, CSS & JavaScript — no frameworks, no build tools
- Data stored in the browser via localStorage
- Hosted on GitHub Pages

## Run locally

```bash
git clone https://github.com/sontexdavid/kennzeichen-collector.git
cd kennzeichen-collector

python3 -m http.server 8080
# Open http://localhost:8080
```

## License

MIT
