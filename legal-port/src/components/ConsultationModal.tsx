
import React from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { UserInfoFormData } from '../services/consultationRequestService';

interface Lawyer {
  id: string;
  name: string;
  image?: string;
  pricing: {
    audio: number;
    video: number;
    chat: number;
  };
}

interface ConsultationModalProps {
  isOpen: boolean;
  lawyer: Lawyer | null;
  serviceType: 'audio' | 'video' | 'chat';
  userInfoForm: UserInfoFormData;
  formErrors: string[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onInputChange: (field: keyof UserInfoFormData, value: string) => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  lawyer,
  serviceType,
  userInfoForm,
  formErrors,
  loading,
  onClose,
  onSubmit,
  onInputChange
}) => {
  if (!isOpen || !lawyer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto overflow-auto no-scrollbar">
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-dark-blue via-slate-800 to-dark-blue text-white p-6 rounded-t-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Request Consultation</h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              {lawyer.image ? (
                <img 
                  src={lawyer.image} 
                  alt={lawyer.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-lg flex items-center justify-center text-dark-blue text-lg font-bold">
                  {lawyer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-semibold">{lawyer.name}</div>
                <div className="text-sm text-gray-300 capitalize">{serviceType} Consultation</div>
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1 rounded-lg inline-block">
              <span className="text-gold font-bold">₹{lawyer.pricing[serviceType]}/min</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {formErrors.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-500" size={20} />
                <span className="font-semibold text-red-700">Please fix the following errors:</span>
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {formErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={userInfoForm.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold transition-colors"
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={userInfoForm.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold transition-colors"
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={userInfoForm.phoneNumber}
                onChange={(e) => onInputChange('phoneNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold transition-colors"
                placeholder="+91 98765 43210"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Describe Your Legal Issue *
              </label>
              <textarea
                value={userInfoForm.message}
                onChange={(e) => onInputChange('message', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold transition-colors resize-none"
                placeholder="Please describe your legal issue in detail..."
                required
                disabled={loading}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Consultation Details:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Service Type: <span className="font-medium capitalize">{serviceType}</span></div>
                <div>Rate: <span className="font-medium text-gold">₹{lawyer.pricing[serviceType]}/min</span></div>
                <div className="text-xs mt-2 text-gray-500">
                  You will be charged based on the actual consultation duration.
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-dark-blue py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-dark-blue border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;
