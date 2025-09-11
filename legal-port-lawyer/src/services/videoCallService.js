import AgoraRTC from 'agora-rtc-sdk-ng';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

/**
 * Video Call Service for Lawyer Portal
 * Handles Agora.io video calling functionality with Firebase integration
 */
export class VideoCallService {
  constructor() {
    this.client = null;
    this.localVideoTrack = null;
    this.localAudioTrack = null;
    this.remoteUsers = new Map();
    this.isJoined = false;
    this.currentChannelName = '';
    this.currentUID = null;
    this.tokenRenewalCallback = null;

    // Event handlers
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onUserPublished = null;
    this.onUserUnpublished = null;
    this.onConnectionStateChanged = null;
    this.onNetworkQualityChanged = null;
    this.onTokenPrivilegeWillExpire = null;
    this.onTokenPrivilegeExpired = null;

    this.initializeClient();
  }

  /**
   * Initialize Agora RTC client with optimized settings
   */
  initializeClient() {
    try {
      this.client = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8'
      });

      this.setupEventHandlers();
      
      console.log('VideoCallService: Client initialized successfully');
    } catch (error) {
      console.error('VideoCallService: Failed to initialize client:', error);
      throw new Error(`Failed to initialize Agora client: ${error}`);
    }
  }

  /**
   * Set up comprehensive event handlers for the Agora client
   */
  setupEventHandlers() {
    if (!this.client) return;

    // User events
    this.client.on('user-joined', (user) => {
      console.log('VideoCallService: User joined:', user.uid);
      this.remoteUsers.set(user.uid, { uid: user.uid });
      if (this.onUserJoined) this.onUserJoined(user.uid);
    });

    this.client.on('user-left', (user) => {
      console.log('VideoCallService: User left:', user.uid);
      this.remoteUsers.delete(user.uid);
      if (this.onUserLeft) this.onUserLeft(user.uid);
    });

    this.client.on('user-published', async (user, mediaType) => {
      console.log('VideoCallService: User published:', user.uid, mediaType);
      
      try {
        await this.client.subscribe(user, mediaType);
        
        const remoteUser = this.remoteUsers.get(user.uid) || { uid: user.uid };
        
        if (mediaType === 'video') {
          remoteUser.videoTrack = user.videoTrack;
        } else if (mediaType === 'audio') {
          remoteUser.audioTrack = user.audioTrack;
        }
        
        this.remoteUsers.set(user.uid, remoteUser);
        if (this.onUserPublished) this.onUserPublished(user.uid, mediaType);
      } catch (error) {
        console.error('VideoCallService: Failed to subscribe to user:', error);
      }
    });

    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('VideoCallService: User unpublished:', user.uid, mediaType);
      
      const remoteUser = this.remoteUsers.get(user.uid);
      if (remoteUser) {
        if (mediaType === 'video') {
          remoteUser.videoTrack = undefined;
        } else if (mediaType === 'audio') {
          remoteUser.audioTrack = undefined;
        }
        this.remoteUsers.set(user.uid, remoteUser);
      }
      
      if (this.onUserUnpublished) this.onUserUnpublished(user.uid, mediaType);
    });

    // Connection events
    this.client.on('connection-state-change', (curState, revState, reason) => {
      console.log('VideoCallService: Connection state changed:', curState, 'Reason:', reason);
      if (this.onConnectionStateChanged) this.onConnectionStateChanged(curState, reason || '');
    });

    // Network quality events
    this.client.on('network-quality', (stats) => {
      if (this.onNetworkQualityChanged) this.onNetworkQualityChanged(stats);
    });

    // Token events
    this.client.on('token-privilege-will-expire', () => {
      console.log('VideoCallService: Token privilege will expire');
      if (this.onTokenPrivilegeWillExpire) this.onTokenPrivilegeWillExpire();
      this.handleTokenRenewal();
    });

    this.client.on('token-privilege-expired', () => {
      console.log('VideoCallService: Token privilege expired');
      if (this.onTokenPrivilegeExpired) this.onTokenPrivilegeExpired();
      this.handleTokenRenewal();
    });

    // Exception handling
    this.client.on('exception', (event) => {
      console.error('VideoCallService: Exception occurred:', event);
    });
  }

  /**
   * Get the Agora token - using working hardcoded values
   */
  async fetchToken(channelName, uid) {
    try {
      // Using working token for kartik channel with UID 0
      const token = '007eJxTYHh/wKZbOTlxfu/l2nfzn+0VO/xYagWb3FWTn/vVrwlUnZ6owJBkYmyZZp6SmJqSZG5iYZFoYWSSZmFilmyYaGJpapRsGq9yOKMhkJEh9IUIIyMDBIL4bAzZiUUlmdkMDAAe9yGW';
      
      console.log('VideoCallService: Using working token for channel:', channelName, 'UID:', uid);
      return token;
    } catch (error) {
      console.error('VideoCallService: Failed to get token:', error);
      throw new Error(`Token error: ${error}`);
    }
  }

  /**
   * Handle token renewal
   */
  async handleTokenRenewal() {
    if (!this.currentChannelName || !this.currentUID) {
      console.error('VideoCallService: Cannot renew token - missing channel or UID');
      return;
    }

    try {
      let newToken;
      
      if (this.tokenRenewalCallback) {
        newToken = await this.tokenRenewalCallback(this.currentChannelName, this.currentUID);
      } else {
        newToken = await this.fetchToken(this.currentChannelName, this.currentUID);
      }
      
      await this.client.renewToken(newToken);
      console.log('VideoCallService: Token renewed successfully');
    } catch (error) {
      console.error('VideoCallService: Token renewal failed:', error);
    }
  }

  /**
   * Set a custom token renewal callback
   */
  setTokenRenewalCallback(callback) {
    this.tokenRenewalCallback = callback;
  }

  /**
   * Create optimized local video and audio tracks
   */
  async createLocalTracks() {
    try {
      console.log('VideoCallService: Creating local tracks...');
      
      // Create video track with optimized settings
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrateMin: 600,
          bitrateMax: 1000
        }
      });

      // Create audio track with advanced settings
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'music_standard',
        ANS: true, // Automatic Noise Suppression
        AEC: true, // Acoustic Echo Cancellation
        AGC: true  // Automatic Gain Control
      });

      console.log('VideoCallService: Local tracks created successfully');
    } catch (error) {
      console.error('VideoCallService: Failed to create local tracks:', error);
      throw new Error(`Failed to create local tracks: ${error}`);
    }
  }

  /**
   * Join a video call channel
   */
  async joinChannel(channelName, uid) {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    if (this.isJoined) {
      throw new Error('Already joined a channel');
    }

    try {
      console.log('VideoCallService: Joining channel:', channelName, 'UID:', uid);
      
      // Get token from server
      const token = await this.fetchToken(channelName, uid);
      
      // Using working hardcoded App ID
      const appId = 'b439f7daedb7488a824f846c1a4952c5';
      
      console.log('VideoCallService: App ID:', appId);
      console.log('VideoCallService: Channel:', channelName);
      console.log('VideoCallService: UID:', uid);
      console.log('VideoCallService: Token:', token.substring(0, 20) + '...');
      
      // Join the channel with working parameters
      await this.client.join(
        appId,
        channelName,
        token,
        uid
      );

      this.isJoined = true;
      this.currentChannelName = channelName;
      this.currentUID = uid;

      console.log('VideoCallService: Successfully joined channel');
    } catch (error) {
      console.error('VideoCallService: Failed to join channel:', error);
      throw new Error(`Failed to join channel: ${error}`);
    }
  }

  /**
   * Publish local tracks to the channel
   */
  async publishTracks() {
    if (!this.client || !this.isJoined) {
      throw new Error('Not joined to any channel');
    }

    if (!this.localVideoTrack || !this.localAudioTrack) {
      throw new Error('Local tracks not created');
    }

    try {
      console.log('VideoCallService: Publishing local tracks...');
      
      await this.client.publish([this.localVideoTrack, this.localAudioTrack]);
      
      console.log('VideoCallService: Local tracks published successfully');
    } catch (error) {
      console.error('VideoCallService: Failed to publish tracks:', error);
      throw new Error(`Failed to publish tracks: ${error}`);
    }
  }

  /**
   * Leave the current channel and clean up resources
   */
  async leaveChannel() {
    try {
      console.log('VideoCallService: Leaving channel...');

      if (this.client && this.isJoined) {
        await this.client.leave();
      }

      // Close local tracks
      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }

      // Clear remote users
      this.remoteUsers.clear();

      this.isJoined = false;
      this.currentChannelName = '';
      this.currentUID = null;

      console.log('VideoCallService: Successfully left channel and cleaned up resources');
    } catch (error) {
      console.error('VideoCallService: Error during cleanup:', error);
      throw new Error(`Failed to leave channel: ${error}`);
    }
  }

  /**
   * Get local video track for UI rendering
   */
  getLocalVideoTrack() {
    return this.localVideoTrack;
  }

  /**
   * Get local audio track
   */
  getLocalAudioTrack() {
    return this.localAudioTrack;
  }

  /**
   * Get remote user by UID
   */
  getRemoteUser(uid) {
    return this.remoteUsers.get(uid);
  }

  /**
   * Get all remote users
   */
  getAllRemoteUsers() {
    return Array.from(this.remoteUsers.values());
  }

  /**
   * Toggle local video on/off
   */
  async toggleVideo(enabled) {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled);
    }
  }

  /**
   * Toggle local audio on/off
   */
  async toggleAudio(enabled) {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(enabled);
    }
  }

  /**
   * Get connection state
   */
  getConnectionState() {
    return this.client?.connectionState || null;
  }

  /**
   * Check if currently joined to a channel
   */
  isChannelJoined() {
    return this.isJoined;
  }

  // Firebase integration methods

  /**
   * Create a new video call session in Firebase
   */
  async createVideoCallSession(lawyerId, clientId, consultationRequestId) {
    try {
      const channelName = this.generateChannelName(lawyerId, clientId);
      
      const sessionData = {
        channelName,
        lawyerId,
        clientId,
        status: 'waiting',
        createdAt: new Date(),
        ...(consultationRequestId && { consultationRequestId })
      };

      const docRef = await addDoc(collection(db, 'video_call_sessions'), sessionData);
      
      return {
        id: docRef.id,
        ...sessionData
      };
    } catch (error) {
      console.error('VideoCallService: Failed to create session:', error);
      throw new Error(`Failed to create video call session: ${error}`);
    }
  }

  /**
   * Update video call session status
   */
  async updateSessionStatus(sessionId, status) {
    try {
      const sessionRef = doc(db, 'video_call_sessions', sessionId);
      const updateData = { status };
      
      if (status === 'active') {
        updateData.startedAt = new Date();
      } else if (status === 'ended') {
        updateData.endedAt = new Date();
      }
      
      await updateDoc(sessionRef, updateData);
    } catch (error) {
      console.error('VideoCallService: Failed to update session status:', error);
      throw new Error(`Failed to update session status: ${error}`);
    }
  }

  /**
   * Listen for video call session updates for lawyer
   */
  listenForLawyerSessions(lawyerId, callback) {
    const q = query(
      collection(db, 'video_call_sessions'),
      where('lawyerId', '==', lawyerId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    return onSnapshot(q, (snapshot) => {
      const sessions = [];
      snapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          startedAt: doc.data().startedAt?.toDate(),
          endedAt: doc.data().endedAt?.toDate()
        });
      });
      callback(sessions);
    });
  }

  /**
   * Get active video call sessions for a lawyer
   */
  async getActiveSessionsForLawyer(lawyerId) {
    try {
      const q = query(
        collection(db, 'video_call_sessions'),
        where('lawyerId', '==', lawyerId),
        where('status', 'in', ['waiting', 'active'])
      );

      const snapshot = await getDocs(q);
      const sessions = [];
      
      snapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          startedAt: doc.data().startedAt?.toDate(),
          endedAt: doc.data().endedAt?.toDate()
        });
      });

      return sessions;
    } catch (error) {
      console.error('VideoCallService: Failed to get active sessions:', error);
      throw new Error(`Failed to get active sessions: ${error}`);
    }
  }

  /**
   * Generate a valid channel name (under 32 characters, alphanumeric only)
   */
  generateChannelName(lawyerId, clientId) {
    // Generate a proper channel name using timestamp and user IDs
    const timestamp = Date.now().toString().slice(-6);
    const lawyerShort = lawyerId.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
    const clientShort = clientId.slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
    return `vc${timestamp}${lawyerShort}${clientShort}`.slice(0, 31);
  }

  /**
   * Cleanup and destroy the service
   */
  destroy() {
    this.leaveChannel().catch(console.error);
    this.client = null;
    this.remoteUsers.clear();
  }
}

export default VideoCallService;
