
import React from 'react';
import { ArrowLeft, Star } from 'lucide-react';

const ReviewsPage = ({ user, setCurrentPage }) => (
  <div className="min-h-screen w-full bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentPage('dashboard')} 
          className="p-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 rounded-2xl transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-3xl font-bold text-white">Client Reviews</h1>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-[#F2E9E4] mb-2">{user.rating}</div>
          <div className="flex justify-center gap-1 mb-2">
            {[1,2,3,4,5].map(star => (
              <Star key={star} className={`w-6 h-6 ${star <= Math.floor(user.rating) ? 'text-yellow-400 fill-current' : 'text-white/30'}`} />
            ))}
          </div>
          <div className="text-sm text-white/70">Based on 87 reviews</div>
        </div>
      </div>
      
      <div className="space-y-4">
        {[
          { name: 'Rajesh Kumar', rating: 5, review: 'Excellent legal advice. Very professional and knowledgeable.', time: '2 days ago' },
          { name: 'Sneha Patel', rating: 5, review: 'Helped me with my property dispute efficiently. Highly recommended!', time: '1 week ago' },
          { name: 'Vikram Singh', rating: 4, review: 'Good consultation but took a bit longer than expected.', time: '2 weeks ago' }
        ].map((review, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-white">{review.name}</div>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-white/30'}`} />
                  ))}
                </div>
              </div>
              <span className="text-sm text-white/60">{review.time}</span>
            </div>
            <p className="text-white/80">{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ReviewsPage;
