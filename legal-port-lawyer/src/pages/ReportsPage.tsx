
import React from "react";
import { ArrowLeft } from "lucide-react";

const ReportsPage = ({ balance, setCurrentPage }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentPage("dashboard")}
          className="p-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 rounded-2xl transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-3xl font-bold text-white">Earnings Reports</h1>
      </div>
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-xl font-semibold mb-4 text-white">Monthly Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
            <div className="text-2xl font-bold text-[#F2E9E4]">
              ₹ {balance.toLocaleString()}
            </div>
            <div className="text-sm text-white/70">This Month</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4">
            <div className="text-2xl font-bold text-[#F2E9E4]">45</div>
            <div className="text-sm text-white/70">Consultations</div>
          </div>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-xl font-semibold mb-4 text-white">Recent Transactions</h3>
        <div className="space-y-3">
          {[
            {
              client: "Rohit Sharma",
              amount: 500,
              time: "2 hours ago",
              type: "Audio Call",
            },
            {
              client: "Priya Singh",
              amount: 800,
              time: "5 hours ago",
              type: "Video Call",
            },
            {
              client: "Amit Gupta",
              amount: 300,
              time: "1 day ago",
              type: "Chat",
            },
          ].map((transaction, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl"
            >
              <div>
                <div className="font-medium text-white">{transaction.client}</div>
                <div className="text-sm text-white/70">
                  {transaction.type} • {transaction.time}
                </div>
              </div>
              <div className="text-[#F2E9E4] font-bold">
                ₹ {transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ReportsPage;
