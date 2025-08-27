
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

// Subscribe to unread message counts for a lawyer
export const subscribeToUnreadCounts = (userId, callback) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, async (snapshot) => {
    const unreadCounts = [];
    
    for (const chatDoc of snapshot.docs) {
      const chatData = chatDoc.data();
      
      // Query unread messages in this chat
      const messagesQ = query(
        collection(db, 'chats', chatDoc.id, 'messages'),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );
      
      const messagesSnapshot = await getDocs(messagesQ);
      const count = messagesSnapshot.size;
      
      if (count > 0) {
        const lastUnreadMessage = messagesSnapshot.docs[messagesSnapshot.docs.length - 1]?.data();
        unreadCounts.push({
          chatId: chatDoc.id,
          count,
          lastUnreadMessage: {
            ...lastUnreadMessage,
            timestamp: lastUnreadMessage.timestamp?.toDate()
          }
        });
      }
    }
    
    callback(unreadCounts);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (chatId, userId) => {
  try {
    const messagesQ = query(
      collection(db, 'chats', chatId, 'messages'),
      where('senderId', '!=', userId),
      where('isRead', '==', false)
    );
    
    const snapshot = await getDocs(messagesQ);
    
    const updatePromises = snapshot.docs.map(messageDoc => {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageDoc.id);
      return updateDoc(messageRef, { isRead: true });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

// Get total unread count across all chats
export const getTotalUnreadCount = (unreadCounts) => {
  return unreadCounts.reduce((total, chat) => total + chat.count, 0);
};
