# Polymarket Arbitrage Dashboard

 Real-time arbitrage opportunities from Polymarket API.

## How it works

1. **GitHub Action** runs every minute (cron schedule)
2. Fetches active markets from Polymarket GraphQL API
3. Filters top 10 opportunities where `YES + NO < 1` (spread)
4. Generates `index.html` with Tailwind CSS
5. Auto-deploys to GitHub Pages (via push to `main`)

## Tech Stack

- **Backend**: Node.js (fetch GraphQL)
- **Frontend**: HTML + Tailwind CSS (static)
- **CI/CD**: GitHub Actions (1 min schedule)
- **Hosting**: GitHub Pages

## Setup & Deploy

### 1. Enable GitHub Pages

Go to repository **Settings → Pages**:

- **Source**: `Deploy from a branch`
- **Branch**: `main` → `/ (root)`
- Click **Save**

Wait 1-2 minutes. Your dashboard will be live at:

```
https://YOUR_USERNAME.github.io/polymarket-arbitrage-dashboard/
```

### 2. (Optional) Local Development

```bash
npm install
npm run fetch   # Fetch data and generate data.json
npm run generate # Generate index.html from data.json
npm run build   # Run both
npm start       # Serve locally at http://localhost:3000
```

## Files

- `fetch.js` – API fetch + filter logic
- `generate.js` – HTML generation with Tailwind
- `index.html` – Generated dashboard (gitignored)
- `.github/workflows/deploy.yml` – CI/CD

## Notes

- The GitHub Action runs **every minute** but GitHub may throttle free accounts to ~5 min minimum
- Data is fetched from the public Polymarket GraphQL API (no auth required)
- Opportunities are top 10 markets where `YES + NO < 1` (spread exists)

---

Made with ❤️ by EmilIA · [GitHub](https://github.com/emalaman/polymarket-arbitrage-dashboard)