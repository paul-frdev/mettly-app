import { Users, Target, Zap } from 'lucide-react';

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

  return (
    <section id="about" className="py-24 bg-[#eef0f2]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#0b3559] tracking-tight">
            About Meetly
          </h2>
          <p className="text-xl text-[#0f0880] max-w-3xl mx-auto font-light">
            We&apos;re on a mission to simplify client management for service professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {values.map((value, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto bg-[#341578]/10 rounded-2xl flex items-center justify-center mb-6">
                <value.icon className="w-8 h-8 text-[#341578]" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-4 text-[#0b3559]">{value.title}</h3>
              <p className="text-[#0f0880] font-light">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
          <div className="prose prose-lg mx-auto">
            <h3 className="font-display text-3xl font-semibold mb-6 text-[#0b3559] text-center">
              Our Story
            </h3>
            <p className="text-[#0f0880] font-light mb-6">
              Meetly was born from a simple observation: service professionals spend too much time managing their clients and not enough time serving them. We saw the need for a platform that could streamline client management while maintaining a personal touch.
            </p>
            <p className="text-[#0f0880] font-light mb-6">
              Our team of experienced professionals and developers came together to create a solution that combines powerful features with an intuitive interface. The result is a platform that helps you focus on what matters most - your clients and your craft.
            </p>
            <p className="text-[#0f0880] font-light">
              Today, Meetly is trusted by thousands of service professionals worldwide, from personal trainers to tutors, helping them manage their clients more efficiently and grow their businesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 