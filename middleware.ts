import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    if (token !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
```

**2. `app/admin/login/page.tsx`** — inhoud van `admin.login.page.tsx` hierboven

**3. `app/api/admin-auth/route.ts`** — inhoud van `admin-auth.route.ts` hierboven

**4. Vercel env var toevoegen:**
```
ADMIN_SECRET=kies-een-sterk-wachtwoord
NEXT_PUBLIC_API_URL=https://jouw-railway-url.up.railway.app
NEXT_PUBLIC_ADMIN_SECRET=zelfde-wachtwoord
