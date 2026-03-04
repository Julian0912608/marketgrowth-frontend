import { BarChart3, Zap, ShieldCheck, Globe, Bell, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Sales Dashboard',
    description: 'See every order, revenue metric, and trend the moment it happens. Your store data, live and crystal clear.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: Zap,
    title: 'AI-Powered Insights',
    description: 'Our AI analyzes your data 24/7 and surfaces the insights that actually matter — no data science degree needed.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Globe,
    title: 'Multi-Store Management',
    description: 'Run multiple Shopify or WooCommerce stores? Manage them all from one dashboard with unified reporting.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified when revenue drops, products go out of stock, or an unusual spike needs your attention.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: TrendingUp,
    title: 'Growth Recommendations',
    description: 'AI-generated, actionable steps to increase your conversion rate, average order value, and repeat purchases.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade Security',
    description: 'Your data is encrypted at rest and in transit. Strict tenant isolation means no data ever crosses accounts.',
    color: 'bg-sky-50 text-sky-600',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Everything you need
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-800 text-slate-900 mb-4 text-balance">
            Built for ecommerce entrepreneurs
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Every feature is designed around one goal: helping you make better decisions, faster.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-700 text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
