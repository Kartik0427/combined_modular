
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

export const updateConsultationRequestStatus = async (requestId, status, requestData = null) => {
  try {
    console.log('Updating consultation request status:', { requestId, status, requestData });
    
    const requestRef = doc(db, 'consultation_requests', requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === 'accepted' && { acceptedAt: serverTimestamp() })
    });

    console.log('Consultation request status updated successfully');

    // If status is accepted, create active session and chat
    if (status === 'accepted' && requestData) {
      console.log('Creating chat session for accepted request...');
      
      const { createActiveSession } = await import('./chatService');
      
      const clientId = requestData.clientId || requestData.userId;
      const lawyerId = requestData.lawyerId;
      
      if (!clientId || !lawyerId) {
        throw new Error('Missing clientId or lawyerId in request data');
      }
      
      const sessionData = await createActiveSession(
        requestId,
        clientId,
        lawyerId,
        requestData.serviceType || 'chat'
      );
      
      console.log('Chat session created successfully:', sessionData);
    }

    return true;
  } catch (error) {
    console.error('Error updating consultation request status:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      requestId,
      status,
      requestData
    });
    
    // Provide more specific error messages
    if (error.message.includes('Permission denied')) {
      throw new Error('Permission denied: Unable to update request or create chat session');
    } else {
      throw new Error(`Failed to update request status: ${error.message}`);
    }
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
