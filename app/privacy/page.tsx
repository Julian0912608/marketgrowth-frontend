// app/privacy/page.tsx

import Link from 'next/link';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/sections';

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">

          <h1 className="font-display text-4xl font-800 text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm mb-12">Last updated: March 2026</p>

          <div className="prose prose-slate max-w-none">

            <h2>1. Who we are</h2>
            <p>
              MarketGrow is an AI-powered analytics platform for ecommerce entrepreneurs, operated by
              MarketGrow B.V., based in the Netherlands. If you have questions about this policy,
              contact us at <a href="mailto:hello@marketgrow.ai">hello@marketgrow.ai</a>.
            </p>

            <h2>2. What data we collect</h2>
            <p>We collect the following data when you use MarketGrow:</p>
            <ul>
              <li><strong>Account data</strong> — name, email address, company name, password (hashed)</li>
              <li><strong>Billing data</strong> — payment information processed by Stripe (we do not store card details)</li>
              <li><strong>Store data</strong> — order data, product data, and revenue data synced from your connected platforms (Shopify, Bol.com, Amazon, Etsy, WooCommerce)</li>
              <li><strong>Usage data</strong> — how you use the platform, which features you use, and technical logs</li>
              <li><strong>Communications</strong> — emails you send to our support team</li>
            </ul>

            <h2>3. How we use your data</h2>
            <p>We use your data to:</p>
            <ul>
              <li>Provide and improve the MarketGrow platform</li>
              <li>Generate AI-powered insights and recommendations based on your store data</li>
              <li>Send you daily briefing emails and platform notifications (you can opt out)</li>
              <li>Process payments and manage your subscription</li>
              <li>Provide customer support</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>We do not sell your data to third parties. We do not use your store data to train AI models that are shared with other customers.</p>

            <h2>4. Data storage and security</h2>
            <p>
              Your data is stored on servers within the European Union (Supabase, hosted on AWS eu-west-1).
              We use encryption at rest and in transit. Each customer account is strictly isolated —
              your data is never accessible to other MarketGrow customers.
            </p>

            <h2>5. Third-party services</h2>
            <p>We use the following third-party services to operate MarketGrow:</p>
            <ul>
              <li><strong>Stripe</strong> — payment processing (<a href="https://stripe.com/privacy" target="_blank">privacy policy</a>)</li>
              <li><strong>Resend</strong> — transactional email (<a href="https://resend.com/privacy" target="_blank">privacy policy</a>)</li>
              <li><strong>Anthropic</strong> — AI model provider for generating insights (<a href="https://www.anthropic.com/privacy" target="_blank">privacy policy</a>)</li>
              <li><strong>Upstash</strong> — Redis cache (<a href="https://upstash.com/privacy" target="_blank">privacy policy</a>)</li>
            </ul>

            <h2>6. Your rights (GDPR)</h2>
            <p>As a user in the EU/EEA, you have the right to:</p>
            <ul>
              <li>Access the data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data ("right to be forgotten")</li>
              <li>Object to or restrict processing of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:hello@marketgrow.ai">hello@marketgrow.ai</a>. We will respond within 30 days.</p>

            <h2>7. Cookies</h2>
            <p>
              We use strictly necessary cookies to keep you logged in and to protect against CSRF attacks.
              We do not use advertising or tracking cookies. See our <Link href="/cookies">Cookie Policy</Link> for details.
            </p>

            <h2>8. Data retention</h2>
            <p>
              We retain your data for as long as your account is active. If you cancel your account,
              we delete your personal data within 90 days, except where we are required to retain it
              for legal or accounting purposes.
            </p>

            <h2>9. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will notify you by email of material changes
              at least 30 days before they take effect.
            </p>

            <h2>10. Contact</h2>
            <p>
              Questions or concerns? Email us at{' '}
              <a href="mailto:hello@marketgrow.ai">hello@marketgrow.ai</a>.
            </p>

          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
