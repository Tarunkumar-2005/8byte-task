import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioData } from '@/lib/portfolio/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const portfolioResponse = await getPortfolioData(forceRefresh);

    return NextResponse.json(portfolioResponse, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[API /api/portfolio] Internal server error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal Server Error',
        meta: {
          lastUpdated: new Date().toISOString(),
          sources: { cmp: 'None', fundamentals: 'None' },
        },
      },
      { status: 500 }
    );
  }
}
