import { Calendar, CreditCard, Bell, BarChart } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Calendar,
      title: 'Convenient Meeting Calendar',
      description: 'Easily schedule and manage all your client appointments in one place'
    },
    {
      icon: CreditCard,
      title: 'Payment & Balance Tracking',
      description: 'Keep track of payments and outstanding balances from your clients'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get timely reminders via Telegram and email automatically'
    },
    {
      icon: BarChart,
      title: 'Client Analytics',
      description: 'Monitor revenue and client engagement over time'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Manage Clients
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Powerful features designed for service professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 