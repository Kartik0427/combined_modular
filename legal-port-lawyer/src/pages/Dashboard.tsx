import React, { useState, useEffect } from 'react';
import { User, DollarSign, MessageSquare, Mail, Star, LogOut, RefreshCw, Scale, BarChart3, Settings, Inbox, Video } from 'lucide-react';
import { subscribeToConsultationRequests, getRequestStats } from '../services/consultationService';
import ConsultationRequestsList from '../components/ConsultationRequestsList';

const Dashboard = ({ user, balance, setCurrentPage, handleLogout, consultationRequests = [], requestStats = {} }) => {
  // Remove local state since data now comes from props
  console.log('Dashboard - Received props:', { user, consultationRequests, requestStats });

  // Removed the useEffect hook for fetching data as it's now handled by the parent component (LawyerPortal)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
      <div className="space-y-6">
        {/* Profile Card with Glassmorphism */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] rounded-full flex items-center justify-center shadow-lg">
                <Scale className="w-8 h-8 text-[#22223B]" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Welcome</p>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-sm text-[#F2E9E4]">{user.specialization}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
              <span className="text-xl font-bold text-[#F2E9E4]">₹ {balance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Consultation Requests Status Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Consultation Requests</span>
            <Inbox className="w-5 h-5 text-[#F2E9E4]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{requestStats.pending || 0}</div>
              <div className="text-xs text-white/70">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{requestStats.accepted || 0}</div>
              <div className="text-xs text-white/70">Accepted</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="text-sm text-white/60">
              Total: {requestStats.total || 0} | Completed: {requestStats.completed || 0}
            </div>
          </div>
        </div>

        {/* Recent Consultation Requests */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Recent Requests</span>
            <button
              onClick={() => setCurrentPage('requests')}
              className="text-[#F2E9E4] hover:text-white text-sm underline"
            >
              View All
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <ConsultationRequestsList
              requests={consultationRequests.slice(0, 3)}
              onStatusUpdate={() => {
                // Refresh will happen automatically via the subscription
                console.log('Request status updated');
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="text-3xl font-bold text-[#F2E9E4]">{user.cases}</div>
            <div className="text-sm text-white/70">Cases Handled</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="text-3xl font-bold text-[#F2E9E4]">{user.rating}</div>
            <div className="text-sm text-white/70">Client Rating</div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-3 gap-6">
          <button onClick={() => setCurrentPage('profile')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9A8C98] to-[#C9ADA7] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">My Profile</span>
          </button>
          <button onClick={() => setCurrentPage('analytics')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Analytics</span>
          </button>
          <button onClick={() => setCurrentPage('reports')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A4E69] to-[#9A8C98] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Reports</span>
          </button>
          <button onClick={() => setCurrentPage('chat')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] text-[#22223B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Chat</span>
          </button>
          <button onClick={() => setCurrentPage('videocall')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Video Calls</span>
          </button>
          <button onClick={() => setCurrentPage('contact')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9A8C98] to-[#C9ADA7] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Contact Us</span>
          </button>
          <button onClick={() => setCurrentPage('reviews')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9ADA7] to-[#F2E9E4] text-[#22223B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Reviews</span>
          </button>
          <button onClick={() => setCurrentPage('settings')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A4E69] to-[#9A8C98] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Settings</span>
          </button>
          <button onClick={() => setCurrentPage('requests')} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Requests</span>
          </button>
          <button onClick={handleLogout} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22223B] to-[#4A4E69] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogOut className="w-6 h-6" />
            </div>
            <span className="text-white font-medium text-sm text-center">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;