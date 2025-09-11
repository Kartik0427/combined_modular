
import React from 'react';
import { Clock, User, MessageSquare, Phone, Video, Check, X } from 'lucide-react';

const ConsultationRequestCard = ({ request, onUpdateStatus, onStartSession }) => {
  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'audio':
        return <Phone className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'accepted':
        return 'text-green-400 bg-green-400/20';
      case 'declined':
        return 'text-red-400 bg-red-400/20';
      case 'completed':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await onUpdateStatus(request.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update request status. Please try again.');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-[#22223B]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Client Request</h3>
            <p className="text-white/70 text-sm">
              {request.createdAt?.toLocaleDateString()} at {request.createdAt?.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            {getServiceIcon(request.serviceType)}
            <span className="text-white font-medium">
              {request.serviceType.charAt(0).toUpperCase() + request.serviceType.slice(1)} Session
            </span>
          </div>
          <p className="text-white/70 text-sm">${request.pricing} per session</p>
        </div>

        {request.requestedTime && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Requested Time</span>
            </div>
            <p className="text-white/70 text-sm">
              {request.requestedTime.toLocaleDateString()} at {request.requestedTime.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {request.message && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 mb-4">
          <h4 className="text-white font-medium mb-2">Message from Client:</h4>
          <p className="text-white/80">{request.message}</p>
        </div>
      )}

      {request.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleStatusUpdate('accepted')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Accept
          </button>
          <button
            onClick={() => handleStatusUpdate('declined')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Decline
          </button>
        </div>
      )}

      {request.status === 'accepted' && (
        <div className="flex gap-3">
          <button 
            onClick={() => onStartSession && onStartSession(request)}
            className="flex-1 bg-gradient-to-r from-[#9A8C98] to-[#C9ADA7] text-white py-3 rounded-2xl font-medium hover:from-[#C9ADA7] hover:to-[#F2E9E4] hover:text-[#22223B] transition-all"
          >
            Start Session
          </button>
          <button
            onClick={() => handleStatusUpdate('completed')}
            className="px-6 bg-white/10 backdrop-blur-lg border border-white/20 text-white py-3 rounded-2xl font-medium hover:bg-white/20 transition-all"
          >
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsultationRequestCard;
