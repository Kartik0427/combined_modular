
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, serverTimestamp, collection, query, where } from 'firebase/firestore';

// Update user's online status
export const updateOnlineStatus = async (userId, isOnline) => {
  try {
    const userRef = doc(db, 'lawyer_profiles', userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating online status:', error);
  }
};

// Subscribe to a user's online status
export const subscribeToOnlineStatus = (userId, callback) => {
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
export const subscribeToMultipleOnlineStatus = (userIds, callback) => {
  if (userIds.length === 0) {
    callback({});
    return () => {};
  }

  const q = query(
    collection(db, 'users'),
    where('__name__', 'in', userIds)
  );

  return onSnapshot(q, (snapshot) => {
    const statuses = {};
    
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
