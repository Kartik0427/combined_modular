
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export interface ConsultationRequest {
  id?: string;
  userId: string;
  lawyerId: string;
  serviceType: 'audio' | 'video' | 'chat';
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  message: string;
  requestedTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  pricing: number;
}

export const createConsultationRequest = async (request: Omit<ConsultationRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'consultation_requests'), {
      ...request,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating consultation request:', error);
    throw new Error('Failed to create consultation request');
  }
};

export const getUserConsultationRequests = async (userId: string): Promise<ConsultationRequest[]> => {
  try {
    const q = query(
      collection(db, 'consultation_requests'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      requestedTime: doc.data().requestedTime?.toDate()
    })) as ConsultationRequest[];
  } catch (error) {
    console.error('Error fetching user consultation requests:', error);
    throw new Error('Failed to fetch consultation requests');
  }
};

export const getLawyerConsultationRequests = async (lawyerId: string): Promise<ConsultationRequest[]> => {
  try {
    const q = query(
      collection(db, 'consultation_requests'),
      where('lawyerId', '==', lawyerId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      requestedTime: doc.data().requestedTime?.toDate()
    })) as ConsultationRequest[];
  } catch (error) {
    console.error('Error fetching lawyer consultation requests:', error);
    throw new Error('Failed to fetch consultation requests');
  }
};

export const updateConsultationStatus = async (requestId: string, status: ConsultationRequest['status']) => {
  try {
    const requestRef = doc(db, 'consultation_requests', requestId);
    await updateDoc(requestRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating consultation status:', error);
    throw new Error('Failed to update consultation status');
  }
};

// Real-time listener for consultation requests (for lawyers)
export const subscribeLawyerConsultationRequests = (lawyerId: string, callback: (requests: ConsultationRequest[]) => void) => {
  const q = query(
    collection(db, 'consultation_requests'),
    where('lawyerId', '==', lawyerId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      requestedTime: doc.data().requestedTime?.toDate()
    })) as ConsultationRequest[];
    
    callback(requests);
  });
};

// Real-time listener for consultation requests (for users)
export const subscribeUserConsultationRequests = (userId: string, callback: (requests: ConsultationRequest[]) => void) => {
  const q = query(
    collection(db, 'consultation_requests'),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      requestedTime: doc.data().requestedTime?.toDate()
    })) as ConsultationRequest[];
    
    callback(requests);
  });
};
