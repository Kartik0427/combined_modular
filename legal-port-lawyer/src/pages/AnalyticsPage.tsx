
import React, { useState } from "react";
import { ArrowLeft, TrendingUp, Users, Clock, DollarSign, MessageSquare, Star, Filter, Calendar } from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Area, AreaChart 
} from 'recharts';

const AnalyticsPage = ({ setCurrentPage }) => {
  const [dateRange, setDateRange] = useState('month');
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');

  // Mock data for analytics
  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000, clients: 25 },
    { month: 'Feb', revenue: 52000, clients: 32 },
    { month: 'Mar', revenue: 48000, clients: 28 },
    { month: 'Apr', revenue: 61000, clients: 35 },
    { month: 'May', revenue: 58000, clients: 31 },
    { month: 'Jun', revenue: 67000, clients: 38 }
  ];

  const paymentStatus = [
    { name: 'Cleared', value: 85, amount: 340000 },
    { name: 'Pending', value: 15, amount: 60000 }
  ];

  const consultationTypes = [
    { name: 'Video Call', value: 45, count: 180 },
    { name: 'Audio Call', value: 35, count: 140 },
    { name: 'Chat', value: 20, count: 80 }
  ];

  const weeklyConsultations = [
    { week: 'Week 1', consultations: 28 },
    { week: 'Week 2', consultations: 35 },
    { week: 'Week 3', consultations: 32 },
    { week: 'Week 4', consultations: 41 }
  ];

  const clientFeedback = [
    { client: 'Rajesh Kumar', rating: 5, feedback: 'Excellent legal advice', case: 'Property Dispute', date: '2024-01-15' },
    { client: 'Priya Singh', rating: 5, feedback: 'Very professional service', case: 'Contract Review', date: '2024-01-14' },
    { client: 'Amit Sharma', rating: 4, feedback: 'Good consultation', case: 'Employment Law', date: '2024-01-13' },
    { client: 'Sneha Patel', rating: 5, feedback: 'Highly recommended', case: 'Family Law', date: '2024-01-12' }
  ];

  const COLORS = {
    primary: '#22223B',
    secondary: '#4A4E69',
    accent: '#9A8C98',
    light: '#C9ADA7',
    lightest: '#F2E9E4',
    green: '#10B981',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    orange: '#F59E0B'
  };

  const pieColors = [COLORS.green, COLORS.orange, COLORS.blue, COLORS.purple];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 rounded-2xl transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                paddingRight: '40px'
              }}
            >
              <option value="week" className="bg-[#22223B] text-white">This Week</option>
              <option value="month" className="bg-[#22223B] text-white">This Month</option>
              <option value="quarter" className="bg-[#22223B] text-white">This Quarter</option>
              <option value="year" className="bg-[#22223B] text-white">This Year</option>
            </select>
            <select 
              value={caseTypeFilter} 
              onChange={(e) => setCaseTypeFilter(e.target.value)}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                paddingRight: '40px'
              }}
            >
              <option value="all" className="bg-[#22223B] text-white">All Cases</option>
              <option value="criminal" className="bg-[#22223B] text-white">Criminal Law</option>
              <option value="civil" className="bg-[#22223B] text-white">Civil Law</option>
              <option value="family" className="bg-[#22223B] text-white">Family Law</option>
              <option value="corporate" className="bg-[#22223B] text-white">Corporate Law</option>
            </select>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">247</div>
                <div className="text-sm text-white/70">Total Clients</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">38</div>
                <div className="text-sm text-white/70">New This Month</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">2.5h</div>
                <div className="text-sm text-white/70">Avg Response</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">₹67k</div>
                <div className="text-sm text-white/70">Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Insights */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.8)" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.8)" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(34, 34, 59, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: 'white'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS.green} 
                  fill={COLORS.green} 
                  fillOpacity={0.4}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Payment Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {paymentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(34, 34, 59, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: 'white'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {paymentStatus.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: pieColors[index] }}></div>
                  <span className="text-white/80 text-sm">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Weekly Consultations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyConsultations} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="week" 
                  stroke="rgba(255,255,255,0.8)" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.8)" 
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(34, 34, 59, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: 'white'
                  }} 
                />
                <Bar 
                  dataKey="consultations" 
                  fill={COLORS.blue} 
                  radius={[8, 8, 0, 0]}
                  stroke="none"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Consultation Preferences</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consultationTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {consultationTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(34, 34, 59, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: 'white'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {consultationTypes.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: pieColors[index] }}></div>
                    <span className="text-white/80 text-sm">{entry.name}</span>
                  </div>
                  <span className="text-white/60 text-sm">{entry.count} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client Feedback */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Client Feedback</h3>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-white font-semibold">4.8 Average Rating</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/80">Client</th>
                  <th className="text-left py-3 px-4 text-white/80">Rating</th>
                  <th className="text-left py-3 px-4 text-white/80">Feedback</th>
                  <th className="text-left py-3 px-4 text-white/80">Case Type</th>
                  <th className="text-left py-3 px-4 text-white/80">Date</th>
                </tr>
              </thead>
              <tbody>
                {clientFeedback.map((feedback, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="py-3 px-4 text-white">{feedback.client}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= feedback.rating ? 'text-yellow-400 fill-current' : 'text-white/30'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white/80 max-w-xs truncate">{feedback.feedback}</td>
                    <td className="py-3 px-4 text-white/70">{feedback.case}</td>
                    <td className="py-3 px-4 text-white/60">{feedback.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
