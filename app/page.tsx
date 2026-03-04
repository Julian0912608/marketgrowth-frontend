import { Navbar }       from '@/components/marketing/Navbar';
import { Hero }         from '@/components/marketing/Hero';
import { LogoBar }      from '@/components/marketing/LogoBar';
import { Features }     from '@/components/marketing/Features';
import { Demo }         from '@/components/marketing/Demo';
import { Pricing }      from '@/components/marketing/Pricing';
import { Testimonials } from '@/components/marketing/Testimonials';
import { FAQ }          from '@/components/marketing/FAQ';
import { CTA }          from '@/components/marketing/CTA';
import { Footer }       from '@/components/marketing/Footer';

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
