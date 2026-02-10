const fetch = require('node-fetch');

// Polymarket GraphQL endpoint
const API_URL = 'https://api.polymarket.com/graphql';

// Query para buscar mercados ativos com preços
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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY }),
    });

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('Failed to fetch markets');
    }

    return data.data.markets;
  } catch (error) {
    console.error('Error fetching markets:', error.message);
    throw error;
  }
}

function calculateArbitrage(market) {
  // outcomePrices: [YES, NO] (proporções que somam 1 em mercados eficientes)
  // Se soma < 1, há oportunidade de arbitragem (difference between implied odds and real odds)
  const prices = market.outcomePrices || [];
  const yes = parseFloat(prices[0]) || 0;
  const no = parseFloat(prices[1]) || 0;
  const sum = yes + no;
  
  // Oportunidade: soma < 1 (ex: 0.95, 0.03 = 0.98 → 2% spread)
  const spread = 1 - sum;
  
  // Probabilidade implícita
  const impliedYes = yes;
  const impliedNo = no;
  
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
    .sort((a, b) => b.spread - a.spread); // Maior spread primeiro
  
  return withArbitrage.slice(0, limit);
}

async function main() {
  console.log('🔄 Fetching Polymarket active markets...');
  const markets = await fetchMarkets();
  console.log(`✅ Fetched ${markets.length} markets`);
  
  const opportunities = filterOpportunities(markets, 10);
  console.log(`🎯 Found ${opportunities.length} arbitrage opportunities`);
  
  // Save to JSON for generation
  const fs = require('fs');
  const data = {
    generatedAt: new Date().toISOString(),
    opportunities: opportunities,
    totalCount: opportunities.length,
  };
  
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log('💾 Data saved to data.json');
  
  return opportunities;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchMarkets, calculateArbitrage, filterOpportunities };