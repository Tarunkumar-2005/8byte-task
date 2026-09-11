# Portfolio Dashboard — Interview Preparation & Technical Defense Guide

This document is tailored specifically to help you articulate every architectural decision, data flow, and code structure during your technical interview with **Octa Byte AI Pvt Ltd**.

---

## ⏱️ 1-Minute Elevator Pitch

> *"For this assignment, I built a production-quality, full-stack Dynamic Portfolio Dashboard for Indian equities using Next.js 14 App Router, TypeScript, and Tailwind CSS.*
> 
> *Instead of a static mockup with simulated values, I architected a robust client-server system. On the backend, an aggregation service fetches live market quotes from Yahoo Finance using parallel resilient chart requests, shielded by an in-memory TTL cache and in-flight promise de-duplication to prevent rate limits. All financial mathematics—including cost basis, present value, P&L, portfolio weightings, and sector aggregates—are calculated centrally on the server.*
> 
> *On the frontend, the UI features top overview cards, Recharts visualizations for sector allocation and value comparison, collapsible sector summaries, and a comprehensive 11-column holdings table with multi-column sorting, search, and sector filters. Live market prices automatically refresh every 15 seconds with a visible countdown and tab-visibility pause to optimize bandwidth. The system is defensive, gracefully handling upstream API outages without crashing."*

---

## 🎯 Key Architectural Q&A for the Interview

### 1. Why Next.js (App Router)?
**Answer**: Next.js App Router allows us to build both the user interface and secure server-side API endpoints (`/api/portfolio`) in a unified, type-safe full-stack framework. It enables server-side data aggregation and caching while delivering optimized React client components.

### 2. Why TypeScript in strict mode?
**Answer**: Financial applications require mathematical accuracy and strict type safety. We defined rigorous interfaces for `PortfolioHolding`, `MarketQuote`, `PortfolioPosition`, and `PortfolioApiResponse`. This eliminates runtime undefined errors (especially for missing quotes or null CMPs) and enforces type consistency across client and server layers.

### 3. Why server-side API routes instead of fetching directly in React?
**Answer**: Calling external financial APIs directly from the browser has three major flaws:
1. It exposes third-party endpoints, headers, or keys in client bundles.
2. It suffers from browser CORS restrictions.
3. Every user browser would trigger independent external requests, quickly exceeding rate limits.  
Our `/api/portfolio` acts as a reverse proxy, caching layer, and data aggregator.

### 4. How does the 15-second auto-refresh work?
**Answer**: We built a custom React hook `usePortfolio` using `setInterval`. It manages two synchronized timers: a 15-second data polling cycle and a 1-second UI countdown ticker. We added tab visibility detection (`document.hidden` listener) to pause polling when the user is in another tab, and prevent request overlap using request locking refs (`isFetchingRef`).

### 5. How is caching implemented?
**Answer**: In `lib/cache.ts`, we implemented a server-side in-memory singleton cache with configurable TTL (default 15s). It incorporates **in-flight request deduplication**: if two requests arrive simultaneously during a cache miss, the second request attaches to the existing promise rather than dispatching a duplicate network call.

### 6. How are calculations performed?
**Answer**: All mathematical domain logic is centralized in `lib/calculations.ts` to ensure consistency between the summary cards, table, charts, and sector breakdowns. Formula details:
- $\text{Investment} = \text{Purchase Price} \times \text{Quantity}$
- $\text{Present Value} = \text{CMP} \times \text{Quantity}$ (or `null` if CMP is unavailable)
- $\text{Gain/Loss} = \text{Present Value} - \text{Investment}$
- $\text{Portfolio \%} = (\text{Investment} / \text{Total Investment}) \times 100$

### 7. How are API failures handled?
**Answer**: We built multi-level fault tolerance:
1. Individual stock failures return `null` for CMP with status `unavailable`; other stocks render normally.
2. If the entire upstream provider fails, the server serves the last known cached snapshot with `isStale: true` and a warning banner.
3. If no data exists at all, an accessible error card with a retry button is displayed.

