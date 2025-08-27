
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, User, Phone, Video, MessageSquare, X, Mail, Paperclip, Image, FileText, Circle } from "lucide-react";
import { subscribeToMessages, sendMessage, sendMessageWithFile } from "../services/chatService";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { subscribeToMultipleOnlineStatus } from '../services/onlineStatusService';
import { subscribeToUnreadCounts, markMessagesAsRead, getTotalUnreadCount } from '../services/notificationService';

interface ChatPageProps {
  setCurrentPage: (page: string) => void;
  selectedChatId?: string | null;
  onChatSelect?: (chatId: string) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ setCurrentPage, selectedChatId = null, onChatSelect = null }) => {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [lawyerNames, setLawyerNames] = useState<{[key: string]: string}>({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [onlineStatuses, setOnlineStatuses] = useState<{[key: string]: any}>({});
  const [unreadCounts, setUnreadCounts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setCurrentPage("home");
      }
    });

    return () => unsubscribe();
  }, [setCurrentPage]);

  // Function to fetch lawyer name
  const fetchLawyerName = async (lawyerId: string) => {
    try {
      const lawyerDoc = await getDoc(doc(db, 'lawyer_profiles', lawyerId));
      if (lawyerDoc.exists()) {
        const lawyerData = lawyerDoc.data();
        return lawyerData.name || lawyerData.displayName || 'Unknown Lawyer';
      }
      return 'Unknown Lawyer';
    } catch (error) {
      console.error('Error fetching lawyer name:', error);
      return 'Unknown Lawyer';
    }
  };

  // Subscribe to user's chats
  useEffect(() => {
    if (!user?.uid) return;

    console.log('Setting up chats subscription for user:', user.uid);

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
      console.log('Chats snapshot received:', snapshot.size, 'documents');
      
      const chatsData = [];
      const newLawyerNames: {[key: string]: string} = {};
      const lawyerIds: string[] = [];

      for (const docSnapshot of snapshot.docs) {
        const chatData = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          createdAt: docSnapshot.data().createdAt?.toDate(),
          lastMessageTime: docSnapshot.data().lastMessageTime?.toDate()
        };

        chatsData.push(chatData);

        // Find the lawyer ID from participants
        const lawyerId = chatData.participants?.find((id: string) => id !== user.uid);
        if (lawyerId) {
          lawyerIds.push(lawyerId);
          if (!lawyerNames[lawyerId] && !newLawyerNames[lawyerId]) {
            try {
              const lawyerName = await fetchLawyerName(lawyerId);
              newLawyerNames[lawyerId] = lawyerName;
            } catch (error) {
              console.error('Error fetching lawyer name for:', lawyerId, error);
              newLawyerNames[lawyerId] = 'Unknown Lawyer';
            }
          }
        }
      }

      setChats(chatsData);
      setLawyerNames(prevNames => ({ ...prevNames, ...newLawyerNames }));
      setLoading(false);

      console.log('Chats updated:', chatsData.length);
    }, (error) => {
      console.error('Error in chats listener:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to online statuses of lawyers
  useEffect(() => {
    if (!user?.uid || chats.length === 0) return;

    const lawyerIds = chats.map(chat => 
      chat.participants?.find((id: string) => id !== user.uid)
    ).filter(Boolean);

    if (lawyerIds.length === 0) return;

    const unsubscribe = subscribeToMultipleOnlineStatus(lawyerIds, setOnlineStatuses);
    return unsubscribe;
  }, [user?.uid, chats]);

  // Subscribe to unread message counts
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUnreadCounts(user.uid, setUnreadCounts);
    return unsubscribe;
  }, [user?.uid]);

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

  // Handle chat selection
  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    if (onChatSelect) {
      onChatSelect(chat.id);
    }
    
    // Mark messages as read when chat is selected
    if (user?.uid) {
      markMessagesAsRead(chat.id, user.uid);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?.id || !user?.uid || sendingMessage) return;

    setSendingMessage(true);
    try {
      await sendMessage(selectedChat.id, user.uid, newMessage, 'client');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChat?.id || !user?.uid) return;

    // Check file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert('Only images (JPEG, PNG, GIF) and PDF files are allowed.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    setUploadingFile(true);
    try {
      await sendMessageWithFile(selectedChat.id, user.uid, file, 'client');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getLawyerName = (chat: any) => {
    const lawyerId = chat.participants?.find((id: string) => id !== user?.uid);
    return lawyerNames[lawyerId] || 'Loading...';
  };

  const getLawyerId = (chat: any) => {
    return chat.participants?.find((id: string) => id !== user?.uid);
  };

  const getUnreadCount = (chatId: string) => {
    const unread = unreadCounts.find(u => u.chatId === chatId);
    return unread?.count || 0;
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const renderMessageContent = (message: any) => {
    if (message.fileUrl) {
      if (message.fileType?.startsWith('image/')) {
        return (
          <div className="space-y-2">
            <div className="relative group">
              <img 
                src={message.fileUrl} 
                alt="Shared file" 
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.fileUrl, '_blank')}
                onError={(e) => {
                  console.error('Image failed to load:', message.fileUrl);
                  e.currentTarget.style.display = 'none';
                }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  Click to view
                </div>
              </div>
            </div>
            {message.messageText && (
              <p className="text-sm">{message.messageText}</p>
            )}
          </div>
        );
      } else if (message.fileType === 'application/pdf') {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg border hover:bg-gray-200 transition-colors">
              <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <a 
                  href={message.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium truncate block"
                >
                  {message.fileName || 'Document.pdf'}
                </a>
                <div className="text-xs text-gray-500">
                  {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(2)} MB` : 'PDF Document'}
                </div>
              </div>
            </div>
            {message.messageText && (
              <p className="text-sm">{message.messageText}</p>
            )}
          </div>
        );
      } else {
        // Generic file type
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg border hover:bg-gray-200 transition-colors">
              <Paperclip className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <a 
                  href={message.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium truncate block"
                >
                  {message.fileName || 'Unknown file'}
                </a>
                <div className="text-xs text-gray-500">
                  {message.fileSize ? `${(message.fileSize / 1024 / 1024).toFixed(2)} MB` : 'File'}
                </div>
              </div>
            </div>
            {message.messageText && (
              <p className="text-sm">{message.messageText}</p>
            )}
          </div>
        );
      }
    }
    return <p className="text-sm">{message.messageText}</p>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - Chats List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setCurrentPage("home")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">My Chats</h1>
          </div>
          <div className="text-sm text-gray-600">
            {chats.length} conversation{chats.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No chats yet</p>
              <p className="text-sm">Start a consultation to begin chatting</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                    selectedChat?.id === chat.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        {/* Online status indicator */}
                        {(() => {
                          const lawyerId = getLawyerId(chat);
                          const status = onlineStatuses[lawyerId];
                          return (
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              status?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 truncate">
                            {getLawyerName(chat)}
                          </div>
                          {(() => {
                            const lawyerId = getLawyerId(chat);
                            const status = onlineStatuses[lawyerId];
                            return status?.isOnline ? (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <Circle className="w-2 h-2 fill-current" />
                                Online
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                {status ? formatLastSeen(status.lastSeen) : 'Offline'}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {chat.lastMessage || 'No messages yet'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-xs text-gray-500">
                        {formatTime(chat.lastMessageTime)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    {(() => {
                      const lawyerId = getLawyerId(selectedChat);
                      const status = onlineStatuses[lawyerId];
                      return (
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          status?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      );
                    })()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-lg">
                      {getLawyerName(selectedChat)}
                    </h2>
                    {(() => {
                      const lawyerId = getLawyerId(selectedChat);
                      const status = onlineStatuses[lawyerId];
                      return (
                        <p className="text-sm">
                          {status?.isOnline ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <Circle className="w-2 h-2 fill-current" />
                              Online now
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {status ? `Last seen ${formatLastSeen(status.lastSeen)}` : 'Offline'}
                            </span>
                          )}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
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
                      {renderMessageContent(message)}
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
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile || selectedChat.status !== 'active'}
                  className="p-2 text-gray-500 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  disabled={sendingMessage || uploadingFile || selectedChat.status !== 'active'}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage || uploadingFile || selectedChat.status !== 'active'}
                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {uploadingFile && (
                <p className="text-sm text-blue-500 mt-2 text-center">
                  Uploading file...
                </p>
              )}
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
