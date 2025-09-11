import React, { useState, useEffect } from 'react';
import { Scale, MessageSquare, Video } from 'lucide-react'; // Import MessageSquare and Video icons
import { User } from 'firebase/auth';
import UserMenu from './UserMenu'; // Assuming UserMenu component exists
import { subscribeToUnreadCounts, getTotalUnreadCount } from '../services/notificationService';
import { updateOnlineStatus, updateUserOnlineStatus } from '../services/onlineStatusService';
import { VideoCallService } from '../services/videoCallService';

interface HeaderProps {
  user: User | null;
  onAuthClick: () => void;
  onSignOut: () => void;
  onChatClick?: () => void; // Add onChatClick prop
  onVideoCallClick?: () => void; // Add onVideoCallClick prop
}

const Header = ({ user, onAuthClick, onSignOut, onChatClick, onVideoCallClick }: HeaderProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [videoCallService] = useState(() => new VideoCallService());
  const [activeVideoSessions, setActiveVideoSessions] = useState(0);

  // Subscribe to unread messages
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUnreadCounts(user.uid, (unreadCounts) => {
      setUnreadCount(getTotalUnreadCount(unreadCounts));
    });

    return unsubscribe;
  }, [user?.uid]);

  // Subscribe to video call sessions
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = videoCallService.listenForSessionUpdates(user.uid, (sessions) => {
      const activeSessions = sessions.filter(session => 
        session.status === 'waiting' || session.status === 'active'
      );
      setActiveVideoSessions(activeSessions.length);
    });

    return unsubscribe;
  }, [user?.uid, videoCallService]);

  // Update online status when user logs in/out
  useEffect(() => {
    if (user?.uid) {
      // Update online status in users collection for clients
      updateUserOnlineStatus(user.uid, true);
      
      // Set user offline when they leave/close the page
      const handleBeforeUnload = () => {
        updateUserOnlineStatus(user.uid, false);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        updateUserOnlineStatus(user.uid, false);
      };
    }
  }, [user?.uid]);

  return (
    <header className="bg-dark-blue text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-20">
        {/* Left Side: Logo & Tagline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Scale className="text-gold" size={32} />
            <span className="text-xl font-bold">Legal Port</span>
          </div>
          <p className="hidden md:block text-sm text-gray-300 border-l border-gray-600 pl-4">
            Connect. Consult. Resolve.
          </p>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <a href="/" className="hover:text-gold transition-colors">Home</a>
          <a href="#advisors" className="hover:text-gold transition-colors">Our Advisors</a>
          <a href="/catalogue" className="hover:text-gold transition-colors">Find Lawyers</a>
          <a href="#contact" className="hover:text-gold transition-colors">Contact Us</a>
        </nav>

        {/* Right Side: Wallet & Auth */}
        <div className="flex items-center gap-4">
          <div className="bg-wallet-green text-wallet-green-text font-semibold px-4 py-2 rounded-lg text-sm">
            ₹2500
          </div>
          {user && onChatClick && (
            <button
              onClick={onChatClick}
              className="relative flex items-center gap-2 text-white hover:text-gold transition-colors"
              title="My Chats"
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Chats</span>
            </button>
          )}
          {user && onVideoCallClick && (
            <button
              onClick={onVideoCallClick}
              className="relative flex items-center gap-2 text-white hover:text-gold transition-colors"
              title="Video Calls"
            >
              <div className="relative">
                <Video className="w-5 h-5" />
                {activeVideoSessions > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {activeVideoSessions > 99 ? '99+' : activeVideoSessions}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Video Calls</span>
            </button>
          )}
          {user ? (
            <UserMenu user={user} onSignOut={onSignOut} />
          ) : (
            <button
              onClick={onAuthClick}
              className="bg-gold text-dark-blue font-bold px-6 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;