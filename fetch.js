const fs = require('fs');

// Polymarket Gamma API endpoint
const API_URL = 'https://gamma-api.polymarket.com/graphql';

const QUERY = `
query ActiveMarkets {
  markets(
    first: 100
    where: { closed: false }
    orderBy: updatedAt
    orderDirection: desc
  ) {
    id
    question
    outcomePrices
    updatedAt
    volume
    liquidity {
      YES
      NO
    }
  }
}
`;

async function fetchMarkets() {
  try {
    console.log(`Fetching from ${API_URL}`);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY }),
    });

    const text = await response.text();
    if (!response.ok) {
      console.log(`HTTP ${response.status}: ${text.substring(0, 200)}...`);
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
    }

    const data = JSON.parse(text);
    
    if (data.errors) {
      console.log(`GraphQL errors:`, data.errors.map(e => e.message).join(', '));
      throw new Error('GraphQL errors from API');
    }

    const markets = data.data?.markets || [];
    console.log(`✅ Success! Got ${markets.length} markets`);
    return markets;
  } catch (error) {
    console.error(`❌ Error fetching markets:`, error.message);
    throw error;
  }
}

function calculateArbitrage(market) {
  const prices = market.outcomePrices || [];
  const yes = parseFloat(prices[0]) || 0;
  const no = parseFloat(prices[1]) || 0;
  const sum = yes + no;
  const spread = 1 - sum;
  
  return {
    id: market.id,
    question: market.question,
    yes,
    no,
    sum,
    spread,
    volume: market.volume || 0,
    liquidity: market.liquidity || { YES: 0, NO: 0 },
    updatedAt: market.updatedAt,
  };
}

function filterOpportunities(markets, limit = 10) {
  const withArbitrage = markets
    .map(calculateArbitrage)
    .filter(m => m.sum < 1 && m.spread > 0)
    .sort((a, b) => b.spread - a.spread);
  
  return withArbitrage.slice(0, limit);
}

// Mock data for demo when API fails
function generateMockData() {
  console.log('🛠️ Generating mock data for demonstration...');
  const mockMarkets = [
    {
      id: 'mock-1',
      question: 'Will Bitcoin reach $100K by end of 2025?',
      outcomePrices: [0.45, 0.52],
      updatedAt: new Date().toISOString(),
      volume: 1500000,
      liquidity: { YES: 500000, NO: 520000 },
    },
    {
      id: 'mock-2',
      question: 'Will Ethereum ETF be approved in Q2 2025?',
      outcomePrices: [0.62, 0.35],
      updatedAt: new Date().toISOString(),
      volume: 2300000,
      liquidity: { YES: 620000, NO: 350000 },
    },
    {
      id: 'mock-3',
      question: 'Will Trump win the 2024 US election?',
      outcomePrices: [0.48, 0.50],
      updatedAt: new Date().toISOString(),
      volume: 5000000,
      liquidity: { YES: 480000, NO: 500000 },
    },
    {
      id: 'mock-4',
      question: 'Will Fed cut rates in June 2025?',
      outcomePrices: [0.72, 0.25],
      updatedAt: new Date().toISOString(),
      volume: 1200000,
      liquidity: { YES: 720000, NO: 250000 },
    },
    {
      id: 'mock-5',
      question: 'Will Solana flip Ethereum market cap by 2026?',
      outcomePrices: [0.18, 0.80],
      updatedAt: new Date().toISOString(),
      volume: 800000,
      liquidity: { YES: 180000, NO: 800000 },
    },
    {
      id: 'mock-6',
      question: 'Will AI regulation pass US Congress in 2025?',
      outcomePrices: [0.55, 0.42],
      updatedAt: new Date().toISOString(),
      volume: 650000,
      liquidity: { YES: 550000, NO: 420000 },
    },
    {
      id: 'mock-7',
      question: 'Will Recession hit US in 2025?',
      outcomePrices: [0.38, 0.60],
      updatedAt: new Date().toISOString(),
      volume: 1800000,
      liquidity: { YES: 380000, NO: 600000 },
    },
    {
      id: 'mock-8',
      question: 'Will Bitcoin ETF inflows turn positive in Q2?',
      outcomePrices: [0.52, 0.45],
      updatedAt: new Date().toISOString(),
      volume: 950000,
      liquidity: { YES: 520000, NO: 450000 },
    },
    {
      id: 'mock-9',
      question: 'Will Ethereum 2.0 upgrade complete in 2025?',
      outcomePrices: [0.70, 0.28],
      updatedAt: new Date().toISOString(),
      volume: 1100000,
      liquidity: { YES: 700000, NO: 280000 },
    },
    {
      id: 'mock-10',
      question: 'Will CBDC launch in US by 2026?',
      outcomePrices: [0.22, 0.75],
      updatedAt: new Date().toISOString(),
      volume: 720000,
      liquidity: { YES: 220000, NO: 750000 },
    },
    {
      id: 'mock-11',
      question: 'Will Silicon Valley bank collapse repeat in 2025?',
      outcomePrices: [0.60, 0.38],
      updatedAt: new Date().toISOString(),
      volume: 890000,
      liquidity: { YES: 600000, NO: 380000 },
    },
    {
      id: 'mock-12',
      question: 'Will SpaceX reach Mars this decade?',
      outcomePrices: [0.35, 0.63],
      updatedAt: new Date().toISOString(),
      volume: 1400000,
      liquidity: { YES: 350000, NO: 630000 },
    },
  ];
  
  return mockMarkets;
}

async function main() {
  console.log('🔄 Fetching Polymarket active markets...');
  let markets;
  
  try {
    markets = await fetchMarkets();
    if (markets.length === 0) throw new Error('No markets returned from API');
  } catch (error) {
    console.warn(`⚠️  API fetch failed: ${error.message}`);
    markets = generateMockData();
  }
  
  console.log(`✅ Got ${markets.length} markets total`);
  
  const opportunities = filterOpportunities(markets, 10);
  console.log(`🎯 Found ${opportunities.length} arbitrage opportunities`);
  
  // Save to JSON for generation
  const data = {
    generatedAt: new Date().toISOString(),
    opportunities: opportunities,
    totalCount: opportunities.length,
    source: markets[0].id.startsWith('mock-') ? 'demo (mock data)' : 'Polymarket API',
  };
  
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log('💾 Data saved to data.json');
  
  // Also generate HTML directly
  const { generateHTML } = require('./generate.js');
  const html = generateHTML(data);
  fs.writeFileSync('index.html', html);
  console.log('✅ index.html generated');
  
  return opportunities;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchMarkets, calculateArbitrage, filterOpportunities, generateMockData };