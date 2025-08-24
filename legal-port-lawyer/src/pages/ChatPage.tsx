import React from "react";
import { ArrowLeft, User } from "lucide-react";

const ChatPage = ({ setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentPage("dashboard")}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Client Chats</h1>
      </div>
      <div className="space-y-3">
        {[
          {
            name: "Priya Sharma",
            lastMessage: "Thank you for the legal advice...",
            time: "2 min ago",
            unread: 2,
          },
          {
            name: "Rahul Gupta",
            lastMessage: "Can we schedule a call tomorrow?",
            time: "1 hour ago",
            unread: 0,
          },
          {
            name: "Kavita Singh",
            lastMessage: "I have some questions about...",
            time: "3 hours ago",
            unread: 1,
          },
        ].map((chat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-4 shadow-sm hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-medium">{chat.name}</div>
                  <div className="text-sm text-gray-600 truncate max-w-[150px] sm:max-w-xs">
                    {chat.lastMessage}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="text-xs text-gray-500">{chat.time}</div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center mt-1 ml-auto">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ChatPage;
