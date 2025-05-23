import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function CTA() {
  return (
    <section className="py-24 bg-[#0b3559]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-sans font-bold text-white mb-6">
              Ready to Streamline Your Business?
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-white/80 font-sans font-normal max-w-3xl mx-auto mb-12">
              Join thousands of service professionals who are growing their business with Meetly
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-[#e42627] hover:bg-[#d41f20] text-white px-8 py-4 rounded-lg text-lg font-sans font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link
                href="#contact"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-sans font-semibold transition-colors duration-200"
              >
                Contact Sales
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
} 