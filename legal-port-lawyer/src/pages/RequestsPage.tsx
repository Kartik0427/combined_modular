import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { subscribeToConsultationRequests, updateConsultationRequestStatus, getRequestStats } from '../services/consultationService';
import ConsultationRequestCard from '../components/ConsultationRequestCard';
import ConsultationRequestsList from '../components/ConsultationRequestsList';

const RequestsPage = ({ user, setCurrentPage }) => {
  const [requests, setRequests] = useState([]);
  const [requestStats, setRequestStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('RequestsPage - User object:', user);

    // Try different possible user ID fields
    const userId = user?.uid || user?.id || user?.userId;
    console.log('RequestsPage - Extracted userId:', userId);

    if (userId) {
      console.log('Setting up consultation requests subscription for lawyer:', userId);
      setLoading(true);
      setError(null); // Clear previous errors

      const unsubscribe = subscribeToConsultationRequests(userId, (requestsData) => {
        console.log('RequestsPage - Received consultation requests:', requestsData);
        setRequests(requestsData);
        setRequestStats(getRequestStats(requestsData));
        setLoading(false);
      });

      return () => {
        console.log('Cleaning up consultation requests subscription');
        unsubscribe();
      };
    } else {
      console.log('RequestsPage - No valid user ID found, cannot fetch consultation requests');
      setError("Could not load consultation requests. Please ensure you are logged in correctly.");
      setLoading(false);
    }
  }, [user]);

  const handleRequestAction = async (requestId, action) => {
    try {
      await updateConsultationRequestStatus(requestId, action);
      // The subscription will automatically update the state
      console.log(`Request ${requestId} status updated to ${action}`);
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6 flex items-center justify-center">
        <div className="text-white text-xl text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="p-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-3xl font-bold text-white">Consultation Requests</h1>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center">
              <MessageSquare className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No requests yet</h3>
              <p className="text-white/70">New consultation requests will appear here.</p>
            </div>
          ) : (
            <ConsultationRequestsList requests={requests} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;