import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import About from '@/components/landing/About';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <About />
        <CTA />
      </main>
      <Footer />
    </>
  );
} 