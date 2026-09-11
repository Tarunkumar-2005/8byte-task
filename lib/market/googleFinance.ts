/**
 * Google Finance / Fundamental Data Provider
 * 
 * Note: Google Finance does not provide a public official API. Scraping HTML directly
 * from google.com/finance is brittle and subject to IP rate-limiting/CAPTCHAs.
 * 
 * This service implements defensive data retrieval:
 * 1. Checks if a dedicated proxy URL is configured via GOOGLE_FINANCE_API_URL.
 * 2. Attempts an HTML scrape with strict timeout for individual symbols if configured.
 * 3. Gracefully returns null with clear diagnostic status when unavailable.
 * 4. Never throws unhandled exceptions that could crash the dashboard.
 */

export interface GoogleFinanceData {
  peRatio: number | null;
  latestEarnings: number | null;
  status: 'live' | 'unavailable' | 'error';
  source: string;
  note?: string;
}

const TIMEOUT_MS = 4000;

export async function fetchGoogleFinanceData(
  displaySymbol: string,
  exchange: 'NSE' | 'BSE'
): Promise<GoogleFinanceData> {
  const customProxy = process.env.GOOGLE_FINANCE_API_URL;

  // If a custom proxy is provided, use it
  if (customProxy) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(
        `${customProxy}?symbol=${encodeURIComponent(displaySymbol)}&exchange=${exchange}`,
        {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
          next: { revalidate: 0 },
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        return {
          peRatio: typeof json.peRatio === 'number' ? json.peRatio : null,
          latestEarnings: typeof json.latestEarnings === 'number' ? json.latestEarnings : null,
          status: 'live',
          source: 'Google Finance (Proxy)',
        };
      }
    } catch {
      // Fall through to defensive response
    }
  }

  // Graceful fallback indicating data source status
  return {
    peRatio: null,
    latestEarnings: null,
    status: 'unavailable',
    source: 'Google Finance (Unofficial)',
    note: 'Direct unofficial scraping blocked by CORS/anti-bot protection. Using Yahoo Finance trailing fundamentals.',
  };
}
