import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('[waitlist] RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'juligoventures@gmail.com',
        subject: '🎉 Nieuwe waitlist aanmelding — MarketGrow.ai',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
            <div style="background: #4F46E5; border-radius: 8px; padding: 16px 24px; margin-bottom: 24px;">
              <h1 style="color: white; margin: 0; font-size: 18px;">MarketGrow.ai</h1>
            </div>
            <h2 style="color: #111827; font-size: 20px; margin-bottom: 8px;">Nieuwe aanmelding 🚀</h2>
            <p style="color: #6B7280; font-size: 15px; margin-bottom: 24px;">
              Iemand heeft zich aangemeld voor de early access waitlist.
            </p>
            <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #374151; font-size: 14px;">E-mailadres</p>
              <p style="margin: 4px 0 0; color: #111827; font-size: 16px; font-weight: 600;">${email}</p>
            </div>
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              Verzonden via MarketGrow.ai waitlist · ${new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('[waitlist] Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    console.log(`[waitlist] signup + email sent for: ${email}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[waitlist] unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
