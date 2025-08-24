import React, { useState, useEffect } from "react";
import Modal from "./components/Modal";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Import all the page components
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import ReportsPage from "./pages/ReportsPage";
import ContactPage from "./pages/ContactPage";
import ReviewsPage from "./pages/ReviewsPage";
import ChatPage from "./pages/ChatPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import RequestsPage from "./pages/RequestsPage";

const LawyerPortal = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This data would typically come from an API
  const [user, setUser] = useState({
    name: "Adv. Anuj Kumar",
    specialization: "Criminal & Civil Law",
    experience: "12 Years",
    rating: 4.8,
    cases: 150,
    phone: "+91 98765 43210",
    email: "anuj.kumar@lawfirm.com",
  });
  const [balance, setBalance] = useState(2450);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (user) {
        setUser(prev => ({
          ...prev,
          email: user.email,
          name: user.displayName || "Adv. " + user.email?.split('@')[0]
        }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // This function determines which page component to render
  const renderPage = () => {
    const pageProps = { user, balance, setCurrentPage, handleLogout };

    switch (currentPage) {
      case "profile":
        return <ProfilePage {...pageProps} />;
      case "analytics":
        return <AnalyticsPage {...pageProps} />;
      case "reports":
        return <ReportsPage {...pageProps} />;
      case "contact":
        return <ContactPage {...pageProps} />;
      case "reviews":
        return <ReviewsPage {...pageProps} />;
      case "chat":
        return <ChatPage {...pageProps} />;
      case "settings":
        return <SettingsPage setCurrentPage={setCurrentPage} />;
      case "requests":
        return <RequestsPage user={user} setCurrentPage={setCurrentPage} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Please log in to access the lawyer portal.</div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {showLogoutModal && (
        <Modal
          title="Confirm Logout"
          message="Are you sure you want to logout?"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
      {renderPage()}
    </div>
  );
};

export default LawyerPortal;