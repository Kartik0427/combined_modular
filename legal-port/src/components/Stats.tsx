import React from 'react';

const statsData = [
  { value: '500+', label: 'Legal Advisors' },
  { value: '10,000+', label: 'Cases Resolved' },
  { value: '25,000+', label: 'Happy Clients' },
  { value: '95%', label: 'Success Rate' },
];

const Stats = () => {
  return (
    <section className="relative z-10 -mt-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-xl text-center">
              <h3 className="text-4xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-500 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;