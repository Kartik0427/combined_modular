import React from 'react';
import { ArrowLeft, Phone, Mail, MessageSquare, Send } from 'lucide-react';

const ContactPage = ({ setCurrentPage }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#22223B] via-[#4A4E69] to-[#9A8C98] p-6">
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentPage('dashboard')} 
          className="p-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 rounded-2xl transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-3xl font-bold text-white">Contact Support</h1>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-xl font-semibold mb-6 text-white">Get Help</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">Technical Support</div>
              <div className="text-sm text-white/70">+91 1800-123-4567</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">Email Support</div>
              <div className="text-sm text-white/70">support@legalportal.com</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-medium text-white">Live Chat</div>
              <div className="text-sm text-white/70">Available 24/7</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
        <h3 className="text-xl font-semibold mb-6 text-white">Send Message</h3>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Subject"
            className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C9ADA7] text-white placeholder-white/60"
          />
          <textarea 
            placeholder="Describe your issue..."
            rows={4}
            className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C9ADA7] text-white placeholder-white/60"
          ></textarea>
          <button className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <Send className="w-5 h-5" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ContactPage;