
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

  // Split userIds into chunks of 10 (Firestore limit for 'in' queries)
  const chunks = [];
  for (let i = 0; i < userIds.length; i += 10) {
    chunks.push(userIds.slice(i, i + 10));
  }

  const statuses = {};
  let completedChunks = 0;

  const unsubscribers = chunks.map(chunk => {
    // Query users collection for client online status
    const q = query(
      collection(db, 'users'),
      where('__name__', 'in', chunk)
    );

    return onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        statuses[doc.id] = {
          isOnline: data.isOnline || false,
          lastSeen: data.lastSeen?.toDate() || new Date()
        };
      });

      // Fill in missing users from this chunk as offline
      chunk.forEach(userId => {
        if (!statuses[userId]) {
          statuses[userId] = { isOnline: false, lastSeen: new Date() };
        }
      });

      completedChunks++;
      if (completedChunks === chunks.length) {
        callback(statuses);
      }
    }, (error) => {
      console.error('Error in online status subscription:', error);
      // Fill missing users as offline on error
      chunk.forEach(userId => {
        if (!statuses[userId]) {
          statuses[userId] = { isOnline: false, lastSeen: new Date() };
        }
      });
      completedChunks++;
      if (completedChunks === chunks.length) {
        callback(statuses);
      }
    });
  });

  // Return a function that unsubscribes all listeners
  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
  };
};
