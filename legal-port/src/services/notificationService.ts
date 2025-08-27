
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

export interface UnreadCount {
  chatId: string;
  count: number;
  lastUnreadMessage?: any;
}

// Subscribe to unread message counts for a user
export const subscribeToUnreadCounts = (userId: string, callback: (unreadCounts: UnreadCount[]) => void) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, async (snapshot) => {
    const unreadCounts: UnreadCount[] = [];
    
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
export const markMessagesAsRead = async (chatId: string, userId: string) => {
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
export const getTotalUnreadCount = (unreadCounts: UnreadCount[]): number => {
  return unreadCounts.reduce((total, chat) => total + chat.count, 0);
};
