import { Navbar }    from '@/components/marketing/Navbar';
import { Hero }      from '@/components/marketing/Hero';
import { LogoBar }   from '@/components/marketing/LogoBar';
import { Features }  from '@/components/marketing/Features';
import { Demo, Pricing, Testimonials, FAQ, CTA, Footer } from '@/components/marketing/sections';

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <LogoBar />
      <Features />
      <Demo />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
