
import { db } from '../lib/firebase';
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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Subscribe to messages in a chat
export const subscribeToMessages = (chatId: string, callback: (messages: any[]) => void) => {
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

// Send a text message
export const sendMessage = async (chatId: string, senderId: string, messageText: string, senderType: string = 'user') => {
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

// Send a message with file attachment
export const sendMessageWithFile = async (
  chatId: string, 
  senderId: string, 
  file: File, 
  senderType: string = 'user',
  messageText: string = ''
) => {
  try {
    console.log('Sending message with file:', { chatId, senderId, fileName: file.name });
    
    // Upload file to Firebase Storage
    const storage = getStorage();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileRef = ref(storage, `chat-files/${chatId}/${Date.now()}_${sanitizedFileName}`);
    
    const uploadResult = await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(uploadResult.ref);
    
    console.log('File uploaded successfully:', fileUrl);
    
    // Add message with file to subcollection
    const messageData = {
      senderId,
      messageText: messageText.trim(),
      timestamp: serverTimestamp(),
      type: senderType,
      isRead: false,
      fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    };

    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

    // Update chat's last message info
    const lastMessageText = messageText.trim() || `📎 ${file.name}`;
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: lastMessageText,
      lastMessageSender: senderId,
      lastMessageTime: serverTimestamp()
    });

    console.log('Message with file sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending message with file:', error);
    throw new Error('Failed to send message with file');
  }
};

// Subscribe to user's chats
export const subscribeToUserChats = (userId: string, callback: (chats: any[]) => void) => {
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

// Get chat by consultation request ID
export const getChatByConsultationId = async (consultationRequestId: string) => {
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
