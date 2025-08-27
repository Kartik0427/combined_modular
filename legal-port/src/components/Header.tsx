import React from 'react';
import { Scale, MessageSquare } from 'lucide-react'; // Import MessageSquare icon
import { User } from 'firebase/auth';
import UserMenu from './UserMenu'; // Assuming UserMenu component exists

interface HeaderProps {
  user: User | null;
  onAuthClick: () => void;
  onSignOut: () => void;
  onChatClick?: () => void; // Add onChatClick prop
}

const Header = ({ user, onAuthClick, onSignOut, onChatClick }: HeaderProps) => {
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
              className="flex items-center gap-2 text-dark-blue hover:text-gold transition-colors"
              title="My Chats"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="md:inline">Chats</span>
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