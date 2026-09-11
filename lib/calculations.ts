import {
  PortfolioHolding,
  MarketQuote,
  PortfolioPosition,
  SectorSummaryData,
  PortfolioSummary,
} from '@/types/portfolio';

/**
 * Calculates investment for a single holding
 * Investment = Purchase Price × Quantity
 */
export function calculateInvestment(purchasePrice: number, quantity: number): number {
  if (purchasePrice <= 0 || quantity <= 0) return 0;
  return Number((purchasePrice * quantity).toFixed(2));
}

/**
 * Calculates Present Value for a single holding
 * Present Value = CMP × Quantity
 */
export function calculatePresentValue(cmp: number | null, quantity: number): number | null {
  if (cmp === null || cmp < 0 || quantity <= 0) return null;
  return Number((cmp * quantity).toFixed(2));
}

/**
 * Calculates absolute Gain / Loss
 * Gain/Loss = Present Value − Investment
 */
export function calculateGainLoss(
  presentValue: number | null,
  investment: number
): number | null {
  if (presentValue === null) return null;
  return Number((presentValue - investment).toFixed(2));
}

/**
 * Calculates percentage Gain / Loss
 * Gain/Loss % = (Gain/Loss / Investment) × 100
 */
export function calculateGainLossPercentage(
  gainLoss: number | null,
  investment: number
): number | null {
  if (gainLoss === null || investment <= 0) return null;
  return Number(((gainLoss / investment) * 100).toFixed(2));
}

/**
 * Calculates Portfolio % (Weight of holding in total portfolio)
 * Portfolio % = (Investment / Total Portfolio Investment) × 100
 */
export function calculatePortfolioPercentage(
  investment: number,
  totalPortfolioInvestment: number
): number {
  if (totalPortfolioInvestment <= 0 || investment <= 0) return 0;
  return Number(((investment / totalPortfolioInvestment) * 100).toFixed(2));
}

/**
 * Merges raw static holdings with live market quotes and calculates all derived values
 */
export function buildPortfolioPositions(
  holdings: PortfolioHolding[],
  quotesMap: Map<string, MarketQuote>
): PortfolioPosition[] {
  // Step 1: Calculate total investment baseline across all holdings
  const totalInvestment = holdings.reduce(
    (sum, h) => sum + calculateInvestment(h.purchasePrice, h.quantity),
    0
  );

  // Step 2: Build enriched position items
  return holdings.map((holding) => {
    const investment = calculateInvestment(holding.purchasePrice, holding.quantity);
    const portfolioPercentage = calculatePortfolioPercentage(investment, totalInvestment);

    const quote = quotesMap.get(holding.symbol);
    const cmp = quote?.cmp ?? null;
    const presentValue = calculatePresentValue(cmp, holding.quantity);
    const gainLoss = calculateGainLoss(presentValue, investment);
    const gainLossPercentage = calculateGainLossPercentage(gainLoss, investment);

    return {
      ...holding,
      investment,
      portfolioPercentage,
      cmp,
      presentValue,
      gainLoss,
      gainLossPercentage,
      dayChange: quote?.dayChange ?? null,
      dayChangePercent: quote?.dayChangePercent ?? null,
      peRatio: quote?.peRatio ?? null,
      latestEarnings: quote?.latestEarnings ?? null,
      marketDataStatus: quote?.status ?? 'unavailable',
      marketDataSource: quote?.source ?? 'Unknown',
      marketDataError: quote?.error,
      isStale: quote?.isStale ?? false,
    };
  });
}

/**
 * Computes sector-level aggregations and statistics
 */
