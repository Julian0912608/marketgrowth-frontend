import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;
    const name  = body?.name  || '';
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
    const firstName = name ? name.split(' ')[0] : 'there';
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    // ── Add contact to Resend Audience ────────────────────────────────────
    if (audienceId) {
      const nameParts = name.trim().split(' ');
      const firstName_ = nameParts[0] || '';
      const lastName_  = nameParts.slice(1).join(' ') || '';
      const audienceRes = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: firstName_,
          last_name: lastName_,
          unsubscribed: false,
        }),
      });
      const audienceText = await audienceRes.text();
      console.log('[waitlist] audience add status:', audienceRes.status, audienceText);
    } else {
      console.log('[waitlist] RESEND_AUDIENCE_ID not set, skipping audience add');
    }

    // ── 1. Notification email to owner ────────────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'hello@marketgrow.ai',
        to: 'hello@marketgrow.ai',
        subject: isWhitepaper
          ? `Whitepaper download: ${name || email} - MarketGrow`
          : `Nieuwe waitlist aanmelding: ${email} - MarketGrow`,
        html: `
          <div style="font-family:sans-serif;padding:24px;max-width:480px">
            <h2 style="color:#1e293b;margin-bottom:16px">
              ${isWhitepaper ? 'Whitepaper download' : 'Nieuwe waitlist aanmelding'}
            </h2>
            <p style="margin:8px 0"><strong>Email:</strong> ${email}</p>
            ${name ? `<p style="margin:8px 0"><strong>Naam:</strong> ${name}</p>` : ''}
            <p style="margin:8px 0"><strong>Bron:</strong> ${isWhitepaper ? 'Whitepaper download' : 'Waitlist signup'}</p>
            <p style="color:#6b7280;font-size:13px;margin-top:16px">${timestamp}</p>
          </div>
        `,
      }),
    });

    // ── 2. Delivery email to user (whitepaper) ────────────────────────────
    if (isWhitepaper) {
      const deliveryRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'hello@marketgrow.ai',
          to: email,
          subject: 'Your MarketGrow report: The Multi-Channel Ecommerce Intelligence Gap',
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#374151">
              <div style="margin-bottom:24px">
                <span style="font-size:22px;font-weight:900;color:#111827">MarketGrow</span>
              </div>
              <h1 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:8px;line-height:1.3">
                Hi ${firstName}, here is your free report
              </h1>
              <p style="color:#6b7280;margin-bottom:28px;font-size:15px">
                Thanks for downloading The Multi-Channel Ecommerce Intelligence Gap.
              </p>
              <div style="background:#EBF0FB;border-radius:12px;padding:24px;margin-bottom:28px">
                <p style="font-weight:700;color:#111827;margin:0 0 8px 0;font-size:15px">
                  The Multi-Channel Ecommerce Intelligence Gap
                </p>
                <p style="color:#6b7280;font-size:13px;margin:0 0 16px 0">
                  18 pages - Research Report 2026 - MarketGrow
                </p>
                <a href="https://marketgrow.ai/marketgrow-intelligence-gap-report-2026.pdf"
                   style="display:inline-block;background:#2E5ED4;color:#ffffff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
                  Download the report
                </a>
              </div>
              <p style="color:#374151;font-size:15px;margin-bottom:8px"><strong>What is inside:</strong></p>
              <ul style="color:#6b7280;font-size:14px;line-height:1.8;padding-left:20px;margin-bottom:28px">
                <li>The 5 intelligence gaps costing multi-channel brands revenue every month</li>
                <li>Why your Meta, Google and TikTok ROAS numbers contradict each other</li>
                <li>2026 ROAS benchmarks across 8 ecommerce categories</li>
                <li>A 90-day framework to close the gaps</li>
              </ul>
              <div style="border-top:1px solid #E5E7EB;padding-top:24px;margin-top:8px">
                <p style="color:#374151;font-size:15px;margin-bottom:4px">
                  <strong>You are also on the MarketGrow waitlist.</strong>
                </p>
                <p style="color:#6b7280;font-size:14px;margin-bottom:16px">
                  MarketGrow connects your Shopify, Amazon and ad accounts and tells you every morning
                  where to move your budget. Early access members get their first month free.
                </p>
                <a href="https://marketgrow.ai"
                   style="display:inline-block;background:#111827;color:#ffffff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none">
                  Learn more at marketgrow.ai
                </a>
              </div>
              <p style="color:#9ca3af;font-size:12px;margin-top:32px">
                2026 MarketGrow - marketgrow.ai - hello@marketgrow.ai
              </p>
            </div>
          `,
        }),
      });
      const deliveryText = await deliveryRes.text();
      console.log('[waitlist] delivery email status:', deliveryRes.status, deliveryText);
    }

    // ── 3. Confirmation email to user (waitlist signup) ───────────────────
    if (!isWhitepaper) {
      const confirmRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'hello@marketgrow.ai',
          to: email,
          subject: "You are on the MarketGrow waitlist",
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#374151">
              <div style="margin-bottom:24px">
                <span style="font-size:22px;font-weight:900;color:#111827">MarketGrow</span>
              </div>
              <h1 style="font-size:22px;font-weight:700;color:#111827;margin-bottom:8px">
                Hi ${firstName}, you are on the list
              </h1>
              <p style="color:#6b7280;font-size:15px;margin-bottom:24px">
                Thanks for joining the MarketGrow waitlist. You will be among the first to know when we launch.
                As an early access member, your first month is completely free.
              </p>
              <div style="background:#EBF0FB;border-radius:12px;padding:24px;margin-bottom:28px">
                <p style="font-weight:700;color:#111827;margin:0 0 8px 0">What is MarketGrow?</p>
                <p style="color:#6b7280;font-size:14px;margin:0;line-height:1.7">
                  One AI dashboard that connects your Shopify, Amazon, Meta Ads, Google Ads and TikTok Ads.
                  Every morning, MarketGrow tells you which products to scale, which campaigns to pause,
                  and where to move your budget.
                </p>
              </div>
              <a href="https://marketgrow.ai/resources"
                 style="display:inline-block;border:1.5px solid #2E5ED4;color:#2E5ED4;font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;text-decoration:none;margin-bottom:28px">
                Free report: The Ecommerce Intelligence Gap
              </a>
              <p style="color:#9ca3af;font-size:12px;margin-top:16px">
                2026 MarketGrow - marketgrow.ai - hello@marketgrow.ai
              </p>
            </div>
          `,
        }),
      });
      console.log('[waitlist] confirmation email status:', confirmRes.status);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[waitlist] unexpected error:', err);
    return NextResponse.json({ error: 'Server error', detail: String(err) }, { status: 500 });
  }
}
