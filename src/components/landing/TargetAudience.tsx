import { Users, Briefcase, GraduationCap, Heart } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function TargetAudience() {
  const audiences = [
    {
      icon: Users,
      title: 'Personal Trainers',
      description: 'Manage your clients, schedule sessions, and track progress all in one place.'
    },
    {
      icon: Briefcase,
      title: 'Business Coaches',
      description: 'Help entrepreneurs grow their businesses with structured coaching and accountability.'
    },
    {
      icon: GraduationCap,
      title: 'Tutors & Educators',
      description: 'Organize your teaching schedule, manage students, and track their progress.'
    },
    {
      icon: Heart,
      title: 'Wellness Practitioners',
      description: 'Streamline your practice with easy scheduling and client management tools.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-16">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-sans font-bold text-[#0b3559] mb-6">
              Perfect For
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="text-xl text-[#0f0880] font-sans font-normal max-w-3xl mx-auto">
              Meetly is designed for service professionals who want to streamline their business
            </p>
          </AnimatedSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <AnimatedSection key={index} delay={0.1 * (index + 1)}>
              <div className="bg-[#eef0f2] rounded-xl p-8 hover:bg-white hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-[#e42627]/10 rounded-lg flex items-center justify-center text-[#e42627] mb-6">
                  <audience.icon className="w-6 h-6 text-[#e42627]" />
                </div>
                <h3 className="text-xl font-sans font-semibold text-[#0b3559] mb-4">
                  {audience.title}
                </h3>
                <p className="text-[#0f0880] font-sans font-normal">
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