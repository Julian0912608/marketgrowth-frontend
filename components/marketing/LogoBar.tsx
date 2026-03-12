'use client';

const platforms = [
  {
    name: 'Shopify',
    svg: `<svg viewBox="0 0 109 124" width="28" height="32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M94.5 13.8c-.1-.7-.7-1.1-1.2-1.1s-9.7-.7-9.7-.7-6.4-6.4-7.1-7.1c-.7-.7-2-.5-2.5-.3-.1 0-1.4.4-3.5 1.1C68.9 2.3 65.6 0 61.7 0c-9.8 0-14.5 12.3-16 18.5-3.8 1.2-6.5 2-6.8 2.1-2.1.7-2.2.7-2.4 2.7C36.3 24.7 26 106 26 106l68.7 12.9L109 113c0 .1-14.4-98.5-14.5-99.2z" fill="#95BF47"/><path d="M93.3 12.7c-.5 0-9.7-.7-9.7-.7s-6.4-6.4-7.1-7.1c-.3-.3-.6-.4-.9-.4L80 118.9l28.9-6.2-14.5-99.2c-.1-.5-.7-.8-1.1-.8z" fill="#5E8E3E"/><path d="M61.7 39.3l-3.4 10.1s-3-1.6-6.6-1.6c-5.3 0-5.6 3.3-5.6 4.2 0 4.6 12 6.4 12 17.2 0 8.5-5.4 14-12.7 14-8.7 0-13.2-5.4-13.2-5.4l2.3-7.7s4.6 3.9 8.4 3.9c2.5 0 3.6-2 3.6-3.4 0-6-9.8-6.2-9.8-16.2 0-8.3 6-16.4 18.1-16.4 4.7-.1 7 1.3 6.9 1.3z" fill="#FFF"/></svg>`,
  },
  {
    name: 'Amazon',
    svg: `<svg viewBox="0 0 126 38" width="80" height="30" xmlns="http://www.w3.org/2000/svg"><text x="0" y="30" font-family="Arial Black, Arial" font-weight="900" font-size="32" fill="#232F3E">amazon</text><path d="M10 36 Q63 44 116 36" stroke="#FF9900" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M106 29 Q118 34 116 36 Q112 30 108 32z" fill="#FF9900"/></svg>`,
  },
  {
    name: 'Meta Ads',
    svg: `<svg viewBox="0 0 56 56" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mg" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#0064E0"/><stop offset="40%" stop-color="#0064E0"/><stop offset="100%" stop-color="#00C2FF"/></linearGradient></defs><path d="M28 0C12.5 0 0 12.5 0 28s12.5 28 28 28 28-12.5 28-28S43.5 0 28 0z" fill="url(#mg)"/><path d="M13 34c0-5 2-10 5-14 2-3 5-5 8-5 2.5 0 5 1.5 7.5 5.5l6 9.5c1.5 2.5 3 3.5 4.5 3.5 3.5 0 5.5-4 5.5-10 0-4-1.5-8-4.5-10.5" stroke="white" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M43 34c0-5-2-10-5-14-2-3-5-5-8-5-2.5 0-5 1.5-7.5 5.5" stroke="white" stroke-width="4.5" stroke-linecap="round" fill="none"/></svg>`,
  },
  {
    name: 'Google Ads',
    svg: `<svg viewBox="0 0 56 56" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="28" width="14" height="22" rx="7" fill="#EA4335"/><rect x="21" y="6" width="14" height="44" rx="7" fill="#34A853"/><rect x="38" y="18" width="14" height="32" rx="7" fill="#FBBC04"/></svg>`,
  },
  {
    name: 'Bol.com',
    svg: `<svg viewBox="0 0 90 36" width="72" height="29" xmlns="http://www.w3.org/2000/svg"><text x="0" y="28" font-family="Arial Black, Arial" font-weight="900" font-size="30" fill="#0000FF">bol</text><circle cx="76" cy="18" r="12" fill="#0000FF"/><circle cx="76" cy="18" r="6" fill="white"/></svg>`,
  },
  {
    name: 'WooCommerce',
    svg: `<svg viewBox="0 0 56 32" width="56" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="56" height="32" rx="6" fill="#7F54B3"/><text x="5" y="22" font-family="Arial" font-weight="700" font-size="11" fill="white">Woo</text></svg>`,
  },
  {
    name: 'Etsy',
    svg: `<svg viewBox="0 0 56 56" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><circle cx="28" cy="28" r="28" fill="#F56400"/><path d="M18 12h20v6H24v7h12v6H24v8h14v6H18z" fill="white"/></svg>`,
  },
];

export function LogoBar() {
  return (
    <section className="py-14 border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-10">
          One dashboard. Every platform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {platforms.map(platform => (
            <div key={platform.name} className="flex flex-col items-center gap-2 group cursor-default">
              <div
                className="opacity-50 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: platform.svg }}
              />
              <span className="text-xs text-slate-400 group-hover:text-slate-600 font-medium transition-colors">
                {platform.name}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-10">
          All your revenue, ROAS, and product data — unified in seconds.
          <span className="text-slate-500 font-medium"> More integrations coming soon.</span>
        </p>
      </div>
    </section>
  );
}
