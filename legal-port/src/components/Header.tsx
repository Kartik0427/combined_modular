import React from 'react';
import { Scale } from 'lucide-react';
import { User } from 'firebase/auth';
import UserMenu from './UserMenu'; // Assuming UserMenu component exists

interface HeaderProps {
  user: User | null;
  onAuthClick: () => void;
  onSignOut: () => void;
}

const Header = ({ user, onAuthClick, onSignOut }: HeaderProps) => {
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
          {user && (
            <a href="/catalogue" className="hover:text-gold transition-colors">Find Lawyers</a>
          )}
          <a href="#contact" className="hover:text-gold transition-colors">Contact Us</a>
        </nav>

        {/* Right Side: Wallet & Auth */}
        <div className="flex items-center gap-4">
          <div className="bg-wallet-green text-wallet-green-text font-semibold px-4 py-2 rounded-lg text-sm">
            ₹2500
          </div>
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