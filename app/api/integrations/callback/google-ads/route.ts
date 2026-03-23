import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = 'https://marketgrowth-production.up.railway.app';
  const search = req.nextUrl.search;
  return NextResponse.redirect(
    `${backendUrl}/api/integrations/callback/google-ads${search}`
  );
}
