
import { db } from '../lib/firebase';
import { doc, updateDoc, onSnapshot, serverTimestamp, collection, query, where } from 'firebase/firestore';

export interface OnlineStatus {
  isOnline: boolean;
  lastSeen: Date;
}

// Update user's online status
export const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating online status:', error);
  }
};

// Subscribe to a user's online status
export const subscribeToOnlineStatus = (userId: string, callback: (status: OnlineStatus) => void) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen?.toDate() || new Date()
      });
    } else {
      callback({ isOnline: false, lastSeen: new Date() });
    }
  });
};

// Subscribe to multiple users' online status
export const subscribeToMultipleOnlineStatus = (userIds: string[], callback: (statuses: Record<string, OnlineStatus>) => void) => {
  if (userIds.length === 0) {
    callback({});
    return () => {};
  }

  const q = query(
    collection(db, 'users'),
    where('__name__', 'in', userIds)
  );

  return onSnapshot(q, (snapshot) => {
    const statuses: Record<string, OnlineStatus> = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      statuses[doc.id] = {
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen?.toDate() || new Date()
      };
    });

    // Fill in missing users as offline
    userIds.forEach(userId => {
      if (!statuses[userId]) {
        statuses[userId] = { isOnline: false, lastSeen: new Date() };
      }
    });

    callback(statuses);
  });
};
