import React from 'react';
import { Clock, User, MessageSquare, Phone, Video, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { updateConsultationRequestStatus } from '../services/consultationService';

const ConsultationRequestsList = ({ requests, onStatusUpdate }) => {
  const handleStatusUpdate = async (requestId, newStatus, requestData = null) => {
    try {
      await updateConsultationRequestStatus(requestId, newStatus, requestData);

      // If accepted, navigate to chat after a short delay
      if (newStatus === 'accepted') {
        setTimeout(() => {
          if (window.confirm('Request accepted! Would you like to start chatting with the client now?')) {
            // You can pass the consultation request ID to find the corresponding chat
            window.location.href = '#chat';
          }
        }, 1000);
      }

      // The real-time listener will update the UI automatically
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update request status');
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'audio':
        return <Phone className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'accepted':
        return 'text-green-400';
      case 'completed':
        return 'text-blue-400';
      case 'declined':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 text-center">
        <MessageSquare className="w-12 h-12 mx-auto text-white/50 mb-4" />
        <p className="text-white/70">No consultation requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] rounded-full flex items-center justify-center">
                {getServiceIcon(request.serviceType)}
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {request.clientInfo?.name || 'Anonymous Client'}
                </h3>
                <p className="text-white/60 text-sm">
                  {request.serviceType} consultation • ₹{request.pricing}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>

          <div className="mb-3">
            <p className="text-white/80 text-sm mb-2">
              <strong>Message:</strong> {request.message}
            </p>
            {request.clientInfo && (
              <div className="text-white/60 text-xs space-y-1">
                <p><strong>Email:</strong> {request.clientInfo.email}</p>
                <p><strong>Phone:</strong> {request.clientInfo.phone}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-white/50 mb-3">
            <span>Created: {formatDate(request.createdAt)}</span>
            {request.requestedTime && (
              <span>Requested: {formatDate(request.requestedTime)}</span>
            )}
          </div>

          {request.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate(request.id, 'accepted', request)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={() => handleStatusUpdate(request.id, 'declined')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </div>
          )}

          {request.status === 'accepted' && (
            <button
              onClick={() => handleStatusUpdate(request.id, 'completed')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Completed
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConsultationRequestsList;