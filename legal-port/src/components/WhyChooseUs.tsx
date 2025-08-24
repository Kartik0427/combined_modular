import React from 'react';
import { Scale, Shield, Users, Clock } from 'lucide-react';

const features = [
  {
    icon: <Scale size={32} strokeWidth={1.5} />,
    title: 'Expert Legal Advisors',
    description: 'Connect with experienced lawyers across various practice areas.',
  },
  {
    icon: <Shield size={32} strokeWidth={1.5} />,
    title: 'Secure & Confidential',
    description: 'Your legal matters are handled with utmost confidentiality.',
  },
  {
    icon: <Users size={32} strokeWidth={1.5} />,
    title: 'Wide Network',
    description: 'Access to a comprehensive network of legal professionals.',
  },
  {
    icon: <Clock size={32} strokeWidth={1.5} />,
    title: '24/7 Support',
    description: 'Get legal assistance whenever you need it.',
  },
];

const WhyChooseUs = () => {
  return (
    <section id="features" className="py-20 bg-light-gray-bg">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Why Choose Legal Port?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              // Added border and border-gold classes
              className="bg-dark-blue p-8 rounded-xl shadow-lg border border-gold"
            >
              <div className="flex items-center gap-6">
                <div className="text-gold flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;