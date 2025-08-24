
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import WhyChooseUs from "./components/WhyChooseUs";
import Advisors from "./components/Advisors";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import Catalogue from "./components/Catalogue";
import { useAuth } from "./context/AuthContext";
import { auth } from "./lib/firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

// Home component for the main landing page
const Home = ({ onAuthClick }: { onAuthClick: () => void }) => (
  <>
    <Hero onAuthClick={onAuthClick} />
    <Stats />
    <WhyChooseUs />
    <Advisors />
    <CTA onAuthClick={onAuthClick} />
  </>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    toast.success("Successfully logged in!");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully.");
    } catch (error) {
      console.error("Error signing out: ", error);
      toast.error("Failed to sign out.");
    }
  };

  return (
    <Router>
      <div className="app-container bg-gray-50">
        <Header
          user={user}
          onAuthClick={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
        />
        <main>
          <Routes>
            <Route 
              path="/" 
              element={<Home onAuthClick={() => setIsAuthModalOpen(true)} />} 
            />
            <Route 
              path="/catalogue" 
              element={
                <ProtectedRoute>
                  <Catalogue />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </Router>
  );
}
