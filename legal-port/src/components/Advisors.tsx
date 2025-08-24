import React from 'react';
import { ArrowRight } from 'lucide-react';

const Advisors = () => {
  return (
    <section id="advisors" className="py-20 bg-light-gray-bg">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-12 text-gray-800">Our Advisors</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-white h-80 rounded-xl shadow-md border"></div>
          <div className="bg-white h-80 rounded-xl shadow-md border"></div>
          <div className="bg-white h-80 rounded-xl shadow-md border"></div>
          <div className="bg-white h-80 rounded-xl shadow-md border"></div>
        </div>

        <button className="bg-dark-blue text-white font-semibold py-3 px-6 rounded-lg inline-flex items-center gap-2 transition-colors hover:bg-gray-900">
          <span>View All Advisors</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};

export default Advisors;