export type Exchange = 'NSE' | 'BSE';

export type MarketDataStatus = 'live' | 'cached' | 'error' | 'unavailable';

/**
 * Raw static portfolio holding item (e.g. from Excel / database)
 */
export interface PortfolioHolding {
  id: string;
  symbol: string;         // e.g. "TCS.NS"
  displaySymbol: string;  // e.g. "TCS"
  particulars: string;    // e.g. "Tata Consultancy Services Ltd"
  purchasePrice: number;
  quantity: number;
  exchange: Exchange;
  sector: string;
}

/**
 * Market data retrieved from external sources (Yahoo Finance, Google Finance, etc.)
 */
export interface MarketQuote {
  symbol: string;
  cmp: number | null;
  dayChange: number | null;
  dayChangePercent: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  currency: string;
  lastUpdated: string;
  source: string;
  status: MarketDataStatus;
  error?: string;
  isStale?: boolean;
}

/**
 * Merged position combining static holding and live calculated financial metrics
 */
export interface PortfolioPosition extends PortfolioHolding {
  investment: number;
  portfolioPercentage: number;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPercentage: number | null;
  dayChange: number | null;
  dayChangePercent: number | null;
  peRatio: number | null;
  latestEarnings: number | null;
  marketDataStatus: MarketDataStatus;
  marketDataSource: string;
  marketDataError?: string;
  isStale?: boolean;
}

/**
 * Grouped financial statistics per sector
 */
export interface SectorSummaryData {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  returnPercentage: number;
  holdingCount: number;
  portfolioPercentage: number;
  positions: PortfolioPosition[];
}

/**
 * Overall portfolio top-level summary
 */
export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  overallReturnPercentage: number;
  totalHoldings: number;
  liveQuotesCount: number;
  cachedQuotesCount: number;
  errorQuotesCount: number;
  topGainer?: {
    symbol: string;
    particulars: string;
    gainPercentage: number;
    gainAmount: number;
  } | null;
  topLoser?: {
    symbol: string;
    particulars: string;
    lossPercentage: number;
    lossAmount: number;
  } | null;
}

/**
 * Full API response envelope
 */
export interface PortfolioApiResponse {
  success: boolean;
  data: PortfolioPosition[];
  sectors: SectorSummaryData[];
  summary: PortfolioSummary;
  meta: {
    lastUpdated: string;
    cacheHit: boolean;
    cacheAgeSeconds: number;
    ttlSeconds: number;
    sources: {
      cmp: string;
      fundamentals: string;
    };
  };
  errors?: string[];
}
