
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc, 
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';

// Create active session when consultation is accepted
export const createActiveSession = async (consultationRequestId, clientId, lawyerId, serviceType) => {
  try {
    console.log('Creating active session for:', { consultationRequestId, clientId, lawyerId, serviceType });
    
    // Create active session
    const activeSessionData = {
      clientId,
      lawyerId,
      consultationRequestId,
      serviceType,
      status: 'active',
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    };

    const activeSessionRef = await addDoc(collection(db, 'active_sessions'), activeSessionData);
    console.log('Active session created:', activeSessionRef.id);

    // Create corresponding chat
    const chatData = {
      consultationRequestId,
      participants: [clientId, lawyerId],
      participantNames: {},
      createdAt: serverTimestamp(),
      lastMessage: 'Chat started',
      lastMessageSender: 'system',
      lastMessageTime: serverTimestamp(),
      status: 'active'
    };

    const chatRef = await addDoc(collection(db, 'chats'), chatData);
    console.log('Chat created:', chatRef.id);

    // Add initial system message
    await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
      senderId: 'system',
      messageText: 'Chat session started. You can now communicate with each other.',
      timestamp: serverTimestamp(),
      type: 'system'
    });

    return {
      sessionId: activeSessionRef.id,
      chatId: chatRef.id
    };
  } catch (error) {
    console.error('Error creating active session:', error);
    throw new Error('Failed to create active session');
  }
};

// Get active session by consultation request ID
export const getActiveSessionByConsultationId = async (consultationRequestId) => {
  try {
    const q = query(
      collection(db, 'active_sessions'),
      where('consultationRequestId', '==', consultationRequestId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastActivity: doc.data().lastActivity?.toDate()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting active session:', error);
    return null;
  }
};

// Get chat by consultation request ID
export const getChatByConsultationId = async (consultationRequestId) => {
  try {
    const q = query(
      collection(db, 'chats'),
      where('consultationRequestId', '==', consultationRequestId)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastMessageTime: doc.data().lastMessageTime?.toDate()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting chat:', error);
    return null;
  }
};

// Subscribe to messages in a chat
export const subscribeToMessages = (chatId, callback) => {
  try {
    console.log('Setting up message subscription for chatId:', chatId);
    
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        };
      });
      
      console.log('Messages updated:', messages.length);
      callback(messages);
    }, (error) => {
      console.error('Error in messages listener:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up messages listener:', error);
    callback([]);
    return () => {};
  }
};

// Send a message
export const sendMessage = async (chatId, senderId, messageText, senderType = 'user') => {
  try {
    console.log('Sending message:', { chatId, senderId, messageText });
    
    // Add message to subcollection
    const messageData = {
      senderId,
      messageText: messageText.trim(),
      timestamp: serverTimestamp(),
      type: senderType,
      isRead: false
    };

    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

    // Update chat's last message info
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: messageText.trim(),
      lastMessageSender: senderId,
      lastMessageTime: serverTimestamp()
    });

    console.log('Message sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};

// Subscribe to user's chats
export const subscribeToUserChats = (userId, callback) => {
  try {
    console.log('Setting up chats subscription for userId:', userId);
    
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          lastMessageTime: data.lastMessageTime?.toDate()
        };
      });
      
      console.log('Chats updated:', chats.length);
      callback(chats);
    }, (error) => {
      console.error('Error in chats listener:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up chats listener:', error);
    callback([]);
    return () => {};
  }
};

// End chat session
export const endChatSession = async (chatId, sessionId) => {
  try {
    // Update chat status
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      status: 'ended',
      endedAt: serverTimestamp()
    });

    // Update active session status
    if (sessionId) {
      const sessionRef = doc(db, 'active_sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'ended',
        endedAt: serverTimestamp()
      });
    }

    console.log('Chat session ended successfully');
    return true;
  } catch (error) {
    console.error('Error ending chat session:', error);
    throw new Error('Failed to end chat session');
  }
};
