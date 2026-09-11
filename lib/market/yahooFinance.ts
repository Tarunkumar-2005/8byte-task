import { MarketQuote } from '@/types/portfolio';

const TIMEOUT_MS = process.env.MARKET_DATA_TIMEOUT_MS
  ? parseInt(process.env.MARKET_DATA_TIMEOUT_MS, 10)
  : 6000;

interface ChartApiResponse {
  chart?: {
    result?: Array<{
      meta: {
        symbol: string;
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        regularMarketTime?: number;
        currency?: string;
        instrumentType?: string;
        trailingPE?: number;
        epsTrailingTwelveMonths?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
    error?: any;
  };
}

/**
 * Fetches quote for a single symbol using Yahoo Finance v8 chart API (reliable & open)
 */
async function fetchSingleYahooQuote(symbol: string): Promise<Partial<MarketQuote> | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?interval=1d&range=1d`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ChartApiResponse;
    const meta = data.chart?.result?.[0]?.meta;

    if (!meta || typeof meta.regularMarketPrice !== 'number') {
      return null;
    }

    const cmp = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? cmp;
    const dayChange = Number((cmp - prevClose).toFixed(2));
    const dayChangePercent =
      prevClose > 0 ? Number((((cmp - prevClose) / prevClose) * 100).toFixed(2)) : 0;

    return {
      symbol: meta.symbol || symbol,
      cmp,
      dayChange,
      dayChangePercent,
      peRatio: typeof meta.trailingPE === 'number' ? Number(meta.trailingPE.toFixed(2)) : null,
      latestEarnings: typeof meta.epsTrailingTwelveMonths === 'number' ? Number(meta.epsTrailingTwelveMonths.toFixed(2)) : null,
      currency: meta.currency || 'INR',
      source: 'Yahoo Finance',
      status: 'live',
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Fetches batch market quotes from Yahoo Finance using parallel resilient requests
 */
export async function fetchYahooFinanceQuotes(
  symbols: string[]
): Promise<Map<string, Partial<MarketQuote>>> {
  const quotesMap = new Map<string, Partial<MarketQuote>>();
  if (!symbols || symbols.length === 0) return quotesMap;

  // Execute parallel fetches with Promise.allSettled
  const results = await Promise.allSettled(
    symbols.map((symbol) => fetchSingleYahooQuote(symbol))
  );

  results.forEach((res, index) => {
    const symbol = symbols[index];
    if (res.status === 'fulfilled' && res.value) {
      quotesMap.set(symbol, res.value);
    }
  });

  return quotesMap;
}
