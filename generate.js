const fs = require('fs');

function formatNumber(num, decimals = 4) {
  return num.toFixed(decimals);
}

function formatPercent(num) {
  return (num * 100).toFixed(2) + '%';
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function generateHTML(data) {
  const { generatedAt, opportunities, totalCount, source } = data;
  const lastUpdate = new Date(generatedAt).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Polymarket Arbitrage Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            neon: {
              blue: '#00f0ff',
              purple: '#a855f7',
              green: '#10b981',
              pink: '#ec4899',
            },
            dark: {
              900: '#0a0a0f',
              800: '#111118',
              700: '#1a1a24',
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #0a0a0f;
      color: #e5e7eb;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .neon-text {
      text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
    }
    .card-hover {
      transition: all 0.3s ease;
    }
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0, 240, 255, 0.15);
    }
    .badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
    }
    .badge-bullish { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-bearish { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
  </style>
</head>
<body class="min-h-screen bg-dark-900">
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <header class="mb-10 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-2 neon-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
        🎯 Polymarket Arbitrage
      </h1>
      <p class="text-gray-400 text-lg">
        Top ${totalCount} opportunities (YES+NO < 1) · Last updated: <span class="text-neon-blue font-mono">${lastUpdate}</span>
        ${source ? ` · Source: ${source}` : ''}
      </p>
      <div class="mt-4 flex justify-center gap-4 flex-wrap">
        <button onclick="location.reload()" class="px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded-lg hover:bg-neon-blue/30 transition text-neon-blue">
          🔄 Refresh now
        </button>
      </div>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div class="bg-dark-800 p-4 rounded-xl border border-dark-700">
        <div class="text-gray-400 text-sm">Opportunities</div>
        <div class="text-2xl font-bold text-neon-blue">${totalCount}</div>
      </div>
      <div class="bg-dark-800 p-4 rounded-xl border border-dark-700">
        <div class="text-gray-400 text-sm">Avg Spread</div>
        <div class="text-2xl font-bold text-neon-green">
          ${totalCount > 0 ? formatPercent(opportunities.reduce((a,b)=>a+b.spread,0)/totalCount) : '0.00%'}
        </div>
      </div>
      <div class="bg-dark-800 p-4 rounded-xl border border-dark-700">
        <div class="text-gray-400 text-sm">Max Spread</div>
        <div class="text-2xl font-bold text-neon-pink">
          ${totalCount > 0 ? formatPercent(Math.max(...opportunities.map(o=>o.spread))) : '0.00%'}
        </div>
      </div>
      <div class="bg-dark-800 p-4 rounded-xl border border-dark-700">
        <div class="text-gray-400 text-sm">Auto-refresh</div>
        <div class="text-lg font-mono text-neon-purple">60s</div>
      </div>
    </div>

    <!-- Opportunities Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      ${opportunities.map(opp => `
      <article class="bg-dark-800 rounded-xl p-5 border border-dark-700 card-hover cursor-pointer" onclick="window.open('https://polymarket.com/market/${opp.id}', '_blank')">
        <div class="flex items-start justify-between mb-3">
          <span class="badge ${opp.spread > 0.05 ? 'badge-bullish' : 'badge-bearish'}">
            ${formatPercent(opp.spread)} spread
          </span>
          <span class="text-xs text-gray-500">${formatTimeAgo(opp.updatedAt)}</span>
        </div>
        <h3 class="text-lg font-bold text-white mb-4 leading-tight">${opp.question}</h3>
        <div class="space-y-3 mb-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-400">YES</span>
            <div class="flex items-center gap-2">
              <div class="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div class="h-full bg-neon-blue" style="width: ${opp.yes * 100}%"></div>
              </div>
              <span class="font-mono text-neon-blue font-bold">${formatPercent(opp.yes)}</span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400">NO</span>
            <div class="flex items-center gap-2">
              <div class="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div class="h-full bg-neon-pink" style="width: ${opp.no * 100}%"></div>
              </div>
              <span class="font-mono text-neon-pink font-bold">${formatPercent(opp.no)}</span>
            </div>
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 border-t border-dark-700 pt-3">
          <span>Vol: $${opp.volume.toLocaleString()}</span>
          <span>Sum: ${formatNumber(opp.sum)}</span>
        </div>
      </article>
    `).join('')}
    </div>

    ${totalCount === 0 ? `
    <div class="text-center py-20">
      <div class="text-6xl mb-4">🤔</div>
      <h3 class="text-xl font-bold text-gray-300 mb-2">No arbitrage opportunities found</h3>
      <p class="text-gray-500">Check back in a minute. Market might be efficient or data unavailable.</p>
    </div>
    ` : ''}
  </div>

  <footer class="text-center py-8 text-gray-500 text-sm mt-12 border-t border-dark-800">
    Data from Polymarket API · Refreshes automatically · Made by EmilIA
  </footer>

  <script>
    // Auto-refresh every 60 seconds
    setTimeout(() => location.reload(), 60000);
  </script>
</body>
</html>`;
}

// Read data and generate (if called standalone)
if (require.main === module) {
  const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  const html = generateHTML(data);
  fs.writeFileSync('index.html', html);
  console.log('✅ index.html generated');
}

module.exports = { generateHTML, formatNumber, formatPercent, formatTimeAgo };