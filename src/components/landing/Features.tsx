import { Calendar, CreditCard, Bell, BarChart } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Easily manage your client appointments with an intuitive calendar interface'
    },
    {
      icon: CreditCard,
      title: 'Payment Tracking',
      description: 'Keep track of all payments and balances in one secure place'
    },
    {
      icon: Bell,
      title: 'Automated Reminders',
      description: 'Send automated notifications via Telegram and email to reduce no-shows'
    },
    {
      icon: BarChart,
      title: 'Client Analytics',
      description: 'Get insights into your business performance and client engagement'
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#0b3559] tracking-tight">
            Everything You Need to Manage Clients
          </h2>
          <p className="text-xl text-[#0f0880] max-w-2xl mx-auto font-light">
            Powerful features designed to help you focus on what matters most — your clients
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-[#eef0f2] rounded-2xl hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-[#341578]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#341578]/20 transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-[#341578]" />
              </div>
              <h3 className="font-display text-2xl font-semibold mb-4 text-[#0b3559]">{feature.title}</h3>
              <p className="text-[#0f0880] leading-relaxed font-light">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 