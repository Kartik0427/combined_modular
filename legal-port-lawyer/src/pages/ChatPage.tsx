
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, User, Phone, Video, MessageSquare, X, Mail } from "lucide-react";
import { subscribeToMessages, sendMessage, endChatSession } from "../services/chatService";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";

const ChatPage = ({ setCurrentPage, selectedChatId = null, onChatSelect = null }) => {
  const [user, setUser] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [clientNames, setClientNames] = useState({});
  const [clientDetails, setClientDetails] = useState({});
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

  // Function to fetch client details from consultation_requests
  const fetchClientDetails = async (consultationRequestId) => {
    try {
      const consultationDoc = await getDoc(doc(db, 'consultation_requests', consultationRequestId));
      if (consultationDoc.exists()) {
        const consultationData = consultationDoc.data();
        const clientInfo = {
          name: consultationData.clientInfo?.name || consultationData.name || 'Unknown Client',
          email: consultationData.clientInfo?.email || consultationData.email || '',
          phone: consultationData.clientInfo?.phone || consultationData.phone || ''
        };
        return clientInfo;
      }
      return { name: 'Unknown Client', email: '', phone: '' };
    } catch (error) {
      console.error('Error fetching client details:', error);
      return { name: 'Unknown Client', email: '', phone: '' };
    }
  };

  // Function to fetch client name from users collection (fallback)
  const fetchClientName = async (clientId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', clientId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.name || userData.displayName || userData.email || 'Unknown Client';
      }
      return 'Unknown Client';
    } catch (error) {
      console.error('Error fetching client name:', error);
      return 'Unknown Client';
    }
  };

  // Subscribe to chat sessions for the logged-in lawyer
  useEffect(() => {
    if (!user?.uid) return;

    console.log('Setting up chat sessions subscription for lawyer:', user.uid);

    const chatSessionsQuery = query(
      collection(db, 'chat_sessions'),
      where('lawyerId', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(chatSessionsQuery, async (snapshot) => {
      console.log('Chat sessions snapshot received:', snapshot.size, 'documents');
      
      const sessionsData = [];
      const newClientNames = {};
      const newClientDetails = {};

      for (const docSnapshot of snapshot.docs) {
        const sessionData = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          createdAt: docSnapshot.data().createdAt?.toDate(),
          lastActivity: docSnapshot.data().lastActivity?.toDate()
        };

        sessionsData.push(sessionData);

        // Fetch client details from consultation_requests if not already cached
        if (sessionData.consultationRequestId && !clientDetails[sessionData.consultationRequestId]) {
          try {
            const clientInfo = await fetchClientDetails(sessionData.consultationRequestId);
            newClientDetails[sessionData.consultationRequestId] = clientInfo;
            newClientNames[sessionData.clientId] = clientInfo.name;
          } catch (error) {
            console.error('Error fetching client details for:', sessionData.consultationRequestId, error);
            newClientDetails[sessionData.consultationRequestId] = { name: 'Unknown Client', email: '', phone: '' };
            newClientNames[sessionData.clientId] = 'Unknown Client';
          }
        }

        // Fallback to users collection if consultation request doesn't have client info
        if (sessionData.clientId && !clientNames[sessionData.clientId] && !newClientNames[sessionData.clientId]) {
          try {
            const clientName = await fetchClientName(sessionData.clientId);
            newClientNames[sessionData.clientId] = clientName;
          } catch (error) {
            console.error('Error fetching client name for:', sessionData.clientId, error);
            newClientNames[sessionData.clientId] = 'Unknown Client';
          }
        }
      }

      setChatSessions(sessionsData);
      setClientNames(prevNames => ({ ...prevNames, ...newClientNames }));
      setClientDetails(prevDetails => ({ ...prevDetails, ...newClientDetails }));
      setLoading(false);

      console.log('Chat sessions updated:', sessionsData.length);
    }, (error) => {
      console.error('Error in chat sessions listener:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to chats collection to get chat details
  useEffect(() => {
    if (!user?.uid) return;

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastMessageTime: doc.data().lastMessageTime?.toDate()
      }));

      setChats(chatsData);
      console.log('Chats updated:', chatsData.length);
    }, (error) => {
      console.error('Error in chats listener:', error);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to messages of selected chat
  useEffect(() => {
    if (!selectedChat?.chatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(selectedChat.chatId, (messagesData) => {
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedChat?.chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle chat session selection
  const handleChatSessionSelect = (session) => {
    // Find corresponding chat
    const correspondingChat = chats.find(chat => 
      chat.consultationRequestId === session.consultationRequestId
    );

    if (correspondingChat) {
      setSelectedChat({
        ...session,
        chatId: correspondingChat.id,
        lastMessage: correspondingChat.lastMessage,
        lastMessageTime: correspondingChat.lastMessageTime
      });
    } else {
      console.warn('No corresponding chat found for session:', session.id);
      setSelectedChat({
        ...session,
        chatId: null
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?.chatId || !user?.uid || sendingMessage) return;

    setSendingMessage(true);
    try {
      await sendMessage(selectedChat.chatId, user.uid, newMessage, 'lawyer');
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
    if (!selectedChat?.chatId) return;
    
    if (window.confirm('Are you sure you want to end this chat session?')) {
      try {
        await endChatSession(selectedChat.chatId, selectedChat.id);
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

  const getClientName = (session) => {
    if (session.consultationRequestId && clientDetails[session.consultationRequestId]) {
      return clientDetails[session.consultationRequestId].name;
    }
    return clientNames[session.clientId] || 'Loading...';
  };

  const getClientDetails = (session) => {
    if (session.consultationRequestId && clientDetails[session.consultationRequestId]) {
      return clientDetails[session.consultationRequestId];
    }
    return { name: clientNames[session.clientId] || 'Loading...', email: '', phone: '' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Chat Sessions List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Client Chats</h1>
          </div>
          <div className="text-sm text-gray-600">
            {chatSessions.length} active session{chatSessions.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {chatSessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active chat sessions</p>
              <p className="text-sm">Accept consultation requests to start chatting</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chatSessions.map((session) => {
                const correspondingChat = chats.find(chat => 
                  chat.consultationRequestId === session.consultationRequestId
                );

                return (
                  <div
                    key={session.id}
                    onClick={() => handleChatSessionSelect(session)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                      selectedChat?.id === session.id
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
                            {getClientName(session)}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            Service: {session.serviceType || 'chat'}
                          </div>
                          {correspondingChat && (
                            <div className="text-xs text-gray-500 truncate">
                              {correspondingChat.lastMessage || 'No messages yet'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-xs text-gray-500">
                          {formatTime(session.lastActivity)}
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-auto"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-lg">
                      {getClientDetails(selectedChat).name}
                    </h2>
                    <div className="space-y-1">
                      {getClientDetails(selectedChat).email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {getClientDetails(selectedChat).email}
                        </p>
                      )}
                      {getClientDetails(selectedChat).phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {getClientDetails(selectedChat).phone}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {selectedChat.status === 'active' ? 'Active Session' : 'Inactive'} • Service: {selectedChat.serviceType || 'chat'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
              {!selectedChat.chatId ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chat not found</p>
                  <p className="text-sm">Unable to load messages for this session</p>
                </div>
              ) : messages.length === 0 ? (
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
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  disabled={sendingMessage || selectedChat.status !== 'active' || !selectedChat.chatId}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage || selectedChat.status !== 'active' || !selectedChat.chatId}
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
              {!selectedChat.chatId && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  Unable to send messages - chat not found
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a Chat Session</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
