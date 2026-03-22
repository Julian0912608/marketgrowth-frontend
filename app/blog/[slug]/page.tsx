import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Calendar } from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/sections';

// ─── Post data ────────────────────────────────────────────────────────────────

const posts: Record<string, Post> = {
  'best-shopify-analytics-tools-2026': {
    slug: 'best-shopify-analytics-tools-2026',
    title: 'The 7 Best Shopify Analytics Tools in 2026 (Free & Paid)',
    description: "Shopify's built-in analytics only tells half the story. Here are the best tools to see what's really driving your revenue.",
    publishedAt: 'March 13, 2026',
    readingTime: '8 min',
    category: 'Analytics',
    content: [
      { type: 'p', text: "If you're running a serious Shopify store, you already know the problem: the built-in dashboard shows you revenue and orders, but it can't tell you which ad campaign drove your best customers, why a product sells well on Amazon but tanks on Shopify, or where to move your budget next week." },
      { type: 'p', text: "That's why most Shopify store owners end up with five browser tabs open, a messy spreadsheet, and a gut feeling that's wrong half the time." },
      { type: 'h2', text: '1. MarketGrow — Best for multi-channel sellers' },
      { type: 'tag', tag: 'Best for: Ecommerce entrepreneurs selling across Shopify, Amazon, Meta Ads, Google Ads and TikTok Ads' },
      { type: 'p', text: "MarketGrow connects your Shopify store with Amazon, Etsy, Meta Ads, Google Ads, and TikTok Ads — and surfaces the highest-impact actions you can take each day using AI. Instead of building dashboards yourself, MarketGrow tells you things like: \"Your top product converts 3× better on Amazon than Shopify — here's how to shift your ad spend.\"" },
      { type: 'cta' },
      { type: 'h2', text: '2. Shopify Analytics — Best for getting started' },
      { type: 'tag', tag: 'Best for: Single-channel stores and beginners' },
      { type: 'p', text: "Shopify's native analytics covers the basics well: sessions, conversion rate, top products, sales by channel, and cohort analysis on higher-tier plans. If you're just starting out or running a single-channel store, this may be enough." },
      { type: 'p', text: "The gap: it doesn't track ad spend, ROAS, or cross-platform product performance. You can see revenue from a channel, but not what you spent to generate it. Cost: included in all Shopify plans." },
      { type: 'h2', text: '3. Triple Whale — Best for high-spend DTC brands' },
      { type: 'tag', tag: 'Best for: Brands spending £20k+/month on ads' },
      { type: 'p', text: "Triple Whale is the most popular analytics tool among high-spend DTC brands. Its \"Pixel\" tracks first-party purchase data, which helps with attribution in a post-iOS 14 world. The \"Moby\" AI assistant gives conversational answers about campaign performance. Starts at ~£129/month." },
      { type: 'h2', text: '4. Northbeam — Best for complex multi-channel attribution' },
      { type: 'tag', tag: 'Best for: Brands running 5+ ad channels simultaneously' },
      { type: 'p', text: "Northbeam is built for attribution — figuring out which touchpoint in a customer journey actually deserves credit for a purchase. Complex setup and priced for serious budgets (£500-£1,000+/month)." },
      { type: 'h2', text: '5. Daasity — Best for data warehouse control' },
      { type: 'tag', tag: 'Best for: Brands with a data analyst or BI team' },
      { type: 'p', text: "Daasity pulls your Shopify, Amazon, and ad data into a data warehouse (BigQuery or Snowflake) and lets you build custom dashboards. Requires technical resources. From £299/month." },
      { type: 'h2', text: '6. Glew.io — Best for customer segmentation' },
      { type: 'tag', tag: 'Best for: Shopify merchants focused on LTV and repeat purchase' },
      { type: 'p', text: "Glew focuses on customer lifetime value, cohort analysis, and product profitability. Particularly good at identifying your highest-value customer segments. From £79/month." },
      { type: 'h2', text: '7. Google Looker Studio — Best free option' },
      { type: 'tag', tag: 'Best for: Technically comfortable store owners on a tight budget' },
      { type: 'p', text: "Free and highly flexible via third-party Shopify connectors. Requires setup time and connector fees (£20-50/month). No AI or automated insights, but powerful if you're willing to build it yourself." },
      { type: 'h2', text: 'The bottom line' },
      { type: 'p', text: "Most Shopify analytics tools were built for a world where you run one store and one ad channel. In 2026, the average growing ecommerce brand is selling on 2-3 platforms and running ads on at least 2-3 channels simultaneously. If that's you, you need something that connects all of it." },
    ],
  },

  'how-to-calculate-roas-across-platforms': {
    slug: 'how-to-calculate-roas-across-platforms',
    title: 'How to Calculate ROAS Across Multiple Ad Platforms (The Right Way)',
    description: "Platform ROAS numbers are misleading. Here's how to calculate cross-platform ROAS accurately and stop misallocating budget.",
    publishedAt: 'March 13, 2026',
    readingTime: '7 min',
    category: 'Advertising',
    content: [
      { type: 'p', text: "You check Meta Ads Manager: ROAS of 4.2×. Then Google Ads: ROAS of 3.1×. TikTok Ads: ROAS of 2.8×. So Meta is your best channel, right? Not necessarily." },
      { type: 'p', text: "Each platform calculates ROAS differently — and if you're making budget decisions based on those numbers alone, you're almost certainly misallocating spend." },
      { type: 'h2', text: 'Why platform ROAS numbers lie' },
      { type: 'p', text: "Each ad platform has a fundamental incentive: make itself look as good as possible. Meta Ads uses a 7-day click + 1-day view window. Google Ads uses a 30-day click window. The result: when you add up all platform ROAS numbers, total attributed revenue is often 2-3× your actual Shopify revenue. Every platform claims credit for the same customers." },
      { type: 'h2', text: 'The right way: Blended ROAS' },
      { type: 'p', text: "Blended ROAS (also called MER — Marketing Efficiency Ratio) is the simplest and most honest metric:" },
      { type: 'formula', text: 'Blended ROAS = Total Revenue ÷ Total Ad Spend' },
      { type: 'p', text: "Example: Shopify revenue last 30 days: £42,000. Total ad spend (Meta + Google + TikTok): £14,000. Blended ROAS: 3.0×. This number doesn't lie. It doesn't care which platform claims what." },
      { type: 'h2', text: 'ROAS benchmarks by industry (2026)' },
      { type: 'table', headers: ['Industry', 'Average', 'Strong'], rows: [
        ['Fashion & Apparel', '3.2×', '5.0×+'],
        ['Beauty & Skincare', '3.8×', '6.0×+'],
        ['Home & Garden', '2.9×', '4.5×+'],
        ['Health & Supplements', '3.5×', '5.5×+'],
        ['Electronics', '2.4×', '3.8×+'],
        ['Pet Products', '3.4×', '5.2×+'],
      ]},
      { type: 'h2', text: 'The break-even ROAS formula' },
      { type: 'formula', text: 'Break-even ROAS = 1 ÷ Gross Margin %' },
      { type: 'p', text: "If your gross margin is 60%, your break-even ROAS is 1 ÷ 0.60 = 1.67×. Any blended ROAS above that means you're profitable on advertising." },
      { type: 'h2', text: 'Key takeaways' },
      { type: 'p', text: "Platform ROAS numbers are not directly comparable. Blended ROAS is your most honest metric. Calculate your break-even ROAS before setting targets. Use platform ROAS for relative trend tracking only, not as absolute benchmarks." },
    ],
  },

  'amazon-vs-shopify-which-products-sell-best': {
    slug: 'amazon-vs-shopify-which-products-sell-best',
    title: 'Amazon vs Shopify: Which Products Actually Sell Better Where?',
    description: 'Not every product performs equally on Amazon and Shopify. Understanding the difference can double your revenue without increasing ad spend.',
    publishedAt: 'March 13, 2026',
    readingTime: '9 min',
    category: 'Strategy',
    content: [
      { type: 'p', text: "Most ecommerce entrepreneurs treat Amazon and Shopify as interchangeable sales channels — list the same products everywhere and see what sticks. That's a mistake." },
      { type: 'p', text: "Amazon and Shopify attract fundamentally different buyers, at different stages of intent. A product that converts at 8% on Amazon might convert at 2% on Shopify — not because your Shopify store is broken, but because the buyer behaviour is completely different." },
      { type: 'h2', text: 'The core difference: intent' },
      { type: 'p', text: "Amazon buyers are at the bottom of the funnel. They've already decided to buy. Speed and trust signals (reviews, ratings, Prime delivery) matter most. Shopify buyers are typically mid-to-top funnel — they're evaluating your brand, not just your product. Story, aesthetics, and brand trust matter more here." },
      { type: 'h2', text: 'Products that sell better on Amazon' },
      { type: 'p', text: "Replenishable consumables — protein powder, vitamins, coffee. Amazon's Subscribe & Save creates lock-in that's hard to replicate. Commodity products with strong reviews — phone cases, cables, basic home goods. Gift items with high search volume — seasonal products and novelty items perform exceptionally well through Amazon's search-driven discovery." },
      { type: 'h2', text: 'Products that sell better on Shopify' },
      { type: 'p', text: "Brand-driven lifestyle products — premium candles, artisan food, sustainable fashion. These need brand context to justify their price. High-ticket items requiring trust — furniture, jewellery. When a purchase requires consideration, buyers want to research the brand. Community products — niche supplements, hobby products where loyalty and email marketing drive LTV." },
      { type: 'h2', text: 'Product performance by channel (2026 data)' },
      { type: 'table', headers: ['Product type', 'Amazon avg. CR', 'Shopify avg. CR', 'Optimal'], rows: [
        ['Commodity / high-review', '7–10%', '1–2%', 'Amazon'],
        ['Brand-driven lifestyle', '3–5%', '3–6%', 'Shopify'],
        ['Replenishable consumables', '8–12%', '2–4%', 'Amazon'],
        ['High-ticket considered', '2–4%', '4–7%', 'Shopify'],
        ['Seasonal / gift items', '6–9%', '2–3%', 'Amazon'],
      ]},
      { type: 'h2', text: 'How to figure out where each product belongs' },
      { type: 'p', text: "Pull conversion rate data from both platforms for each product. A product converting at 6%+ on Amazon but 1.5% on Shopify relies on Amazon's built-in trust signals to convert — pushing it through Shopify ads will burn money." },
      { type: 'p', text: "Run ROAS analysis by product × channel. Products with high Amazon ROAS and low Shopify ROAS should get more Amazon budget, and vice versa. MarketGrow shows you this comparison automatically, every day." },
    ],
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentBlock =
  | { type: 'p' | 'h2'; text: string }
  | { type: 'tag'; tag: string }
  | { type: 'formula'; text: string }
  | { type: 'cta' }
  | { type: 'table'; headers: string[]; rows: string[][] };

interface Post {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  category: string;
  content: ContentBlock[];
}

// ─── Components ───────────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  Analytics:   'bg-blue-50 text-blue-700',
  Advertising: 'bg-purple-50 text-purple-700',
  Strategy:    'bg-emerald-50 text-emerald-700',
};

function renderBlock(block: ContentBlock, i: number) {
  switch (block.type) {
    case 'h2':
      return <h2 key={i} className="font-display text-2xl font-700 text-slate-900 mt-10 mb-3">{block.text}</h2>;
    case 'p':
      return <p key={i} className="text-slate-600 leading-relaxed mb-4">{block.text}</p>;
    case 'tag':
      return <p key={i} className="text-sm font-semibold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg inline-block mb-4">{block.tag}</p>;
    case 'formula':
      return (
        <div key={i} className="my-6 bg-slate-900 rounded-xl px-6 py-4">
          <code className="text-emerald-400 font-mono text-base font-semibold">{block.text}</code>
        </div>
      );
    case 'table':
      return (
        <div key={i} className="my-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-600 text-white">
                {block.headers.map((h, j) => (
                  <th key={j} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j} className={j % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {row.map((cell, k) => (
                    <td key={k} className={`px-4 py-3 ${k === 0 ? 'font-medium text-slate-800' : 'text-slate-600'}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  case 'cta':
  return (
    <div key={i} className="my-8 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6">
      <p className="text-white font-semibold mb-1">MarketGrow is now live</p>
      <p className="text-brand-100 text-sm mb-4">Connect your stores and get AI-powered actions every day. 14 days free.</p>
      <Link href="/register" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">
        Start free trial <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
    default:
      return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(posts).map(slug => ({ slug }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  if (!post) notFound();

  const otherPosts = Object.values(posts).filter(p => p.slug !== post.slug);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-20 pb-12 bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category]}`}>
              {post.category}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime} read</span>
            <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.publishedAt}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-800 text-slate-900 mb-4 leading-tight">{post.title}</h1>
          <p className="text-slate-500 text-lg leading-relaxed">{post.description}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <article className="prose-slate max-w-none">
            {post.content.map((block, i) => renderBlock(block, i))}
          </article>

          {/* Bottom CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center">
            <h3 className="font-display text-2xl font-700 text-white mb-2">
              Stop piecing data together manually
            </h3>
            <p className="text-brand-100 mb-6">
              MarketGrow connects all your channels and surfaces the actions that move the needle — every morning.
            </p>
            <Link
              href="/#waitlist"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors"
            >
              Get early access — first month free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related posts */}
          {otherPosts.length > 0 && (
            <div className="mt-14">
              <h3 className="font-display text-xl font-700 text-slate-900 mb-6">More articles</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {otherPosts.map(p => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="group block rounded-xl border border-slate-200 p-5 hover:border-brand-300 hover:shadow-sm transition-all">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[p.category]} inline-block mb-3`}>
                      {p.category}
                    </span>
                    <h4 className="font-semibold text-slate-800 text-sm leading-snug group-hover:text-brand-700 transition-colors mb-1">
                      {p.title}
                    </h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3" /> {p.readingTime}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
