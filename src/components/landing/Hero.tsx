import Link from 'next/link';


export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#eef0f2]">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-[#0b3559]/5" />

      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,8,128,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(52,21,120,0.1),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 py-32 text-center relative max-w-[1400px]">
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 text-[#0b3559] tracking-tight">
          Streamline Your Client Management
        </h1>

        <p className="text-xl md:text-2xl text-[#0f0880] mb-12 max-w-3xl mx-auto font-light">
          Schedule meetings, track payments, and automate reminders — all in one powerful platform
        </p>

        <div className="flex justify-center">
          <Link
            href="/auth/register"
            className="bg-[#e42627] hover:bg-[#d41f20] text-white px-10 py-5 rounded-lg text-xl font-display font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Start for Free
          </Link>
        </div>

        <div className="mt-20">
          <div className="flex items-center justify-center space-x-12">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-[#e42627]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[#0b3559] text-lg font-light">14-Day Free Trial</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-[#e42627]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[#0b3559] text-lg font-light">No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-[#e42627]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-[#0b3559] text-lg font-light">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 