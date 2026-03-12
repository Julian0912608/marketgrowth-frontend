import { Navbar }    from '@/components/marketing/Navbar';
import { Hero }      from '@/components/marketing/Hero';
import { ProductPerformance, MarketingInsights, GrowthOpportunities, AdCreative, PlatformBar, Pricing, Testimonials, FAQ, CTA, Footer } from '@/components/marketing/sections';

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <PlatformBar />
      <ProductPerformance />
      <MarketingInsights />
      <GrowthOpportunities />
      <AdCreative />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
