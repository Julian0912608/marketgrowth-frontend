import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;
    const name = body?.name || '';
    const source = body?.source || 'waitlist';
    const isWhitepaper = source === 'whitepaper';

    console.log('[waitlist] received request, email:', email, 'source:', source);

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.log('[waitlist] invalid email');
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    console.log('[waitlist] API key present:', !!apiKey);

    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const timestamp = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' });

    const subject = isWhitepaper
      ? `Whitepaper download: ${name || email} — MarketGrow.ai`
      : 'Nieuwe waitlist aanmelding — MarketGrow.ai';

    const html = `
      <div style="font-family:sans-serif;padding:24px;max-width:480px">
        <h2 style="color:#1e293b">${isWhitepaper ? '📄 Whitepaper download' : '🎉 Nieuwe waitlist aanmelding'}</h2>
        <p><strong>Email:</strong> ${email}</p>
        ${name ? `<p><strong>Naam:</strong> ${name}</p>` : ''}
        <p><strong>Bron:</strong> ${isWhitepaper ? 'Whitepaper download' : 'Waitlist signup'}</p>
        <p style="color:#6b7280;font-size:14px">${timestamp}</p>
      </div>
    `;

    const emailBody = {
      from: 'onboarding@resend.dev',
      to: 'juligoventures@gmail.com',
      subject,
      html,
    };

    console.log('[waitlist] sending to Resend, subject:', subject);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    const resText = await res.text();
    console.log('[waitlist] Resend status:', res.status, 'body:', resText);

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send email', detail: resText }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[waitlist] unexpected error:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 });
  }
}
