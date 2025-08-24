
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Video, Phone, MessageSquare, Save, User } from 'lucide-react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const SettingsPage = ({ setCurrentPage }) => {
  const [availability, setAvailability] = useState({
    audio: false,
    video: false,
    chat: false
  });
  const [isOnline, setIsOnline] = useState(false);
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLawyerId(user.uid);
        
        // Listen to lawyer profile changes
        const lawyerRef = doc(db, 'lawyer_profiles', user.uid);
        const unsubscribeDoc = onSnapshot(lawyerRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setAvailability(data.availability || { audio: false, video: false, chat: false });
            setIsOnline(data.isOnline || false);
          }
          setLoading(false);
        });

        return () => unsubscribeDoc();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleToggle = (service) => {
    setAvailability(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleOnlineToggle = () => {
    setIsOnline(!isOnline);
  };

  const handleSave = async () => {
    if (!lawyerId) return;
    
    setSaving(true);
    try {
      const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
      await updateDoc(lawyerRef, {
        availability,
        isOnline,
        lastActive: new Date()
      });
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          {/* Online Status */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Online Status
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Show as Online</p>
                <p className="text-sm text-gray-600">When enabled, users can see you're available</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={handleOnlineToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>

          {/* Service Availability */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Service Availability</h2>
            <div className="space-y-4">
              {/* Video Call Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Video Calls</p>
                    <p className="text-sm text-gray-600">Allow clients to request video consultations</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability.video}
                    onChange={() => handleToggle('video')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Audio Call Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Audio Calls</p>
                    <p className="text-sm text-gray-600">Allow clients to request voice-only consultations</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability.audio}
                    onChange={() => handleToggle('audio')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Chat Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Chat Messages</p>
                    <p className="text-sm text-gray-600">Allow clients to send text messages</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availability.chat}
                    onChange={() => handleToggle('chat')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
