import React, { useState, useMemo } from 'react';
import { Star, Phone, MessageCircle, User, CheckCircle, Filter, X, ChevronDown } from 'lucide-react';


interface Lawyer {
  id: number;
  name: string;
  specializations: string[];
  rating: number;
  reviews: number;
  experience: number;
  isOnline: boolean;
  pricing: {
    audio: number;
    video: number;
    chat: number;
  };
  image: string;
  connections: number;
  verified: boolean;
}

interface Filters {
  maxAudioRate: number;
  maxVideoRate: number;
  maxChatRate: number;
  minRating: number;
  minExperience: number;
  onlineOnly: boolean;
  sortBy: 'rating' | 'experience' | 'audioRate' | 'videoRate' | 'chatRate' | 'name';
  sortOrder: 'asc' | 'desc';
}

const LawyerCard: React.FC<{ lawyer: Lawyer }> = ({ lawyer }) => {
  const [selectedCallType, setSelectedCallType] = useState<'audio' | 'video' | 'chat'>('video');

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white relative">
        <div className="flex justify-between items-start mb-4">
          <div className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
            lawyer.isOnline ? 'bg-green-500' : 'bg-gray-500'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              lawyer.isOnline ? 'bg-green-300 animate-pulse' : 'bg-gray-300'
            }`}></div>
            {lawyer.isOnline ? 'Online' : 'Offline'}
          </div>
          {lawyer.verified && (
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              Verified
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-2 shadow-lg">
            {lawyer.image}
          </div>
          <h3 className="font-bold text-lg mb-1">{lawyer.name}</h3>
          <p className="text-indigo-200 text-sm">{lawyer.specializations.join(' • ')}</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-center gap-2 bg-yellow-50 p-2 rounded-lg">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(lawyer.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-yellow-800">
            {lawyer.rating} ({lawyer.reviews.toLocaleString()})
          </span>
        </div>

        <div className="text-center">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg inline-block text-sm font-semibold">
            {lawyer.experience} Years Experience
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['audio', 'video', 'chat'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedCallType(type)}
              className={`p-2 rounded-lg text-center transition-all duration-200 ${
                selectedCallType === type
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div className="font-bold text-sm">₹{lawyer.pricing[type]}/min</div>
              <div className="text-xs uppercase font-medium">{type}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
            <Phone className="w-4 h-4" />
            Call
          </button>
          <button className="border-2 border-gray-200 hover:border-indigo-500 text-gray-700 hover:text-indigo-500 py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors">
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {lawyer.connections} Connections
          </div>
          {lawyer.verified && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              Verified
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
