# Polymarket Arbitrage Dashboard

 Real-time arbitrage opportunities from Polymarket API.

## How it works

1. GitHub Action runs every minute
2. Fetches active markets from Polymarket GraphQL API
3. Filters top 10 opportunities where `YES + NO < 1` (spread)
4. Generates `index.html` with Tailwind CSS
5. Auto-deploys to GitHub Pages

## Tech Stack

- **Backend**: Node.js (fetch GraphQL)
- **Frontend**: HTML + Tailwind CSS (static)
- **CI/CD**: GitHub Actions (1 min schedule)
- **Hosting**: GitHub Pages

## Local Development

```bash
npm install
npm run fetch   # Fetch data and generate HTML
npm start       # Serve locally
```

## Deploy

Push to `main` branch → GitHub Pages auto-deploys.

## Files

- `fetch.js` – API fetch + filter logic
- `generate.js` – HTML generation with Tailwind
- `index.html` – Generated dashboard (gitignored)
- `.github/workflows/deploy.yml` – CI/CD

---

Made with ❤️ by EmilIA