import { Calendar, MessageSquare, CreditCard, BarChart } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedText from '@/components/ui/AnimatedText';

export default function HowItWorks() {
  const steps = [
    {
      icon: Calendar,
      title: 'Create Your Schedule',
      description: 'Set your availability and let clients book appointments that work for you.'
    },
    {
      icon: MessageSquare,
      title: 'Manage Communications',
      description: 'Keep all client communications in one place with our built-in messaging system.'
    },
    {
      icon: CreditCard,
      title: 'Handle Payments',
      description: 'Accept payments securely and manage your finances with our integrated system.'
    },
    {
      icon: BarChart,
      title: 'Track Progress',
      description: 'Monitor client progress and business growth with detailed analytics.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-16">
          <AnimatedSection>
            <AnimatedText
              text="How Meetly Works"
              className="text-4xl md:text-5xl font-sans font-bold text-[#0b3559] mb-6"
            />
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <AnimatedText
              text="A simple, powerful platform to manage your client relationships"
              className="text-xl text-[#0f0880] font-sans font-normal max-w-2xl mx-auto"
            />
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <AnimatedSection
              key={index}
              delay={0.1 * index}
              direction="up"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-[#0b3559]/5 rounded-xl flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-[#0b3559]" />
                </div>
                <h3 className="text-xl font-sans font-semibold mb-4 text-[#0b3559]">
                  {step.title}
                </h3>
                <p className="text-[#0f0880] font-sans font-normal">
                  {step.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
} 