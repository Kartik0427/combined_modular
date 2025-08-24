
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const subscribeToConsultationRequests = (lawyerId, callback) => {
  try {
    console.log('Setting up consultation requests subscription for lawyerId:', lawyerId);
    
    const q = query(
      collection(db, 'consultation_requests'),
      where('lawyerId', '==', lawyerId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Firestore snapshot received, docs count:', snapshot.docs.length);
      
      const requests = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing document:', doc.id, data);
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          requestedTime: data.requestedTime?.toDate()
        };
      });
      
      console.log('Processed consultation requests:', requests);
      callback(requests);
    }, (error) => {
      console.error('Error in consultation requests listener:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up consultation requests listener:', error);
    callback([]);
    return () => {};
  }
};

export const updateConsultationRequestStatus = async (requestId, status) => {
  try {
    const requestRef = doc(db, 'consultation_requests', requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating consultation request status:', error);
    throw new Error('Failed to update request status');
  }
};

export const getRequestStats = (requests) => {
  if (!requests || requests.length === 0) {
    return {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      declined: 0
    };
  }

  return {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    completed: requests.filter(r => r.status === 'completed').length,
    declined: requests.filter(r => r.status === 'declined').length
  };
};
