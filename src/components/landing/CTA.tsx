import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-24 bg-[#0b3559]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Ready to Transform Your Client Management?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto font-light mb-12">
            Join thousands of service professionals who trust Meetly to grow their business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-[#e42627] hover:bg-[#d41f20] text-white px-10 py-5 rounded-lg text-xl font-display font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link
              href="#pricing"
              className="bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-lg text-xl font-display font-semibold transition-colors duration-200"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 