import { MarketQuote, PortfolioHolding } from '@/types/portfolio';
import { fetchYahooFinanceQuotes } from './yahooFinance';
import { fetchGoogleFinanceData } from './googleFinance';

/**
 * Orchestrates market data aggregation across external providers
 * with error containment and fallback handling.
 */
export async function fetchMarketQuotes(
  holdings: PortfolioHolding[]
): Promise<{ quotesMap: Map<string, MarketQuote>; errors: string[] }> {
  const quotesMap = new Map<string, MarketQuote>();
  const errors: string[] = [];

  const symbols = holdings.map((h) => h.symbol);

  try {
    // 1. Fetch batch quotes from Yahoo Finance
    const yahooQuotes = await fetchYahooFinanceQuotes(symbols);

    // 2. Iterate through holdings and build normalized MarketQuote
    for (const holding of holdings) {
      const yQuote = yahooQuotes.get(holding.symbol);

      if (yQuote && yQuote.cmp !== null && yQuote.cmp !== undefined) {
        // Successful quote from Yahoo Finance
        quotesMap.set(holding.symbol, {
          symbol: holding.symbol,
          cmp: yQuote.cmp,
          dayChange: yQuote.dayChange ?? null,
          dayChangePercent: yQuote.dayChangePercent ?? null,
          peRatio: yQuote.peRatio ?? null,
          latestEarnings: yQuote.latestEarnings ?? null,
          currency: yQuote.currency || 'INR',
          source: 'Yahoo Finance',
          status: 'live',
          lastUpdated: yQuote.lastUpdated || new Date().toISOString(),
        });
      } else {
        // Yahoo quote missing or symbol unrecognized
        // Try Google Finance for any supplementary info
        const gData = await fetchGoogleFinanceData(holding.displaySymbol, holding.exchange);

        quotesMap.set(holding.symbol, {
          symbol: holding.symbol,
          cmp: null,
          dayChange: null,
          dayChangePercent: null,
          peRatio: gData.peRatio,
          latestEarnings: gData.latestEarnings,
          currency: 'INR',
          source: gData.status === 'live' ? gData.source : 'None',
          status: 'unavailable',
          error: 'CMP temporarily unavailable from market provider',
          lastUpdated: new Date().toISOString(),
        });

        errors.push(`Could not retrieve live price for ${holding.particulars} (${holding.symbol})`);
      }
    }
  } catch (err: any) {
    const errorMsg = `Market data service failure: ${err.message || 'Unknown network error'}`;
    console.error(errorMsg);
    errors.push(errorMsg);

    // Populate unavailable state for all holdings
    for (const holding of holdings) {
      quotesMap.set(holding.symbol, {
        symbol: holding.symbol,
        cmp: null,
        dayChange: null,
        dayChangePercent: null,
        peRatio: null,
        latestEarnings: null,
        currency: 'INR',
        source: 'Error',
        status: 'error',
        error: errorMsg,
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  return { quotesMap, errors };
}
