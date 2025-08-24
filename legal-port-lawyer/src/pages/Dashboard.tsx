import React, { useState, useEffect } from 'react';
import { User, DollarSign, MessageSquare, Mail, Star, LogOut, RefreshCw, Scale, BarChart3, Settings, Inbox } from 'lucide-react';

const Dashboard = ({ user, balance, setCurrentPage, handleLogout }) => {
  const [incomingCall, setIncomingCall] = useState(false);
  const [analyticsView, setAnalyticsView] = useState('week');

  // Mock analytics data
  const analyticsData = {
    week: [12, 19, 15, 27, 22, 18, 25],
    month: [45, 52, 48, 61, 58, 65, 72, 69, 75, 68, 82, 89, 95, 88, 92, 98, 105, 102, 110, 115, 108, 120, 118, 125, 128, 135, 132, 140, 138, 145],
    year: [450, 520, 480, 610, 580, 650, 720, 690, 750, 680, 820, 890]
  };

  const labels = {
    week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    month: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Feb 1', 'Feb 5', 'Feb 10', 'Feb 15', 'Feb 20', 'Feb 25', 'Mar 1', 'Mar 5', 'Mar 10', 'Mar 15', 'Mar 20', 'Mar 25', 'Apr 1', 'Apr 5', 'Apr 10', 'Apr 15', 'Apr 20', 'Apr 25', 'May 1', 'May 5', 'May 10', 'May 15', 'May 20', 'May 25'],
    year: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIncomingCall(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


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
  
          



        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Client Status</span>
            <RefreshCw className={`w-5 h-5 text-[#F2E9E4] ${incomingCall ? 'animate-spin' : ''}`} />
          </div>
          <div className="mt-3">
            {incomingCall ? (
              <div className="text-sm text-[#C9ADA7] animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-[#C9ADA7] rounded-full"></div>
                Incoming consultation request...
              </div>
            ) : (
              <div className="text-sm text-white/60">No pending consultations</div>
            )}
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