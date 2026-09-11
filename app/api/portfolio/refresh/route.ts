import { NextResponse } from 'next/server';
import { getPortfolioData } from '@/lib/portfolio/service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Force cache invalidation and refresh
    const portfolioResponse = await getPortfolioData(true);

    return NextResponse.json(portfolioResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[API /api/portfolio/refresh] Internal server error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to refresh portfolio data',
      },
      { status: 500 }
    );
  }
}
