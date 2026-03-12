import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    console.log('[waitlist] received request, email:', email);

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

    const emailBody = {
      from: 'noreply@marketgrow.ai',
      to: 'juligoventures@gmail.com',
      subject: 'Nieuwe waitlist aanmelding - MarketGrow.ai',
      html: '<div style="font-family:sans-serif;padding:24px"><h2>Nieuwe aanmelding</h2><p>E-mail: <strong>' + email + '</strong></p><p>' + timestamp + '</p></div>',
    };

    console.log('[waitlist] sending to Resend, from:', emailBody.from, 'to:', emailBody.to);

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
