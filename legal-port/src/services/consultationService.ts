// consultationService.ts
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';

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
  // Add fields that match your Firebase structure
  category?: string;
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  clientId?: string; // This might be what your Firebase structure expects instead of userId
}

export const createConsultationRequest = async (request: Omit<ConsultationRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Ensure all required fields are present and properly formatted
    const consultationData = {
      userId: request.userId,
      clientId: request.userId, // Adding clientId for Firebase structure compatibility
      lawyerId: request.lawyerId,
      serviceType: request.serviceType,
      status: request.status || 'pending',
      message: request.message || '',
      pricing: Number(request.pricing) || 0,
      category: request.category || '',
      clientInfo: request.clientInfo || null,
      requestedTime: request.requestedTime ? Timestamp.fromDate(request.requestedTime) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timestamp: serverTimestamp() // Adding timestamp field as seen in your Firebase structure
    };

    console.log('Creating consultation request with data:', consultationData);

    const docRef = await addDoc(collection(db, 'consultation_requests'), consultationData);

    console.log('Consultation request created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating consultation request:', error);
    console.error('Request data that failed:', request);
    throw new Error(`Failed to create consultation request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getUserConsultationRequests = async (userId: string): Promise<ConsultationRequest[]> => {
  try {
    // Try both userId and clientId fields since your structure might use either
    const queries = [
      query(collection(db, 'consultation_requests'), where('userId', '==', userId)),
      query(collection(db, 'consultation_requests'), where('clientId', '==', userId))
    ];

    const allResults: ConsultationRequest[] = [];

    for (const q of queries) {
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          requestedTime: data.requestedTime?.toDate() || undefined
        } as ConsultationRequest;
      });

      allResults.push(...results);
    }

    // Remove duplicates based on id
    const uniqueResults = allResults.filter((request, index, self) => 
      index === self.findIndex(r => r.id === request.id)
    );

    return uniqueResults;
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        requestedTime: data.requestedTime?.toDate() || undefined
      } as ConsultationRequest;
    });
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
    const requests = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        requestedTime: data.requestedTime?.toDate() || undefined
      } as ConsultationRequest;
    });

    callback(requests);
  });
};

// Real-time listener for consultation requests (for users)
export const subscribeUserConsultationRequests = (userId: string, callback: (requests: ConsultationRequest[]) => void) => {
  // Subscribe to both possible field names
  const queries = [
    query(collection(db, 'consultation_requests'), where('userId', '==', userId)),
    query(collection(db, 'consultation_requests'), where('clientId', '==', userId))
  ];

  const unsubscribeFunctions: (() => void)[] = [];

  queries.forEach(q => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          requestedTime: data.requestedTime?.toDate() || undefined
        } as ConsultationRequest;
      });

      callback(requests);
    });

    unsubscribeFunctions.push(unsubscribe);
  });

  // Return a function that unsubscribes from all queries
  return () => {
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  };
};