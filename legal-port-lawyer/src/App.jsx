
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import LoginPage from './components/LoginPage';
import LawyerPortal from './LawyerPortal';
import LoadingPage from './pages/LoadingPage'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    // This is handled automatically by onAuthStateChanged
    setUser(user);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // User state will be updated automatically by onAuthStateChanged
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <LoadingPage/>
    );
  }

  return (
    <>
      {user ? (
        <LawyerPortal onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
