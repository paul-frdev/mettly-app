import { Calendar, MessageSquare, CreditCard, BarChart, Bell, Users } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedText from '@/components/ui/AnimatedText';

export default function Features() {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automatically schedule and manage appointments with your clients'
    },
    {
      icon: MessageSquare,
      title: 'Client Communication',
      description: 'Keep in touch with your clients through automated messages and reminders'
    },
    {
      icon: CreditCard,
      title: 'Payment Tracking',
      description: 'Track payments and manage invoices all in one place'
    },
    {
      icon: BarChart,
      title: 'Analytics Dashboard',
      description: 'Get insights into your business performance with detailed analytics'
    },
    {
      icon: Bell,
      title: 'Automated Reminders',
      description: 'Send automated reminders to reduce no-shows and late cancellations'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Manage your client base efficiently with detailed profiles and history'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <AnimatedSection>
          <div className="text-center mb-20">
            <AnimatedText
              text="Powerful Features for Your Business"
              className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#0b3559] tracking-tight"
            />
            <AnimatedText
              text="Everything you need to manage your clients and grow your business"
              className="text-xl text-[#0f0880] max-w-2xl mx-auto font-light"
            />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedSection
              key={index}
              delay={0.1 * index}
              direction="up"
            >
              <div className="bg-[#eef0f2] rounded-2xl p-8 relative overflow-hidden group hover:bg-[#0b3559] transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#341578]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-300" />
                <div className="relative">
                  <div className="w-12 h-12 bg-[#341578]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-[#341578] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-4 text-[#0b3559] group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-[#0f0880] font-light group-hover:text-white/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
} 