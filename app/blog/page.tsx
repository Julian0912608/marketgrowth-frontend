import Link from 'next/link';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/sections';

const posts = [
  {
    slug: 'best-shopify-analytics-tools-2026',
    title: 'The 7 Best Shopify Analytics Tools in 2026 (Free & Paid)',
    description: "Shopify's built-in analytics only tells half the story. Here are the best tools to see what's really driving your revenue — including cross-channel ROAS, product performance, and ad spend.",
    publishedAt: 'March 13, 2026',
    readingTime: '8 min',
    category: 'Analytics',
    featured: true,
  },
  {
    slug: 'how-to-calculate-roas-across-platforms',
    title: 'How to Calculate ROAS Across Multiple Ad Platforms (The Right Way)',
    description: "Comparing ROAS from Meta Ads, Google Ads, and TikTok Ads is misleading if you don't account for attribution differences. Here's how to calculate cross-platform ROAS accurately.",
    publishedAt: 'March 13, 2026',
    readingTime: '7 min',
    category: 'Advertising',
    featured: false,
  },
  {
    slug: 'amazon-vs-shopify-which-products-sell-best',
    title: 'Amazon vs Shopify: Which Products Actually Sell Better Where?',
    description: 'Not every product performs equally on Amazon and Shopify. Understanding the difference can double your revenue without increasing ad spend.',
    publishedAt: 'March 13, 2026',
    readingTime: '9 min',
    category: 'Strategy',
    featured: false,
  },
];

const categoryColors: Record<string, string> = {
  Analytics:   'bg-blue-50 text-blue-700',
  Advertising: 'bg-purple-50 text-purple-700',
  Strategy:    'bg-emerald-50 text-emerald-700',
};

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            MarketGrow Blog
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4">
            Ecommerce intelligence,<br className="hidden sm:block" /> explained
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Practical guides on multi-channel analytics, ROAS optimisation, and AI-driven decision making for ecommerce operators.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">

          {/* Featured post */}
          <Link href={`/blog/${featured.slug}`} className="group block mb-12">
            <div className="rounded-2xl border border-slate-200 bg-white hover:border-brand-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
              {/* Graphic placeholder */}
              <div className="h-52 bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
                <span className="text-white/20 text-8xl font-black select-none">01</span>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[featured.category]}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {featured.readingTime} read
                  </span>
                  <span className="text-xs text-slate-400">{featured.publishedAt}</span>
                </div>
                <h2 className="font-display text-2xl font-700 text-slate-900 mb-3 group-hover:text-brand-700 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-slate-500 leading-relaxed mb-4">{featured.description}</p>
                <span className="inline-flex items-center gap-1.5 text-brand-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
                  Read article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>

          {/* Rest of posts */}
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {rest.map((post, i) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="h-full rounded-2xl border border-slate-200 bg-white hover:border-brand-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <span className="text-white/20 text-6xl font-black select-none">0{i + 2}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category]}`}>
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readingTime}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-700 text-slate-900 mb-2 group-hover:text-brand-700 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{post.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Start free trial CTA */}
<div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-center">
  <h3 className="font-display text-2xl font-700 text-white mb-2">Start growing smarter today</h3>
  <p className="text-brand-100 mb-6">Connect your stores and get AI-powered actions every morning. 14 days free.</p>
  <Link
    href="/register"
    className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors"
  >
    Start free trial <ArrowRight className="w-4 h-4" />
  </Link>
</div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
