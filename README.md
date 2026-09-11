# Dynamic Portfolio Dashboard — Full-Stack Equity Intelligence

> **Production-Quality Full-Stack Internship Assignment for Octa Byte AI Pvt Ltd**  
> Built with Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Recharts, and Server-Side Market Data Pipelines.

🌐 **Live Production Deployment**: [https://8byte-task.netlify.app/](https://8byte-task.netlify.app/)  
[![Netlify Status](https://api.netlify.com/api/v1/badges/8byte-task/deploy-status)](https://8byte-task.netlify.app/) 

---

## 📌 Project Overview

The **Dynamic Portfolio Dashboard** is a real-time financial tracking and portfolio management application engineered for Indian equities (NSE/BSE). It delivers live valuation metrics, sector-level asset allocation, gain/loss performance analytics, and dynamic 15-second automatic market data refreshes protected by server-side caching and upstream rate-limit shields.

Unlike static frontends with hardcoded mock figures, this application incorporates a **full-stack client-server architecture**:
1. Static asset data is maintained independently from live market quotes.
2. Market quotes (CMP, day's change) and trailing fundamentals are fetched on the server via resilient financial data pipelines.
3. Financial computations (Investment, Present Value, Absolute/Percentage Gain & Loss, Portfolio Weightings, Sector Aggregations) are computed centrally.
4. Client interfaces update smoothly via custom polling hooks with tab visibility detection.

---

## ✨ Features

- **Real-Time Live Valuation**: Automatic 15-second polling cycle with live visual indicator (`● Live`), last sync time, and a real-time countdown timer.
- **Top Summary KPI Cards**: Instant visibility into Total Investment, Present Value, Net Gain/Loss (with directional `↑`/`↓` indicators), and Active Holdings count.
- **Full Holdings Table (11 Columns)**:
  1. *Particulars* (Company name + ticker badge)
  2. *Purchase Price* (₹ INR formatted)
  3. *Quantity*
  4. *Investment* (Cost basis)
  5. *Portfolio %* (Weight with mini visual bar)
  6. *Exchange* (NSE / BSE badge)
  7. *CMP* (Current Market Price + day's change %)
  8. *Present Value* (Live valuation)
  9. *Gain / Loss* (Value + percentage color pill)
  10. *P/E Ratio*
  11. *Latest Earnings* (EPS in ₹)
- **Multi-Factor Search & Filtering**: Filter assets by search query (stock name or ticker) and sector dropdown.
- **Interactive Multi-Column Sorting**: Sort any column ascending or descending with stable handling for missing values.
- **Sector Intelligence & Grouping**:
  - Collapsible accordion view for each sector.
  - Sector Investment, Present Value, Net P&L, Return %, and Portfolio Weight bar.
  - Drill-down constituent view for each sector.
- **Interactive Recharts Visualizations**:
  - *Sector Weight Allocation*: Interactive Donut Chart with custom tooltip and legend.
  - *Investment vs Present Value*: Comparative Bar Chart across sectors.
- **Quick Analytics Bar**: Highlights Top Gainer, Top Loser, Dominant Sector, and Market Feed Health.
- **Enterprise Rate-Limit Protection**: In-memory server-side TTL caching (15s) with in-flight request de-duplication to protect upstream providers.
- **Graceful Error Handling & Fallbacks**: Partial failure tolerance (missing single stock quote does not crash the app; cached data displays with stale warning).
- **Responsive & Accessible Design**: Optimized for 360px mobile viewports up to 1440px desktop displays with sticky table headers and touch-friendly controls.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | TypeScript (Strict mode) |
| **Styling & UI** | Tailwind CSS, Lucide React Icons |
| **Visualizations** | Recharts (Responsive Pie & Bar Charts) |
| **Backend & APIs** | Next.js Server-Side Route Handlers (`app/api/portfolio/route.ts`) |
| **Caching Layer** | In-Memory TTL Cache with In-Flight Promise De-duplication |
| **Market Data** | Yahoo Finance (v8 chart endpoint) & Google Finance abstraction |

---

## 📐 Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                      │
│  - React Dashboard UI (Tailwind CSS, Lucide Icons)      │
│  - 15s Auto-Refresh Interval + Visibility Listener      │
│  - Recharts Visualizations + Sort/Filter/Search Table   │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP GET /api/portfolio
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Server-Side API Route              │
│                 app/api/portfolio/route.ts              │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Portfolio Aggregation Service              │
│                lib/portfolio/service.ts                 │
│  - Merges static holdings with market quotes            │
│  - Runs centralized math via lib/calculations.ts        │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     In-Memory Cache       │ │      Static Holdings      │
│       lib/cache.ts        │ │     data/portfolio.ts     │
│  - 15s Configurable TTL   │ │  - Sourced & Normalized   │
│  - Request De-duplication │ │  - NSE/BSE Symbols        │
└──────────────┬────────────┘ └───────────────────────────┘
               │ (On Cache Miss)
               ▼
┌─────────────────────────────────────────────────────────┐
│             Market Data Orchestration Layer             │
│               lib/market/marketData.ts                  │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│    Yahoo Finance Service  │ │   Google Finance Provider │
│ lib/market/yahooFinance.ts│ │lib/market/googleFinance.ts│
│ - Parallel v8 Chart Fetch │ │ - Defensive Fallback Layer│
│ - CMP, PrevClose, Day%    │ │ - Graceful Nulls & Status │
└───────────────────────────┘ └───────────────────────────┘
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.17+ or 20+ (v24 supported)
- npm or yarn

### 2. Clone and Install Dependencies
```bash
cd 8byte-Task
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` (optional, sane defaults are configured in code):
```bash
cp .env.example .env.local
```

Available variables:
```env
# In-memory cache duration in seconds (Default: 15)
MARKET_DATA_CACHE_TTL=15

# Upstream request timeout in milliseconds (Default: 6000)
MARKET_DATA_TIMEOUT_MS=6000

# Optional upstream proxy endpoints
YAHOO_FINANCE_API_URL=
GOOGLE_FINANCE_API_URL=
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Execution
```bash
npm run build
npm run start
```

---

## 📊 Market Data & External Provider Limitations

### Yahoo Finance
- **Implementation**: The application uses Yahoo Finance's endpoint (`/v8/finance/chart/{symbol}`) with parallel `Promise.allSettled` queries and custom User-Agent headers.
- **Data Attributes**: Yields reliable real-time / 15-min delayed CMP, previous close, day's change amount, day's change percentage, and currency.
- **Resilience**: If a symbol is unavailable or network throttled, individual quote status is marked `unavailable` without interrupting the remaining portfolio positions.

### Google Finance & Fundamentals
- **Unofficial Scraping Reality**: Google Finance does not provide a public, documented REST API. Direct HTML scraping from edge serverless environments is susceptible to IP-based rate limiting, CAPTCHAs, and structural HTML changes.
- **Defensive Engineering**: In accordance with the assignment guidelines, the Google Finance service (`lib/market/googleFinance.ts`) is designed defensively. If automated scraping or an upstream proxy is unreachable, it cleanly yields `null`, renders `N/A` in the UI, and attaches a diagnostics tag rather than crashing the system or fabricating fake data.

---

## ⚡ Caching & Rate-Limit Strategy

1. **In-Memory TTL Store (`lib/cache.ts`)**:
   - Quotes are cached in-memory with a configurable 15-second TTL.
   - Repeated page refreshes or multiple client requests within the TTL window are served instantly from cache (`cacheHit: true`).
2. **In-Flight Request De-duplication**:
   - If multiple requests hit the server concurrently while a market fetch is in progress, subsequent requests await the identical in-flight Promise rather than dispatching redundant upstream HTTP requests.
3. **Manual Invalidation**:
   - Triggering the client-side "Refresh Now" button sends a `?refresh=true` signal, triggering atomic cache eviction and pulling fresh quotes.

---

## 🔄 15-Second Refresh Strategy

- **Client Hook (`hooks/usePortfolio.ts`)**:
  - Implements a 15-second polling cycle paired with a 1-second UI countdown ticker.
  - Pauses polling when the browser tab is in the background (`document.hidden === true`) to conserve bandwidth and CPU.
  - Automatically re-syncs immediately upon tab refocus.
  - Unmount cleanup prevents background memory leaks.

---

## 🧮 Financial Calculation Reference

All formulas are centralized in [`lib/calculations.ts`](file:///c:/Users/HP/Desktop/8byte-Task/lib/calculations.ts):

| Metric | Formula |
|---|---|
| **Investment** | $\text{Purchase Price} \times \text{Quantity}$ |
| **Portfolio %** | $\left( \frac{\text{Holding Investment}}{\text{Total Portfolio Investment}} \right) \times 100$ |
| **Present Value** | $\text{CMP} \times \text{Quantity}$ |
| **Gain / Loss (₹)** | $\text{Present Value} - \text{Investment}$ |
| **Gain / Loss (%)** | $\left( \frac{\text{Gain / Loss}}{\text{Investment}} \right) \times 100$ |
| **Total Present Value** | $\sum \text{Present Value of all positions}$ |
| **Total Gain / Loss** | $\text{Total Present Value} - \text{Total Investment}$ |
| **Overall Return %** | $\left( \frac{\text{Total Gain / Loss}}{\text{Total Investment}} \right) \times 100$ |

---

## 🚢 Deployment Guide

### Live Demo
🔗 **Production URL**: [https://8byte-task.netlify.app/](https://8byte-task.netlify.app/)

### Deploying to Netlify
1. Connect your repository to [Netlify](https://www.netlify.com).
2. Netlify will auto-detect Next.js via `@netlify/plugin-nextjs`.
3. Set the build configuration:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.next`
4. Set optional environment variables in **Site configuration** > **Environment variables**:
   - `MARKET_DATA_CACHE_TTL=15`
   - `MARKET_DATA_TIMEOUT_MS=6000`
5. Click **Deploy Site**.

### Deploying to Vercel
1. Push your repository to GitHub / GitLab.
2. Go to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Import the repository.
4. Set the Framework Preset to **Next.js**.
5. Add any desired environment variables (e.g. `MARKET_DATA_CACHE_TTL=15`).
6. Click **Deploy**.

---

## 📄 License & Attribution

Submitted for the **Octa Byte AI Pvt Ltd** Full-Stack Internship Assignment.
