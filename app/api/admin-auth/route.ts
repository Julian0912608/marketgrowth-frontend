// app/api/admin-auth/route.ts
// Deze route zet een cookie als het wachtwoord klopt

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

res.cookies.set('admin_token', process.env.ADMIN_SECRET!, {
  httpOnly: false,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 8, // 8 uur
    path:     '/',
  });

  return res;
}
