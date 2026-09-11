# Technical Architecture & System Design Document

This document details the engineering decisions, data flows, resilience strategies, and design rationales implemented in the **Dynamic Portfolio Dashboard**.

---

### 1. Why this architecture?
The application follows a **layered, server-orchestrated architecture** built on Next.js 14 (App Router). 
- **Separation of Concerns**: Static portfolio holdings (`data/portfolio.ts`), external market adapters (`lib/market/*`), mathematical domain logic (`lib/calculations.ts`), and caching (`lib/cache.ts`) are completely decoupled from UI components.
- **Server-Side Data Aggregation**: Market data is fetched, validated, and computed on the server. The client receives a clean, normalized JSON response, minimizing browser CPU overhead, preventing rate-limiting, and hiding upstream integration details.
- **Maintainability & Extensibility**: Adding a new market data provider (e.g. AlphaVantage, Zerodha Kite API, or a custom Excel parser) only requires implementing a single provider function without modifying UI components.

---

### 2. How is market data fetched?
- **Yahoo Finance Service (`lib/market/yahooFinance.ts`)**: Market quotes are retrieved using Yahoo Finance's `v8/finance/chart/{symbol}` endpoint with parallel asynchronous requests (`Promise.allSettled`). This yields live CMP, previous close, and intraday price changes with low latency and without requiring authentication cookies.
- **Google Finance Service (`lib/market/googleFinance.ts`)**: Acts as a defensive provider abstraction for supplemental fundamentals (P/E ratio and quarterly EPS).
- **Market Orchestration (`lib/market/marketData.ts`)**: Aggregates quotes, attaches timestamps and metadata, and normalizes output into a unified `MarketQuote` interface.

---

### 3. How are Yahoo/Google API limitations handled?
- **Lack of Official Public APIs**: Yahoo and Google do not provide officially documented, free public REST APIs for high-volume automated queries.
- **Defensive Design**:
  1. Requests use realistic browser User-Agent headers and strict 6-second abort controller timeouts (`AbortController`).
  2. The Google Finance provider does not block dashboard loading; when automated scraping is throttled or structural changes occur, it returns `null` with status `unavailable`.
  3. The UI gracefully renders `N/A` with contextual tooltips rather than breaking or presenting simulated numbers.

---

### 4. How is rate limiting handled?
- **Server-Side Shielding**: The browser never makes direct requests to third-party endpoints. All client instances communicate exclusively with `/api/portfolio`.
- **In-Flight Request Deduplication**: If multiple browser clients or concurrent background refresh cycles trigger requests simultaneously, a shared in-flight Promise map (`inflightRequests` in `lib/cache.ts`) coalesces them into a single upstream fetch.
- **Controlled Refresh Cadence**: Polling is restricted to a minimum interval (15 seconds), and polling pauses when browser tabs are inactive.

---

### 5. How does caching work?
- **In-Memory TTL Cache (`lib/cache.ts`)**:
  - Implemented as a singleton in-memory key-value store with millisecond precision.
  - Default TTL is configured via `MARKET_DATA_CACHE_TTL=15` seconds.
  - Every API response reports metadata: `cacheHit: boolean`, `cacheAgeSeconds: number`, and `ttlSeconds: number`.
- **Cache Invalidation**:
  - Clicking the "Refresh Now" button sends a `?refresh=true` query parameter, forcing the cache to purge and re-fetch fresh quotes immediately.

---

### 6. How does the 15-second refresh work?
- **Client Polling Controller (`hooks/usePortfolio.ts`)**:
  - Uses a decoupled dual-ticker mechanism: a 1-second countdown ticker for the UI display (`Next refresh in Xs`) and a 15-second fetch interval.
  - Uses `AbortController` and `isFetchingRef` locks to guarantee that new fetches do not overlap if network latency spikes.
  - **Tab Visibility Awareness**: Subscribes to the HTML5 `visibilitychange` API. When a user switches to another tab, interval timers pause to conserve CPU and data; when the user refocuses the tab, it automatically re-syncs.
  - Clean component unmount handlers clear active intervals to eliminate memory leaks.

---

### 7. How are calculations performed?
Financial math is strictly isolated in [`lib/calculations.ts`](file:///c:/Users/HP/Desktop/8byte-Task/lib/calculations.ts):
- **Holding Investment**: $\text{Purchase Price} \times \text{Quantity}$
- **Portfolio Weight (%)**: $\frac{\text{Holding Investment}}{\text{Total Portfolio Investment}} \times 100$
- **Present Value**: $\text{CMP} \times \text{Quantity}$ (returns `null` if CMP is unavailable)
- **Gain / Loss**: $\text{Present Value} - \text{Investment}$
- **Gain / Loss (%)**: $\frac{\text{Gain / Loss}}{\text{Investment}} \times 100$
- **Sector Aggregations**: Aggregates investment and present value per industrial sector, calculating sector return percentage and sector portfolio weight.
- **Top Gainer & Top Loser**: Programmatically determined from valid percentage returns.

---

### 8. How are API failures handled?
- **Partial Failure Tolerance**: If a single ticker fails upstream, only that specific position's CMP reflects `null` / `unavailable`. The remaining holdings, portfolio totals, and sector breakdowns continue to function normally.
- **Stale Fallback on Total Failure**: If upstream APIs become completely unreachable, the server returns the most recent cached snapshot with an `isStale: true` flag and a warning banner in the UI.
- **UI Error Boundaries & Retry Banners**: Clear actionable feedback with manual "Retry" actions instead of unhandled application crashes.

---

### 9. How is sensitive data protected?
- **Zero Client Credential Leakage**: No external API keys or secrets are exposed via `NEXT_PUBLIC_*` environment variables.
- **Clean Configuration**: Environment variables (`.env.example` / `.env.local`) are restricted to the server environment.
- **Strict TypeScript Validation**: Full typing prevents prototype pollution and unexpected payload structures.

---

### 10. What would you improve for production?
If scaling this application for enterprise multi-tenant production:
1. **Distributed Caching**: Replace in-memory cache with **Redis (Upstash / AWS ElastiCache)** to share cached market data across multiple serverless / containerized instances.
2. **Licensed Institutional Feeds**: Transition from web-based endpoints to official websocket feeds (e.g. NSE/BSE direct feeds, Refinitiv, Bloomberg, or Zerodha Kite Connect API) for millisecond-level streaming.
3. **Database Integration**: Store user portfolios, transaction history, and buy orders in PostgreSQL with Prisma/Drizzle ORM.
4. **Historical Charting & Benchmark Comparison**: Store daily closing prices to calculate XIRR, Sharpe Ratio, drawdown, and compare returns against NIFTY 50 and SENSEX benchmarks.
5. **WebSocket / SSE Streaming**: Replace 15-second polling with Server-Sent Events (SSE) or WebSockets for true push-based price ticker updates.
