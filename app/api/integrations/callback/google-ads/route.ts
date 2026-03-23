import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = 'https://marketgrowth-production.up.railway.app';
  
  // Haal alle query parameters op
  const searchParams = req.nextUrl.searchParams;
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Bouw de backend URL op
  const params = new URLSearchParams();
  if (code)  params.set('code',  code);
  if (state) params.set('state', state);
  if (error) params.set('error', error);

  const targetUrl = `${backendUrl}/api/integrations/callback/google-ads?${params.toString()}`;

  // Direct redirect naar Railway backend
  return NextResponse.redirect(targetUrl, { status: 302 });
}
