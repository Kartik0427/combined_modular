
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, User, Phone, Video, MessageSquare, X } from "lucide-react";
import { subscribeToUserChats, subscribeToMessages, sendMessage, endChatSession } from "../services/chatService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const ChatPage = ({ setCurrentPage, selectedChatId = null, onChatSelect = null }) => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setCurrentPage("login");
      }
    });

    return () => unsubscribe();
  }, [setCurrentPage]);

  // Subscribe to user's chats
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserChats(user.uid, (chatsData) => {
      setChats(chatsData);
      setLoading(false);
      
      // Auto-select chat if selectedChatId is provided
      if (selectedChatId && chatsData.length > 0) {
        const chatToSelect = chatsData.find(chat => chat.id === selectedChatId);
        if (chatToSelect) {
          setSelectedChat(chatToSelect);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, selectedChatId]);

  // Subscribe to messages of selected chat
  useEffect(() => {
    if (!selectedChat?.id) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(selectedChat.id, (messagesData) => {
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedChat?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?.id || !user?.uid || sendingMessage) return;

    setSendingMessage(true);
    try {
      await sendMessage(selectedChat.id, user.uid, newMessage, 'lawyer');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndChat = async () => {
    if (!selectedChat?.id) return;
    
    if (window.confirm('Are you sure you want to end this chat session?')) {
      try {
        await endChatSession(selectedChat.id);
        setSelectedChat(null);
        alert('Chat session ended successfully.');
      } catch (error) {
        console.error('Error ending chat:', error);
        alert('Failed to end chat session.');
      }
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getOtherParticipant = (chat) => {
    if (!chat.participants || !user?.uid) return 'Unknown User';
    const otherParticipantId = chat.participants.find(id => id !== user.uid);
    return chat.participantNames?.[otherParticipantId] || 'Client';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Chat List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Client Chats</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active chats</p>
              <p className="text-sm">Accept consultation requests to start chatting</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                    selectedChat?.id === chat.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {getOtherParticipant(chat)}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {chat.lastMessageSender === 'system' ? 
                            chat.lastMessage : 
                            `${chat.lastMessageSender === user?.uid ? 'You: ' : ''}${chat.lastMessage}`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-xs text-gray-500">
                        {formatTime(chat.lastMessageTime)}
                      </div>
                      {chat.status === 'active' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-auto"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getOtherParticipant(selectedChat)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedChat.status === 'active' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full" title="Voice Call">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full" title="Video Call">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={handleEndChat}
                    className="p-2 hover:bg-red-100 rounded-full" 
                    title="End Chat"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.uid
                          ? 'bg-purple-600 text-white'
                          : message.type === 'system'
                          ? 'bg-gray-200 text-gray-700 text-center'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.messageText}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === user?.uid
                            ? 'text-purple-200'
                            : message.type === 'system'
                            ? 'text-gray-500'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  disabled={sendingMessage || selectedChat.status !== 'active'}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage || selectedChat.status !== 'active'}
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {selectedChat.status !== 'active' && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  This chat session has ended
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a Chat</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
