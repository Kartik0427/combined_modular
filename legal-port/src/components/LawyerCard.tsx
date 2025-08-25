import React, { useState } from 'react';
import { Star, Phone, MessageCircle, User, CheckCircle, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Lawyer {
  id: string;
  name: string;
  image?: string;
  isOnline: boolean;
  verified: boolean;
  rating: number;
  reviews: number;
  experience: number;
  specializations: string[];
  availability: {
    audio: boolean;
    video: boolean;
    chat: boolean;
  };
  pricing: {
    audio: number;
    video: number;
    chat: number;
  };
  connections: number;
}

interface LawyerCardProps {
  lawyer: Lawyer;
  onViewProfile: (lawyer: Lawyer) => void;
  onConsultationRequest: (lawyer: Lawyer, serviceType: 'audio' | 'video' | 'chat') => void;
  onAuthRequired: () => void;
}

const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onViewProfile, onConsultationRequest, onAuthRequired }) => {
  const [selectedCallType, setSelectedCallType] = useState<'audio' | 'video' | 'chat'>('video');
  const { user } = useAuth();

  const handleConsultationClick = (serviceType: 'audio' | 'video' | 'chat') => {
    if (!user) {
      onAuthRequired();
      return;
    }
    onConsultationRequest(lawyer, serviceType);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 group cursor-pointer">
      <div className="bg-gradient-to-br from-dark-blue via-slate-800 to-dark-blue p-4 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
              lawyer.isOnline ? 'bg-green-500/20 border border-green-400/30' : 'bg-gray-500/20 border border-gray-400/30'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                lawyer.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`}></div>
              {lawyer.isOnline ? 'Available Now' : 'Offline'}
            </div>
            {lawyer.verified && (
              <div className="bg-gold/90 text-dark-blue px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified Pro
              </div>
            )}
          </div>

          <div className="flex flex-col items-center" onClick={() => onViewProfile(lawyer)}>
            <div className="w-16 h-16 rounded-xl mb-2 shadow-lg overflow-hidden">
              {lawyer.image ? (
                <img 
                  src={lawyer.image} 
                  alt={lawyer.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center text-dark-blue font-bold text-lg ${lawyer.image ? 'hidden' : ''}`}>
                {lawyer.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <h3 className="font-bold text-lg mb-1 text-center">{lawyer.name}</h3>
            <div className="flex flex-wrap justify-center gap-1">
              {lawyer.specializations.slice(0, 2).map((spec, index) => (
                <span key={index} className="text-xs bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  {spec}
                </span>
              ))}
              {lawyer.specializations.length > 2 && (
                <span className="text-xs text-gray-300">+{lawyer.specializations.length - 2} more</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-center gap-2 bg-yellow-50 p-2 rounded-lg">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(lawyer.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-yellow-800">{lawyer.rating}</span>
          <span className="text-xs text-yellow-700">({lawyer.reviews.toLocaleString()} reviews)</span>
        </div>

        <div className="text-center">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg inline-flex items-center gap-1 text-sm font-bold">
            <MapPin className="w-3 h-3" />
            {lawyer.experience} Years Experience
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['audio', 'video', 'chat'] as const).map((type) => {
            const isAvailable = lawyer.availability && lawyer.availability[type];
            return (
              <button
                key={type}
                onClick={() => isAvailable && setSelectedCallType(type)}
                disabled={!isAvailable}
                className={`p-2 rounded-lg text-center transition-all duration-200 border cursor-pointer ${
                  !isAvailable
                    ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-50'
                    : selectedCallType === type
                    ? 'bg-gradient-to-r from-gold to-yellow-500 text-dark-blue border-gold'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm">₹{lawyer.pricing[type]}</div>
                <div className="text-xs uppercase opacity-75">{type}</div>
                <div className="text-xs opacity-60">
                  {isAvailable ? 'per min' : 'unavailable'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleConsultationClick(selectedCallType);
            }}
            className="py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all duration-200 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue"
          >
            <Phone className="w-3 h-3" />
            Consult
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleConsultationClick('chat');
            }}
            className="border py-2 px-3 rounded-lg font-bold text-sm flex items-center justify-center gap-1 transition-all duration-200 border-gray-300 hover:border-gold text-gray-700 hover:text-gold"
          >
            <MessageCircle className="w-3 h-3" />
            Message
          </button>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <User className="w-3 h-3" />
            <span>{lawyer.connections} Connections</span>
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

export default LawyerCard;
