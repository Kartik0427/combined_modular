import { db } from '../lib/firebase';
import { doc, updateDoc, onSnapshot, serverTimestamp, collection, query, where } from 'firebase/firestore';

export interface OnlineStatus {
  isOnline: boolean;
  lastSeen: Date;
}

// Update user's online status (for lawyers)
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

// Update user's online status (for clients)
export const updateUserOnlineStatus = async (userId: string, isOnline: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
};

// Subscribe to a user's online status
export const subscribeToOnlineStatus = (userId: string, callback: (status: any) => void) => {
  // For lawyers, query lawyer_profiles collection
  const userRef = doc(db, 'lawyer_profiles', userId);

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
export const subscribeToMultipleOnlineStatus = (userIds: string[], callback: (statuses: {[key: string]: any}) => void) => {
  if (userIds.length === 0) {
    callback({});
    return () => {};
  }

  // Query lawyer_profiles collection for lawyer online status
  const q = query(
    collection(db, 'lawyer_profiles'),
    where('__name__', 'in', userIds)
  );

  return onSnapshot(q, (snapshot) => {
    const statuses: {[key: string]: any} = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      statuses[doc.id] = {
        isOnline: data.isOnline || false,
        lastSeen: data.lastSeen?.toDate() || new Date()
      };
    });

    // For userIds not in the snapshot, set them as offline
    userIds.forEach(userId => {
      if (!statuses[userId]) {
        statuses[userId] = {
          isOnline: false,
          lastSeen: new Date()
        };
      }
    });

    callback(statuses);
  }, (error) => {
    console.error('Error in online status subscription:', error);
    callback({});
  });
};