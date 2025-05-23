import { Users, Briefcase, GraduationCap, Heart } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import AnimatedText from '@/components/ui/AnimatedText';

export default function TargetAudience() {
  const audiences = [
    {
      icon: Users,
      title: 'Personal Trainers',
      description: 'Manage your fitness clients, track their progress, and schedule training sessions efficiently.'
    },
    {
      icon: Briefcase,
      title: 'Business Coaches',
      description: 'Help entrepreneurs grow their businesses with structured coaching and accountability.'
    },
    {
      icon: GraduationCap,
      title: 'Tutors & Educators',
      description: 'Organize your teaching schedule and track student progress in one place.'
    },
    {
      icon: Heart,
      title: 'Wellness Practitioners',
      description: 'Streamline your practice with easy scheduling and client management tools.'
    }
  ];

  return (
    <section className="py-24 bg-[#eef0f2]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-16">
          <AnimatedSection>
            <AnimatedText
              text="Who Uses Meetly"
              className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#0b3559] tracking-tight"
            />
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <AnimatedText
              text="Meetly is designed for service professionals who want to grow their business"
              className="text-xl text-[#0b3559]/80 max-w-2xl mx-auto font-light"
            />
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <AnimatedSection
              key={index}
              delay={0.1 * index}
              direction="up"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-16 h-16 bg-[#0b3559]/5 rounded-xl flex items-center justify-center mb-6">
                  <audience.icon className="w-8 h-8 text-[#0b3559]" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-4 text-[#0b3559]">
                  {audience.title}
                </h3>
                <p className="text-[#0b3559]/80 font-light">
                  {audience.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
} 