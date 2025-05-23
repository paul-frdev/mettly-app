import { UserPlus, CalendarPlus, Bell } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up in seconds with just your email and start managing your clients'
    },
    {
      icon: CalendarPlus,
      title: 'Add Your Clients',
      description: 'Import your existing clients or add new ones to start scheduling'
    },
    {
      icon: Bell,
      title: 'Set Up Notifications',
      description: 'Connect Telegram and email to automate appointment reminders'
    }
  ];

  return (
    <section className="py-24 bg-[#eef0f2]">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#0b3559] tracking-tight">
            How It Works
          </h2>
          <p className="text-xl text-[#0f0880] max-w-2xl mx-auto font-light">
            Get started in three simple steps and transform your client management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative text-center"
            >
              {/* Step number */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-[#e42627] text-white flex items-center justify-center text-2xl font-display font-bold shadow-lg">
                {index + 1}
              </div>

              {/* Content */}
              <div className="pt-12 p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 mx-auto bg-[#341578]/10 rounded-2xl flex items-center justify-center mb-8">
                  <step.icon className="w-10 h-10 text-[#341578]" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-4 text-[#0b3559]">{step.title}</h3>
                <p className="text-[#0f0880] leading-relaxed font-light">
                  {step.description}
                </p>
              </div>

              {/* Connector line for all except last item */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 left-full w-full h-1 bg-[#341578]/20 transform -translate-y-1/2 -translate-x-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 