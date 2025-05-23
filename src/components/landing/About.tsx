import { Users, Target, Zap } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedText from '@/components/ui/AnimatedText';

export default function About() {
  const values = [
    {
      icon: Users,
      title: 'Client-First Approach',
      description: 'We believe in putting your clients first, making their experience seamless and professional'
    },
    {
      icon: Target,
      title: 'Focused on Results',
      description: 'Our platform is designed to help you achieve your business goals and grow your client base'
    },
    {
      icon: Zap,
      title: 'Innovation Driven',
      description: 'We continuously improve our platform based on user feedback and industry best practices'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Appointments Scheduled', value: '100K+' },
    { label: 'Client Satisfaction', value: '98%' }
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-sans font-bold text-[#0b3559] mb-6">
                About Meetly
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <p className="text-xl text-[#0f0880] font-sans font-normal mb-8">
                Meetly was born from a simple idea: to make client management easier for service professionals. We understand the challenges of running a service-based business, from scheduling appointments to managing payments and keeping clients happy.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <p className="text-xl text-[#0f0880] font-sans font-normal mb-12">
                Our platform combines powerful features with an intuitive interface, helping you streamline your workflow and focus on what matters most - providing excellent service to your clients.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <AnimatedSection key={index} delay={0.4 + index * 0.1}>
                  <div className="text-center">
                    <div className="text-4xl font-sans font-bold text-[#e42627] mb-2">
                      {stat.value}
                    </div>
                    <div className="text-[#0f0880] font-sans font-normal">
                      {stat.label}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          <div className="relative">
            <AnimatedSection delay={0.5}>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src="/images/about.jpg"
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
            </AnimatedSection>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#e42627]/10 rounded-full blur-3xl" />
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-[#0b3559]/10 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 pt-8">
          {values.map((value, index) => (
            <AnimatedSection
              key={index}
              delay={0.2 * index}
              direction="up"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#341578]/10 rounded-2xl flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-[#341578]" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-4 text-[#0b3559]">{value.title}</h3>
                <p className="text-[#0f0880] font-light">
                  {value.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.6}>
          <div className="bg-white rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="prose prose-lg mx-auto">
              <AnimatedText
                text="Our Story"
                className="font-display text-3xl font-semibold mb-6 text-[#0b3559] text-center"
              />
              <AnimatedText
                text="Meetly was born from a simple observation: service professionals spend too much time managing their clients and not enough time serving them. We saw the need for a platform that could streamline client management while maintaining a personal touch."
                className="text-[#0f0880] font-light mb-6"
              />
              <AnimatedText
                text="Our team of experienced professionals and developers came together to create a solution that combines powerful features with an intuitive interface. The result is a platform that helps you focus on what matters most - your clients and your craft."
                className="text-[#0f0880] font-light mb-6"
              />
              <AnimatedText
                text="Today, Meetly is trusted by thousands of service professionals worldwide, from personal trainers to tutors, helping them manage their clients more efficiently and grow their businesses."
                className="text-[#0f0880] font-light"
              />
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
} 