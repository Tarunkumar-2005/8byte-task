import { PORTFOLIO_HOLDINGS } from '@/data/portfolio';
import {
  PortfolioApiResponse,
  MarketQuote,
} from '@/types/portfolio';
import { marketCache } from '@/lib/cache';
import { fetchMarketQuotes } from '@/lib/market/marketData';
import {
  buildPortfolioPositions,
  calculateSectorSummaries,
  calculatePortfolioSummary,
} from '@/lib/calculations';

const CACHE_KEY = 'portfolio_market_quotes_v1';

/**
 * Service to aggregate portfolio positions with live market data,
 * calculate sector breakdowns, and build full API response.
 */
export async function getPortfolioData(
  forceRefresh: boolean = false
): Promise<PortfolioApiResponse> {
  const holdings = PORTFOLIO_HOLDINGS;

  if (forceRefresh) {
    marketCache.invalidate(CACHE_KEY);
  }

  // 1. Fetch market quotes through cache layer
  const { data: cachedQuotesResult, isCached, ageSeconds } = await marketCache.getOrFetch(
    CACHE_KEY,
    async () => {
      return await fetchMarketQuotes(holdings);
    }
  );

  // Convert plain object back to Map if rehydrated
  let quotesMap: Map<string, MarketQuote>;
  if (cachedQuotesResult.quotesMap instanceof Map) {
    quotesMap = cachedQuotesResult.quotesMap;
  } else {
    quotesMap = new Map(Object.entries(cachedQuotesResult.quotesMap || {}));
  }

  // If serving from cache, mark quotes with cached status
  if (isCached && ageSeconds > 0) {
    const updatedMap = new Map<string, MarketQuote>();
    quotesMap.forEach((q, sym) => {
      updatedMap.set(sym, {
        ...q,
        status: q.status === 'live' ? 'cached' : q.status,
        isStale: ageSeconds > marketCache.getDefaultTTL() * 2,
      });
    });
    quotesMap = updatedMap;
  }

  // 2. Build positions with mathematical calculations
  const positions = buildPortfolioPositions(holdings, quotesMap);

  // 3. Calculate top-level portfolio summary
  const summary = calculatePortfolioSummary(positions);

  // 4. Calculate sector summaries
  const sectors = calculateSectorSummaries(positions, summary.totalInvestment);

  const lastUpdated = new Date().toISOString();

  return {
    success: true,
    data: positions,
    sectors,
    summary,
    meta: {
      lastUpdated,
      cacheHit: isCached,
      cacheAgeSeconds: ageSeconds,
      ttlSeconds: marketCache.getDefaultTTL(),
      sources: {
        cmp: 'Yahoo Finance (Real-time / Delayed)',
        fundamentals: 'Yahoo Finance & Google Finance (Unofficial)',
      },
    },
    errors: cachedQuotesResult.errors.length > 0 ? cachedQuotesResult.errors : undefined,
  };
}
