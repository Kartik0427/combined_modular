import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import videoCallService from '../services/videoCallServiceInstance';
import { auth } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast } from 'react-hot-toast';

interface VideoCallSession {
  id: string;
  channelName: string;
  lawyerId: string;
  clientId: string;
  status: 'waiting' | 'active' | 'ended';
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  consultationRequestId?: string;
}

const VideoCallPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Video call state
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<VideoCallSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSessions, setAvailableSessions] = useState<VideoCallSession[]>([]);
  
  // Video refs
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    setupVideoCallHandlers();
    loadAvailableSessions();
    
    // Check if there's a session ID in the URL params
    const sessionId = new URLSearchParams(location.search).get('sessionId');
    if (sessionId) {
      joinSessionById(sessionId);
    }
    
    return () => {
      cleanup();
    };
  }, [user, navigate, location]);

  // Render remote videos after refs are assigned
  useEffect(() => {
    remoteUsers.forEach((user) => {
      const uid = String(user.uid);
      const videoElement = remoteVideoRefs.current[uid];

      if (user.videoTrack && videoElement) {
        user.videoTrack.play(videoElement);
      }
    });
  }, [remoteUsers]);

  const setupVideoCallHandlers = () => {
    // User events
    videoCallService.onUserJoined = (uid) => {
      console.log('User joined:', uid);
      toast.success('Lawyer joined the call');
    };

    videoCallService.onUserLeft = (uid) => {
      console.log('User left:', uid);
      toast('Lawyer left the call');
      setRemoteUsers(prev => prev.filter(u => u.uid !== uid));
    };

    videoCallService.onUserPublished = (uid, mediaType) => {
      console.log('User published:', uid, mediaType);
      updateRemoteUsers();
    };

    videoCallService.onUserUnpublished = (uid, mediaType) => {
      console.log('User unpublished:', uid, mediaType);
      updateRemoteUsers();
    };

    // Connection events
    videoCallService.onConnectionStateChanged = (state, reason) => {
      console.log('Connection state changed:', state, reason);
      setConnectionState(state);
      
      if (state === 'CONNECTED') {
        setIsConnected(true);
        toast.success('Connected to video call');
      } else if (state === 'DISCONNECTED') {
        setIsConnected(false);
        toast('Disconnected from video call');
      }
    };

    // Token events
    videoCallService.onTokenPrivilegeWillExpire = () => {
      toast('Session will expire soon', { icon: '⚠️' });
    };

    videoCallService.onTokenPrivilegeExpired = () => {
      toast.error('Session expired. Please reconnect.');
    };
  };

  const loadAvailableSessions = async () => {
    if (!user) return;
    
    try {
      const sessions = await videoCallService.getActiveSessionsForUser(user.uid);
      setAvailableSessions(sessions);
    } catch (error) {
      console.error('Failed to load available sessions:', error);
    }
  };

  const updateRemoteUsers = () => {
    const users = videoCallService.getAllRemoteUsers();
    setRemoteUsers(users);
    
    // Re-render videos for all remote users
    users.forEach(user => {
      if (user.videoTrack) {
        setTimeout(() => {
          renderRemoteVideo(String(user.uid));
        }, 100);
      }
    });
  };

  const renderLocalVideo = () => {
    setTimeout(() => {
      const localVideoTrack = videoCallService.getLocalVideoTrack();
      if (localVideoTrack && localVideoRef.current) {
        try {
          localVideoTrack.play(localVideoRef.current);
          console.log('Local video rendered successfully');
        } catch (error) {
          console.error('Failed to render local video:', error);
        }
      }
    }, 100);
  };

  const renderRemoteVideo = (uid: string) => {
    setTimeout(() => {
      const remoteUser = videoCallService.getRemoteUser(uid);
      const videoElement = remoteVideoRefs.current[uid];
      
      if (remoteUser?.videoTrack && videoElement) {
        try {
          remoteUser.videoTrack.play(videoElement);
          console.log('Remote video rendered successfully for UID:', uid);
        } catch (error) {
          console.error('Failed to render remote video for UID:', uid, error);
        }
      }
    }, 100);
  };

  const joinSessionById = async (sessionId: string) => {
    const session = availableSessions.find(s => s.id === sessionId);
    if (session) {
      await joinVideoCall(session);
    }
  };

  const joinVideoCall = async (session: VideoCallSession) => {
    setIsLoading(true);
    
    try {
      console.log('Starting video call join process...');
      setCurrentSession(session);
      
      // Ensure service is properly initialized
      if (!videoCallService) {
        throw new Error('Video call service not available');
      }
      
      console.log('Creating local tracks...');
      // Create local tracks
      await videoCallService.createLocalTracks();
      
      console.log('Joining channel...');
      // Join channel with UID 0 (matching token generation) and fixed channel name
      const uid = 0;
      const channelName = 'kartik'; // Fixed channel name matching token
      await videoCallService.joinChannel(channelName, uid);
      
      console.log('Publishing tracks...');
      // Publish tracks
      await videoCallService.publishTracks();
      
      console.log('Rendering local video...');
      // Render local video with delay to ensure DOM is ready
      setTimeout(() => {
        renderLocalVideo();
      }, 300);
      
      toast.success('Joined video call successfully');
    } catch (error) {
      console.error('Failed to join video call:', error);
      toast.error(`Failed to join video call: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset state on error
      setCurrentSession(null);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveVideoCall = async () => {
    try {
      setIsLoading(true);
      
      // Leave channel and cleanup
      await videoCallService.leaveChannel();
      
      // Reset state
      setCurrentSession(null);
      setIsConnected(false);
      setRemoteUsers([]);
      
      toast.success('Left video call');
    } catch (error) {
      console.error('Failed to leave video call:', error);
      toast.error(`Failed to leave video call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideo = async () => {
    try {
      const newState = !isVideoEnabled;
      await videoCallService.toggleVideo(newState);
      setIsVideoEnabled(newState);
      toast.success(`Video ${newState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast.error('Failed to toggle video');
    }
  };

  const toggleAudio = async () => {
    try {
      const newState = !isAudioEnabled;
      await videoCallService.toggleAudio(newState);
      setIsAudioEnabled(newState);
      toast.success(`Audio ${newState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      toast.error('Failed to toggle audio');
    }
  };

  const cleanup = () => {
    try {
      if (videoCallService) {
        videoCallService.destroy();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video Call</h1>
              <p className="text-gray-600 mt-1">
                Status: <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionState}
                </span>
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Available Sessions */}
        {!currentSession && availableSessions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Video Calls</h2>
            <div className="space-y-3">
              {availableSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Video Call Session</p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="capitalize">{session.status}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {session.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => joinVideoCall(session)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Joining...' : 'Join Call'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Sessions Available */}
        {!currentSession && availableSessions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Video Calls</h3>
              <p className="text-gray-600 mb-4">
                You don't have any active video call sessions. Your lawyer will start a session when ready.
              </p>
              <button
                onClick={loadAvailableSessions}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Video Call Interface */}
        {currentSession && (
          <div className="space-y-6">
            {/* Session Info */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Session ID: <span className="font-mono">{currentSession.id}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Channel: <span className="font-mono">{currentSession.channelName}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                  <span className="text-sm text-gray-500">
                    {remoteUsers.length} participant(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Local Video */}
              <div className="bg-black rounded-lg overflow-hidden relative aspect-video">
                <div
                  ref={localVideoRef}
                  className="w-full h-full"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You (Client)
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-sm">Video Off</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Remote Video */}
              <div className="bg-black rounded-lg overflow-hidden relative aspect-video">
                {remoteUsers.length > 0 ? (
                  remoteUsers.map((user) => (
                    <div key={user.uid} className="w-full h-full relative">
                      <div
                        ref={el => { 
                          if (el) {
                            remoteVideoRefs.current[user.uid] = el;
                            // Render video immediately when ref is set
                            if (user.videoTrack) {
                              setTimeout(() => {
                                renderRemoteVideo(String(user.uid));
                              }, 50);
                            }
                          }
                        }}
                        className="w-full h-full"
                      />
                      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        Lawyer
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Waiting for lawyer to join...</p>
                      <p className="text-sm text-gray-300 mt-2">
                        Please wait while your lawyer connects to the call
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    isAudioEnabled 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    {isAudioEnabled ? (
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.617l3.766-2.793a1 1 0 011.617.793z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.617l3.766-2.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoEnabled 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    {isVideoEnabled ? (
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    ) : (
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 8v4c0 .368-.097.714-.268 1.014l-2.732-2.732V6a2 2 0 00-2-2H7.014L3.707 2.293zM16 9.586L14 8.586v3.828L16 11.414V9.586zM12 7.414L6.586 2H9a2 2 0 012 2v3.414zM2 6c0-.362.097-.706.268-1.014L2.293 4.293a1 1 0 011.414-1.414L5.414 4.586A2 2 0 016 4h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>

                <button
                  onClick={leaveVideoCall}
                  disabled={isLoading}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Leaving...' : 'Leave Call'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;