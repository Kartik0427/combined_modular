import React from 'react';

interface CTAProps {
  onAuthClick: () => void;
}

const CTA = ({ onAuthClick }: CTAProps) => {
  return (
    <section className="py-20 bg-gold">
      <div className="container mx-auto px-4 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to Get Legal Help?</h2>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          Join thousands of satisfied clients who found the right legal advisor through Legal Port.
        </p>
        <button
          onClick={onAuthClick}
          className="bg-white text-dark-blue font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Request Free Consultation
        </button>
      </div>
    </section>
  );
};

export default CTA;