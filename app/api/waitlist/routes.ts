import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/waitlist
 *
 * Stores an early-access signup.
 * In production: connect to Loops, Mailchimp, Resend, or your DB.
 * For now: logs the email and returns 200 so the frontend form works immediately.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // ─── Option A: Loops.so ────────────────────────────────────────────────
    // const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
    // if (LOOPS_API_KEY) {
    //   await fetch('https://app.loops.so/api/v1/contacts/create', {
    //     method: 'POST',
    //     headers: { Authorization: `Bearer ${LOOPS_API_KEY}`, 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, source: 'waitlist', userGroup: 'waitlist' }),
    //   });
    // }

    // ─── Option B: Mailchimp ───────────────────────────────────────────────
    // const MC_KEY = process.env.MAILCHIMP_API_KEY;
    // const MC_LIST = process.env.MAILCHIMP_LIST_ID;
    // const MC_DC   = MC_KEY?.split('-')[1];
    // if (MC_KEY && MC_LIST) {
    //   await fetch(`https://${MC_DC}.api.mailchimp.com/3.0/lists/${MC_LIST}/members`, {
    //     method: 'POST',
    //     headers: { Authorization: `Basic ${Buffer.from(`any:${MC_KEY}`).toString('base64')}`, 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email_address: email, status: 'subscribed', tags: ['waitlist'] }),
    //   });
    // }

    // ─── Fallback: just log (replace in production) ────────────────────────
    console.log(`[waitlist] new signup: ${email}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[waitlist] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
