'use client';

export function LogoBar() {
  const logos = ['Shopify', 'WooCommerce', 'Lightspeed', 'Magento', 'BigCommerce', 'Bol.com'];

  return (
    <section className="py-12 border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
          Connects with your existing store
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {logos.map(logo => (
            <div key={logo} className="text-slate-400 font-display font-600 text-sm sm:text-base hover:text-slate-600 transition-colors">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
