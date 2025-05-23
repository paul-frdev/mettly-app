import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import About from '@/components/landing/About';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import Header from '@/components/layout/Header';
import HowItWorks from '@/components/landing/HowItWorks';
import TargetAudience from '@/components/landing/TargetAudience';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <TargetAudience />
        <Features />
        <About />
        <CTA />
        <Pricing />
      </main>
      <Footer />
    </>
  );
} 