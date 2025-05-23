import { Check } from 'lucide-react';
import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedText from '@/components/ui/AnimatedText';

export default function Pricing() {
  const features = [
    'Unlimited client management',
    'Automated appointment reminders',
    'Payment tracking',
    'Basic analytics',
    'Email support',
    'Telegram notifications'
  ];

  const premiumFeatures = [
    ...features,
    'Advanced analytics',
    'Custom branding',
    'Priority support',
    'Bulk messaging',
    'Client feedback forms',
    'Integration with calendar apps'
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <AnimatedSection>
          <div className="text-center mb-20">
            <AnimatedText
              text="Simple, Transparent Pricing"
              className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#0b3559] tracking-tight"
            />
            <AnimatedText
              text="Choose the plan that works best for your business"
              className="text-xl text-[#0f0880] max-w-2xl mx-auto font-light"
            />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <AnimatedSection delay={0.2} direction="left">
            <div className="bg-[#eef0f2] rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#341578]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <h3 className="font-display text-2xl font-semibold mb-2 text-[#0b3559]">Free</h3>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold text-[#0b3559]">$0</span>
                  <span className="text-[#0f0880] font-light">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-[#e42627]" />
                      <span className="text-[#0b3559] font-light">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="block w-full bg-white text-[#0b3559] px-6 py-3 rounded-lg text-center font-display font-semibold border-2 border-[#0b3559] hover:bg-[#0b3559] hover:text-white transition-colors duration-200"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </AnimatedSection>

          {/* Premium Plan */}
          <AnimatedSection delay={0.4} direction="right">
            <div className="bg-[#0b3559] rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="absolute -top-4 -right-4 bg-[#e42627] text-white px-4 py-1 rounded-full text-sm font-display font-semibold">
                  Popular
                </div>
                <h3 className="font-display text-2xl font-semibold mb-2 text-white">Premium</h3>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold text-white">$29</span>
                  <span className="text-white/80 font-light">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-[#e42627]" />
                      <span className="text-white font-light">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="block w-full bg-[#e42627] text-white px-6 py-3 rounded-lg text-center font-display font-semibold hover:bg-[#d41f20] transition-colors duration-200"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
} 