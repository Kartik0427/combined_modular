
import React from 'react';
import { X, Mail, Phone, GraduationCap, PhoneCall, MessageCircle } from 'lucide-react';

interface DetailedLawyer {
  id: string;
  name: string;
  image?: string;
  isOnline: boolean;
  verified: boolean;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  experience: number;
  rating: number;
  reviews: number;
  specializationNames?: string[];
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
  lastActive?: Date;
  createdAt?: Date;
}

interface LawyerModalProps {
  isOpen: boolean;
  selectedLawyer: DetailedLawyer | null;
  modalLoading: boolean;
  onClose: () => void;
  onConsultationRequest: (lawyer: DetailedLawyer, serviceType: 'audio' | 'video' | 'chat') => void;
}

const formatFirebaseDate = (date: Date | undefined): string => {
  if (!date) return 'N/A';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const LawyerModal: React.FC<LawyerModalProps> = ({
  isOpen,
  selectedLawyer,
  modalLoading,
  onClose,
  onConsultationRequest
}) => {
  if (!isOpen || !selectedLawyer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-auto no-scrollbar">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-dark-blue via-slate-800 to-dark-blue text-white p-6 rounded-t-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4">
            {selectedLawyer.image ? (
              <img 
                src={selectedLawyer.image} 
                alt={selectedLawyer.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center text-dark-blue text-3xl font-bold">
                {selectedLawyer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{selectedLawyer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-3 h-3 rounded-full ${selectedLawyer.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                <span className="text-gray-300">{selectedLawyer.isOnline ? 'Online' : 'Offline'}</span>
                {selectedLawyer.verified && (
                  <span className="bg-gold px-2 py-1 rounded text-xs text-dark-blue font-bold">Verified Pro</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {modalLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 mx-auto border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Loading detailed information...</p>
            </div>
          ) : (
            <>
              {/* Contact Information */}
              {(selectedLawyer.email || selectedLawyer.phoneNumber) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLawyer.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="text-gray-500" size={20} />
                        <span>{selectedLawyer.email}</span>
                      </div>
                    )}
                    {selectedLawyer.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <Phone className="text-gray-500" size={20} />
                        <span>{selectedLawyer.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Experience & Rating */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedLawyer.experience}</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{selectedLawyer.rating}</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedLawyer.reviews}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>
              </div>

              {/* Education */}
              {selectedLawyer.education && selectedLawyer.education.length > 0 && selectedLawyer.education[0].degree && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="text-gray-500" size={20} />
                    Education
                  </h3>
                  {selectedLawyer.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-2">
                      <div className="font-semibold text-gray-800">{edu.degree.toUpperCase()}</div>
                      <div className="text-gray-600">{edu.institution}</div>
                      <div className="text-sm text-gray-500">Graduated: {edu.year}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Specializations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedLawyer.specializationNames || selectedLawyer.specializations || ["General Practice"]).map((spec, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {selectedLawyer.bio && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedLawyer.bio}</p>
                </div>
              )}

              {/* Pricing Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Consultation Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${selectedLawyer.availability.audio ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="text-center">
                      <div className="text-xl font-bold">₹{selectedLawyer.pricing.audio}/min</div>
                      <div className="text-sm text-gray-600">Audio Call</div>
                      <div className={`text-xs mt-1 ${selectedLawyer.availability.audio ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedLawyer.availability.audio ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${selectedLawyer.availability.video ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="text-center">
                      <div className="text-xl font-bold">₹{selectedLawyer.pricing.video}/min</div>
                      <div className="text-sm text-gray-600">Video Call</div>
                      <div className={`text-xs mt-1 ${selectedLawyer.availability.video ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedLawyer.availability.video ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border-2 ${selectedLawyer.availability.chat ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="text-center">
                      <div className="text-xl font-bold">₹{selectedLawyer.pricing.chat}/min</div>
                      <div className="text-sm text-gray-600">Chat</div>
                      <div className={`text-xs mt-1 ${selectedLawyer.availability.chat ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedLawyer.availability.chat ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Activity</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {selectedLawyer.createdAt && (
                    <div>Member since: {formatFirebaseDate(selectedLawyer.createdAt)}</div>
                  )}
                  <div>Last active: {formatFirebaseDate(selectedLawyer.lastActive)}</div>
                  <div>Total connections: {selectedLawyer.connections}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    onClose();
                    onConsultationRequest(selectedLawyer, 'audio');
                  }}
                  className="flex-1 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <PhoneCall size={18} />
                  Consult Request
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    onConsultationRequest(selectedLawyer, 'chat');
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle size={18} />
                  Send Message
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerModal;
