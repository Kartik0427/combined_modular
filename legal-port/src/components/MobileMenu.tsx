import { Button } from "./ui/button";
import UserMenu from "./UserMenu";
import { User } from "firebase/auth";

interface MobileMenuProps {
  isOpen: boolean;
  user: User | null;
  onAuthClick: () => void;
  onSignOut: () => void;
}

export default function MobileMenu({ isOpen, user, onAuthClick, onSignOut }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden mt-2 p-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
      <div className="flex flex-col space-y-4">
          <a href="#home" className="text-gray-700 hover:text-gray-900 font-medium">Home</a>
          <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium">Features</a>
          <a href="#advisors" className="text-gray-700 hover:text-gray-900 font-medium">Advisors</a>
          <a href="#contact" className="text-gray-700 hover:text-gray-900 font-medium">Contact</a>
        {user ? (
          <UserMenu user={user} onSignOut={onSignOut} />
        ) : (
          <Button onClick={onAuthClick} className="bg-teal-600 hover:bg-teal-700 text-white w-full">
            Log In / Sign Up
          </Button>
        )}
      </div>
    </div>
  );
}