import Link from 'next/link';
import Image from 'next/image';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedText from '@/components/ui/AnimatedText';

export default function Hero() {
  return (
    <section className="pt-32 pb-24 bg-[#f2f2f2]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <AnimatedSection>
              <AnimatedText
                text="Streamline Your Client Management"
                className="text-5xl md:text-6xl font-sans font-bold text-[#0b3559] mb-6 leading-tight"
              />
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <AnimatedText
                text="Meetly helps service professionals manage clients, schedule appointments, and grow their business - all in one place."
                className="text-xl text-[#0f0880] font-sans font-normal mb-8"
              />
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="bg-[#e42627] hover:bg-[#d41f20] text-white px-8 py-4 rounded-lg text-lg font-sans font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#features"
                  className="bg-white hover:bg-gray-50 text-[#0b3559] px-8 py-4 rounded-lg text-lg font-sans font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
                >
                  Learn More
                </Link>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                    />
                  ))}
                </div>
                <p className="text-[#0f0880] font-sans font-normal">
                  Join 1000+ professionals using Meetly
                </p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.5} direction="right">
            <div className="relative h-[600px] w-full">
              <Image
                src="/images/hero-dashboard.png"
                alt="Meetly Dashboard"
                fill
                className="object-contain"
                priority
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
} 