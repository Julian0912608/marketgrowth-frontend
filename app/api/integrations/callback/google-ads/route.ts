import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') 
    ?? 'https://marketgrowth-production.up.railway.app';
  const search = req.nextUrl.search;
  return NextResponse.redirect(
    `${backendUrl}/api/integrations/callback/google-ads${search}`
  );
}
```

**2. Google scope toevoegen** — ga naar Google Cloud Console → APIs & Services → **Data Access** → klik **"Add or remove scopes"** → zoek op `adwords` → selecteer:
```
https://www.googleapis.com/auth/adwords