export function calculateSectorSummaries(
  positions: PortfolioPosition[],
  totalPortfolioInvestment: number
): SectorSummaryData[] {
  const sectorMap = new Map<string, PortfolioPosition[]>();

  for (const pos of positions) {
    const list = sectorMap.get(pos.sector) || [];
    list.push(pos);
    sectorMap.set(pos.sector, list);
  }

  const summaries: SectorSummaryData[] = [];

  sectorMap.forEach((sectorPositions, sectorName) => {
    const totalInvestment = sectorPositions.reduce((acc, p) => acc + p.investment, 0);

    // Sum present values only for valid quotes
    let totalPresentValue = 0;
    let hasAnyValidPv = false;

    for (const p of sectorPositions) {
      if (p.presentValue !== null) {
        totalPresentValue += p.presentValue;
        hasAnyValidPv = true;
      } else {
        // Fallback to purchase price investment if CMP is missing for sector consistency
        totalPresentValue += p.investment;
      }
    }

    const totalGainLoss = totalPresentValue - totalInvestment;
    const returnPercentage =
      totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
    const portfolioPercentage =
      totalPortfolioInvestment > 0
        ? (totalInvestment / totalPortfolioInvestment) * 100
        : 0;

    summaries.push({
      sector: sectorName,
      totalInvestment: Number(totalInvestment.toFixed(2)),
      totalPresentValue: Number(totalPresentValue.toFixed(2)),
      totalGainLoss: Number(totalGainLoss.toFixed(2)),
      returnPercentage: Number(returnPercentage.toFixed(2)),
      holdingCount: sectorPositions.length,
      portfolioPercentage: Number(portfolioPercentage.toFixed(2)),
      positions: sectorPositions,
    });
  });

  // Sort sectors by total investment descending
  return summaries.sort((a, b) => b.totalInvestment - a.totalInvestment);
}

/**
 * Computes top-level portfolio overview metrics
 */
export function calculatePortfolioSummary(
  positions: PortfolioPosition[]
): PortfolioSummary {
  let totalInvestment = 0;
  let totalPresentValue = 0;
  let liveQuotesCount = 0;
  let cachedQuotesCount = 0;
  let errorQuotesCount = 0;

  for (const pos of positions) {
    totalInvestment += pos.investment;

    if (pos.presentValue !== null) {
      totalPresentValue += pos.presentValue;
    } else {
      totalPresentValue += pos.investment;
    }

    if (pos.marketDataStatus === 'live') liveQuotesCount++;
    else if (pos.marketDataStatus === 'cached') cachedQuotesCount++;
    else if (pos.marketDataStatus === 'error' || pos.marketDataStatus === 'unavailable')
      errorQuotesCount++;
  }

  const totalGainLoss = totalPresentValue - totalInvestment;
  const overallReturnPercentage =
    totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  // Identify top gainer and top loser based on gainLossPercentage
  const validGainPositions = positions.filter(
    (p) => p.gainLossPercentage !== null && p.gainLoss !== null
  );

  let topGainer: PortfolioSummary['topGainer'] = null;
  let topLoser: PortfolioSummary['topLoser'] = null;

  if (validGainPositions.length > 0) {
    const sorted = [...validGainPositions].sort(
      (a, b) => (b.gainLossPercentage || 0) - (a.gainLossPercentage || 0)
    );

    const highest = sorted[0];
    if (highest && (highest.gainLossPercentage || 0) > 0) {
      topGainer = {
        symbol: highest.displaySymbol,
        particulars: highest.particulars,
        gainPercentage: highest.gainLossPercentage!,
        gainAmount: highest.gainLoss!,
      };
    }

    const lowest = sorted[sorted.length - 1];
    if (lowest && (lowest.gainLossPercentage || 0) < 0) {
      topLoser = {
        symbol: lowest.displaySymbol,
        particulars: lowest.particulars,
        lossPercentage: lowest.gainLossPercentage!,
        lossAmount: lowest.gainLoss!,
      };
    }
  }

  return {
    totalInvestment: Number(totalInvestment.toFixed(2)),
    totalPresentValue: Number(totalPresentValue.toFixed(2)),
    totalGainLoss: Number(totalGainLoss.toFixed(2)),
    overallReturnPercentage: Number(overallReturnPercentage.toFixed(2)),
    totalHoldings: positions.length,
    liveQuotesCount,
    cachedQuotesCount,
    errorQuotesCount,
    topGainer,
    topLoser,
  };
}
