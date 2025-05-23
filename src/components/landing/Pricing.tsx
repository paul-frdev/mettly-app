import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for individuals just getting started',
      features: [
        'Up to 5 clients',
        'Basic scheduling',
        'Email support',
        'Payment tracking',
        'Client management'
      ],
      cta: 'Get Started',
      href: '/auth/register',
      popular: false
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: [
        'Unlimited clients',
        'Advanced scheduling',
        'Priority support',
        'Payment processing',
        'Client portal',
        'Automated reminders',
        'Custom branding'
      ],
      cta: 'Start Free Trial',
      href: '/auth/register',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with specific needs',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced analytics',
        'Team management',
        'API access',
        'SLA guarantee'
      ],
      cta: 'Contact Sales',
      href: '#contact',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-[#eef0f2]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-16">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-sans font-bold text-[#0b3559] mb-6">
              Simple, Transparent Pricing
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-[#0f0880] font-sans font-normal max-w-3xl mx-auto">
              Choose the plan that&apos;s right for you. All plans include a 14-day free trial.
            </p>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <AnimatedSection key={index} delay={0.1 * (index + 1)}>
              <div className={`bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 ${plan.popular ? 'ring-2 ring-[#e42627]' : ''}`}>
                {plan.popular && (
                  <div className="bg-[#e42627] text-white text-sm font-sans font-semibold px-4 py-1 rounded-full inline-block mb-6">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-sans font-semibold text-[#0b3559] mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-sans font-bold text-[#0b3559]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-[#0f0880] font-sans font-normal">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-[#0f0880] font-sans font-normal mb-8">
                  {plan.description}
                </p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-[#0f0880] font-sans font-normal">
                      <svg className="w-5 h-5 text-[#e42627] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 px-6 rounded-lg font-sans font-semibold transition-colors duration-200 ${plan.popular
                      ? 'bg-[#e42627] hover:bg-[#d41f20] text-white'
                      : 'bg-[#0b3559] hover:bg-[#0f0880] text-white'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
} 