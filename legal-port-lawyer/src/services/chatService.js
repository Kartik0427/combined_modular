

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

// Create chat session when consultation is accepted
export const createActiveSession = async (consultationRequestId, clientId, lawyerId, serviceType) => {
  try {
    console.log('Creating chat session for:', { consultationRequestId, clientId, lawyerId, serviceType });
    
    // Validate required parameters
    if (!consultationRequestId || !clientId || !lawyerId) {
      throw new Error('Missing required parameters: consultationRequestId, clientId, or lawyerId');
    }
    
    // Create chat session (renamed from active_sessions)
    const chatSessionData = {
      clientId: String(clientId),
      lawyerId: String(lawyerId),
      consultationRequestId: String(consultationRequestId),
      serviceType: serviceType || 'chat',
      status: 'active',
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    };

    console.log('Attempting to create chat session with data:', chatSessionData);
    const chatSessionRef = await addDoc(collection(db, 'chat_sessions'), chatSessionData);
    console.log('Chat session created successfully:', chatSessionRef.id);

    // Create corresponding chat
    const chatData = {
      consultationRequestId: String(consultationRequestId),
      participants: [String(clientId), String(lawyerId)],
      participantNames: {},
      createdAt: serverTimestamp(),
      lastMessage: 'Chat started',
      lastMessageSender: 'system',
      lastMessageTime: serverTimestamp(),
      status: 'active'
    };

    console.log('Attempting to create chat with data:', chatData);
    const chatRef = await addDoc(collection(db, 'chats'), chatData);
    console.log('Chat created successfully:', chatRef.id);

    // Add initial system message
    try {
      await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
        senderId: 'system',
        messageText: 'Chat session started. You can now communicate with each other.',
        timestamp: serverTimestamp(),
        type: 'system'
      });
      console.log('Initial system message added successfully');
    } catch (messageError) {
      console.warn('Failed to add initial system message:', messageError);
      // Don't throw here as the chat was created successfully
    }

    return {
      sessionId: chatSessionRef.id,
      chatId: chatRef.id
    };
  } catch (error) {
    console.error('Error creating chat session:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied: Unable to create chat session. Please check Firebase security rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('Firebase service temporarily unavailable. Please try again.');
    } else {
      throw new Error(`Failed to create chat session: ${error.message}`);
    }
  }
};

// Get chat session by consultation request ID
export const getActiveSessionByConsultationId = async (consultationRequestId) => {
  try {
    const q = query(
      collection(db, 'chat_sessions'),
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
    console.error('Error getting chat session:', error);
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

    // Also store the message in the corresponding chat_session
    try {
      // Find the chat session by chatId (we need to query by consultationRequestId)
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const consultationRequestId = chatData.consultationRequestId;
        
        if (consultationRequestId) {
          // Find the chat session
          const sessionQuery = query(
            collection(db, 'chat_sessions'),
            where('consultationRequestId', '==', consultationRequestId)
          );
          
          const sessionSnapshot = await getDocs(sessionQuery);
          if (!sessionSnapshot.empty) {
            const sessionDoc = sessionSnapshot.docs[0];
            const sessionRef = doc(db, 'chat_sessions', sessionDoc.id);
            
            // Get current messages array or initialize empty array
            const currentSession = sessionDoc.data();
            const currentMessages = currentSession.messages || [];
            
            // Add new message to the array
            const newMessage = {
              senderId,
              messageText: messageText.trim(),
              timestamp: new Date(),
              type: senderType,
              isRead: false
            };
            
            // Update the chat session with the new message
            await updateDoc(sessionRef, {
              messages: [...currentMessages, newMessage],
              lastActivity: serverTimestamp()
            });
            
            console.log('Message also stored in chat_session');
          }
        }
      }
    } catch (sessionError) {
      console.warn('Failed to store message in chat_session:', sessionError);
      // Don't throw here as the main message was sent successfully
    }

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

    // Update chat session status
    if (sessionId) {
      const sessionRef = doc(db, 'chat_sessions', sessionId);
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

