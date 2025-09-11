import React, { useState, useEffect } from "react";
import Modal from "./components/Modal";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { subscribeToConsultationRequests, getRequestStats } from "./services/consultationService";
import { updateOnlineStatus } from "./services/onlineStatusService";

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
import VideoCallPage from "./pages/VideoCallPage";

const LawyerPortal = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [requestStats, setRequestStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    declined: 0
  });

  // Default user data (will be replaced by Firebase data)
  const [user, setUser] = useState({
    name: "Loading...",
    specialization: "Loading...",
    experience: "0 Years",
    rating: 0,
    cases: 0,
    phone: "",
    email: "",
    uid: null
  });
  const [balance, setBalance] = useState(0);

  // Fetch lawyer profile from Firebase
  const fetchLawyerProfile = async (uid) => {
    try {
      console.log('Fetching lawyer profile for UID:', uid);
      const lawyerRef = doc(db, 'lawyer_profiles', uid);
      const lawyerDoc = await getDoc(lawyerRef);

      if (lawyerDoc.exists()) {
        const data = lawyerDoc.data();
        console.log('Lawyer profile data:', data);

        setLawyerProfile(data);

        // Update user state with fetched data
        setUser(prev => ({
          ...prev,
          uid: uid,
          name: data.name || "Unknown Lawyer",
          email: data.email || "",
          phone: data.phoneNumber || "",
          experience: data.experience ? `${data.experience} Years` : "0 Years",
          rating: data.rating || 0,
          cases: data.reviews || 0,
          specialization: data.bio ? data.bio.substring(0, 50) + "..." : "Legal Expert"
        }));

        // Calculate balance from pricing (example calculation)
        if (data.pricing) {
          const avgRate = (data.pricing.audio + data.pricing.video + data.pricing.chat) / 3;
          setBalance(Math.round(avgRate * 100)); // Example calculation
        }
      } else {
        console.log('No lawyer profile found for UID:', uid);
        // Set user data even if no profile exists
        setUser(prev => ({
          ...prev,
          uid: uid,
          name: "New Lawyer",
          specialization: "Please complete your profile"
        }));
      }
    } catch (error) {
      console.error('Error fetching lawyer profile:', error);
      // Set user data even on error
      setUser(prev => ({
        ...prev,
        uid: uid,
        name: "Lawyer",
        specialization: "Profile loading error"
      }));
    }
  };

  useEffect(() => {
    let requestsUnsubscribe = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);
      setAuthUser(firebaseUser);

      try {
        if (firebaseUser) {
          // Update online status when lawyer logs in
          updateOnlineStatus(firebaseUser.uid, true);

          // Fetch lawyer profile data
          await fetchLawyerProfile(firebaseUser.uid);

          // Set up consultation requests subscription
          console.log('Setting up consultation requests subscription for:', firebaseUser.uid);
          requestsUnsubscribe = subscribeToConsultationRequests(firebaseUser.uid, (requests) => {
            console.log('Received consultation requests:', requests);
            setConsultationRequests(requests);
            setRequestStats(getRequestStats(requests));
          });
        } else {
          // Reset data when user logs out
          setLawyerProfile(null);
          setConsultationRequests([]);
          setRequestStats({
            total: 0,
            pending: 0,
            accepted: 0,
            completed: 0,
            declined: 0
          });
          setUser(prevUser => ({
            ...prevUser,
            name: "Loading...",
            specialization: "Loading...",
            experience: "0 Years",
            rating: 0,
            cases: 0,
            phone: "",
            email: "",
            uid: null
          }));
          setBalance(0);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      } finally {
        // Always set loading to false regardless of success or failure
        setLoading(false);
      }
    });

    // Set lawyer offline when they leave/close the page
    const handleBeforeUnload = () => {
      if (authUser?.uid) {
        updateOnlineStatus(authUser.uid, false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (authUser?.uid) {
        updateOnlineStatus(authUser.uid, false);
      }
      if (requestsUnsubscribe) {
        requestsUnsubscribe();
      }
    };
  }, [authUser?.uid]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      // Set lawyer offline before signing out
      if (authUser?.uid) {
        await updateOnlineStatus(authUser.uid, false);
      }
      await signOut(auth);
      setShowLogoutModal(false);
      onLogout(); // Navigate back to main page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // This function determines which page component to render
  const handleStartSession = (request) => {
    // Navigate to video call page and pass the client ID
    setCurrentPage('videocall');
    // You can store the request data in state or pass it through URL params if needed
    console.log('Starting session for request:', request);
  };

  const renderPage = () => {
    const pageProps = {
      user,
      balance,
      setCurrentPage,
      handleLogout,
      lawyerProfile,
      consultationRequests,
      requestStats,
      onStartSession: handleStartSession
    };

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
      case "videocall":
        return <VideoCallPage {...pageProps} />;
      case "settings":
        return <SettingsPage setCurrentPage={setCurrentPage} user={user} />;
      case "requests":
        return <RequestsPage user={user} setCurrentPage={setCurrentPage} consultationRequests={consultationRequests} requestStats={requestStats} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-700">Loading your portal...</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-lg text-gray-700 mb-4">Please log in to access the lawyer portal.</div>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
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