### 8. How are secrets and credentials protected?
**Answer**: Server configuration is managed via `.env.local` and `.env.example`. No keys are prefixed with `NEXT_PUBLIC_`, ensuring they are never bundled into client JavaScript.

### 9. Why can Yahoo / Google Finance data fail?
**Answer**: Neither platform provides an officially supported, free public REST API for high-frequency algorithmic queries. They employ rate limiters, CAPTCHAs, and anti-scraping measures. We addressed this by utilizing Yahoo's open v8 chart endpoint, adding custom headers, and implementing defensive fallback handling for Google Finance fundamentals.

### 10. What would you improve for production?
**Answer**:
1. Use Redis (Upstash) for distributed caching across serverless lambdas.
2. Connect to an official licensed market data websocket feed (e.g. Zerodha Kite, Refinitiv) with Server-Sent Events (SSE) to stream live prices to the client.
3. Add PostgreSQL database storage with Prisma for multi-user portfolios and trade execution logs.

---

## 💡 10 Specific Technical Questions Interviewers Might Ask

1. **Q: How do you prevent division-by-zero errors in your financial calculations?**  
   *A: In `lib/calculations.ts`, every percentage calculation (Portfolio %, Gain/Loss %, Return %) verifies that the denominator (total investment or position investment) is strictly greater than 0 before dividing; otherwise, it safely returns 0 or null.*

2. **Q: Why did you use `v8/finance/chart/{symbol}` instead of `v7/finance/quote` for Yahoo Finance?**  
   *A: Yahoo Finance v7 quote endpoints frequently require crumb authentication and cookies, leading to HTTP 401 errors from serverless/cloud environments. The v8 chart endpoint is fast, reliable, and returns real-time market prices, previous close, and currency without crumb requirements.*

3. **Q: How does your UI format numbers for Indian currency standards?**  
   *A: We built `formatINR` in `lib/utils.ts` utilizing `Intl.NumberFormat('en-IN')`, formatting values into Lakhs and Crores (e.g., ₹12,45,000.00 or ₹12.45 L) instead of standard Western millions/billions.*

4. **Q: What happens if a user sorts by P/E ratio when some stocks have `null` P/E?**  
   *A: In `PortfolioTable.tsx`, our comparator explicitly handles `null` values by mapping them to `Infinity` or `-Infinity` based on sort direction, ensuring nulls always appear at the end of the sorted list.*

5. **Q: How did you implement sector grouping and expand/collapse?**  
   *A: In `SectorSummary.tsx`, we group positions by sector name using a Map in `calculateSectorSummaries`. The UI uses local React state `expandedSectors` (a record of boolean flags) with "Expand All" and "Collapse All" controls.*

6. **Q: How do you prevent memory leaks when the dashboard unmounts?**  
   *A: In `usePortfolio.ts`, the `useEffect` hook returns a cleanup function that calls `clearInterval(ticker)` and sets `isMountedRef.current = false` to prevent state updates after unmounting.*

7. **Q: Why is Recharts used for visualizations, and how is it styled?**  
   *A: Recharts is SVG-based and highly responsive (`ResponsiveContainer`). We styled custom dark-mode tooltips with glassmorphism to match our theme and built a custom interactive legend for sector weights.*

8. **Q: How do you handle manual refresh vs automatic refresh?**  
   *A: Clicking "Refresh Now" sends a request to `/api/portfolio?refresh=true`, which explicitly invokes `marketCache.invalidate(CACHE_KEY)`. Automatic refreshes do not pass the flag, allowing the server to serve cached data if the 15-second TTL has not expired.*

9. **Q: Is the portfolio data hardcoded in the UI?**  
   *A: No. Static holdings are isolated in `data/portfolio.ts` with typed interfaces. It is structured as normalized seed data so that importing from an Excel file or database requires only replacing this data source.*

10. **Q: How is responsiveness guaranteed on small mobile screens?**  
    *A: We utilized responsive Tailwind grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), wrapped the 11-column table in an `overflow-x-auto` container with sticky headers, and adapted chart views so there is no horizontal page overflow.*
