import { Dumbbell, GraduationCap, Scissors, Heart } from 'lucide-react';

export default function TargetAudience() {
  const audiences = [
    {
      icon: Dumbbell,
      title: 'Trainers & Coaches',
      description: 'Personal trainers, life coaches, and fitness instructors'
    },
    {
      icon: GraduationCap,
      title: 'Tutors',
      description: 'Academic tutors, music teachers, and language instructors'
    },
    {
      icon: Scissors,
      title: 'Beauty Professionals',
      description: 'Hairstylists, makeup artists, and nail technicians'
    },
    {
      icon: Heart,
      title: 'Massage Therapists',
      description: 'Massage therapists, physiotherapists, and wellness practitioners'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Who Is This For?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Perfect for service professionals who work directly with clients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                <audience.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{audience.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 