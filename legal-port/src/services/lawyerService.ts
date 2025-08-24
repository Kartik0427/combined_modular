import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export interface Lawyer {
  id: string;
  name: string;
  specializations: string[];
  rating: number;
  reviews: number;
  experience: number;
  isOnline: boolean;
  pricing: {
    audio: number;
    video: number;
    chat: number;
  };
  image: string;
  connections: number;
  verified: boolean;
  availability: {
    audio: boolean;
    video: boolean;
    chat: boolean;
  };
  lastActive: Date;
}

// Function to convert Firebase Storage gs:// URL to HTTPS URL
const getImageUrl = async (imageUrl: string): Promise<string> => {
  if (!imageUrl) return '';

  // If it's already an HTTPS URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a gs:// URL, convert to download URL
  if (imageUrl.startsWith('gs://')) {
    try {
      const storage = getStorage();
      // Extract the path from gs://bucket-name/path
      const path = imageUrl.replace(/^gs:\/\/[^/]+\//, '');
      const storageRef = ref(storage, path);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error getting download URL for image:', error);
      return '';
    }
  }

  return imageUrl;
};

// Function to fetch specializations for a specific lawyer
export const fetchLawyerCategories = async (lawyerId: string): Promise<string[]> => {
  if (!lawyerId) {
    console.warn('No lawyerId provided for fetchLawyerCategories');
    return [];
  }

  try {
    const categoriesRef = collection(db, "categories");
    const querySnapshot = await getDocs(categoriesRef);

    if (querySnapshot.empty) {
      console.warn('No categories found in database');
      return [];
    }

    const categories: string[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        // Check if this lawyer is in the lawyers array for this category
        if (data.lawyers && Array.isArray(data.lawyers) && data.lawyers.includes(lawyerId)) {
          if (data.names && typeof data.names === 'object') {
            Object.values(data.names).forEach(name => {
              if (typeof name === 'string' && name.trim() && !categories.includes(name)) {
                categories.push(name);
              }
            });
          }
        }
      } catch (docError) {
        console.warn(`Error processing category document ${doc.id}:`, docError);
      }
    });

    return categories;
  } catch (error) {
    console.error("Error fetching lawyer categories:", error);
    return [];
  }
};

export const fetchLawyers = async (): Promise<Lawyer[]> => {
  try {
    const lawyersRef = collection(db, 'lawyer_profiles');
    const q = query(lawyersRef, orderBy('rating', 'desc'), limit(100)); // Limit results for better performance
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn('No lawyers found in database');
      return [];
    }

    const lawyerPromises = querySnapshot.docs.map(async (doc) => {
      try {
        const data = doc.data();

        // Fetch categories from categories collection with error handling
        const specializations = await fetchLawyerCategories(doc.id).catch(err => {
          console.warn(`Failed to fetch categories for lawyer ${doc.id}:`, err);
          return [];
        });

        // Get the proper image URL with error handling
        const imageUrl = await getImageUrl(data.image || '').catch(err => {
          console.warn(`Failed to get image URL for lawyer ${doc.id}:`, err);
          return '';
        });

        return {
          id: doc.id,
          name: data.name || 'Unknown',
          specializations: specializations.length > 0 ? specializations : ['General Practice'],
          rating: Number(data.rating) || 0,
          reviews: Number(data.reviews) || 0,
          experience: Number(data.experience) || 0,
          isOnline: Boolean(data.isOnline),
          pricing: {
            audio: Number(data.pricing?.audio) || 0,
            video: Number(data.pricing?.video) || 0,
            chat: Number(data.pricing?.chat) || 0,
          },
          image: imageUrl,
          connections: Number(data.connections) || 0,
          verified: Boolean(data.verified),
          availability: {
            audio: Boolean(data.availability?.audio),
            video: Boolean(data.availability?.video),
            chat: Boolean(data.availability?.chat),
          },
          lastActive: data.lastActive?.toDate() || new Date(),
        };
      } catch (docError) {
        console.error(`Error processing lawyer document ${doc.id}:`, docError);
        // Return a fallback object instead of failing entirely
        return {
          id: doc.id,
          name: 'Unknown',
          specializations: ['General Practice'],
          rating: 0,
          reviews: 0,
          experience: 0,
          isOnline: false,
          pricing: { audio: 0, video: 0, chat: 0 },
          image: '',
          connections: 0,
          verified: false,
          availability: { audio: false, video: false, chat: false },
          lastActive: new Date(),
        };
      }
    });

    const lawyers = await Promise.allSettled(lawyerPromises);
    
    // Filter out failed promises and return successful ones
    const successfulLawyers = lawyers
      .filter((result): result is PromiseFulfilledResult<Lawyer> => result.status === 'fulfilled')
      .map(result => result.value);

    if (successfulLawyers.length === 0) {
      throw new Error('No lawyers could be loaded successfully');
    }

    console.log(`Successfully loaded ${successfulLawyers.length} lawyers`);
    return successfulLawyers;

  } catch (error) {
    console.error('Error fetching lawyers:', error);
    throw new Error(`Failed to fetch lawyers from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Real-time listener for lawyer availability changes
export const subscribeLawyerAvailability = (lawyerId: string, callback: (availability: any) => void) => {
  const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);

  return onSnapshot(lawyerRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        availability: data.availability || { audio: false, video: false, chat: false },
        isOnline: data.isOnline || false,
        lastActive: data.lastActive?.toDate() || new Date()
      });
    }
  });
};

// Real-time listener for all lawyers (for the main catalog)
export const subscribeLawyers = (callback: (lawyers: Lawyer[]) => void) => {
  const lawyersRef = collection(db, 'lawyer_profiles');
  const q = query(lawyersRef, orderBy('rating', 'desc'), limit(100));

  return onSnapshot(q, async (snapshot) => {
    try {
      if (snapshot.empty) {
        console.warn('No lawyers found in real-time subscription');
        callback([]);
        return;
      }

      const lawyerPromises = snapshot.docs.map(async (doc) => {
        try {
          const data = doc.data();

          // Fetch categories from categories collection with error handling
          const specializations = await fetchLawyerCategories(doc.id).catch(err => {
            console.warn(`Failed to fetch categories for lawyer ${doc.id}:`, err);
            return [];
          });

          // Get the proper image URL with error handling
          const imageUrl = await getImageUrl(data.image || '').catch(err => {
            console.warn(`Failed to get image URL for lawyer ${doc.id}:`, err);
            return '';
          });

          return {
            id: doc.id,
            name: data.name || 'Unknown',
            specializations: specializations.length > 0 ? specializations : ['General Practice'],
            rating: Number(data.rating) || 0,
            reviews: Number(data.reviews) || 0,
            experience: Number(data.experience) || 0,
            isOnline: Boolean(data.isOnline),
            pricing: {
              audio: Number(data.pricing?.audio) || 0,
              video: Number(data.pricing?.video) || 0,
              chat: Number(data.pricing?.chat) || 0,
            },
            image: imageUrl,
            connections: Number(data.connections) || 0,
            verified: Boolean(data.verified),
            availability: {
              audio: Boolean(data.availability?.audio),
              video: Boolean(data.availability?.video),
              chat: Boolean(data.availability?.chat),
            },
            lastActive: data.lastActive?.toDate() || new Date(),
          };
        } catch (docError) {
          console.error(`Error processing lawyer document ${doc.id} in subscription:`, docError);
          return null;
        }
      });

      const results = await Promise.allSettled(lawyerPromises);
      const lawyers = results
        .filter((result): result is PromiseFulfilledResult<Lawyer | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value!);

      callback(lawyers);
    } catch (error) {
      console.error('Error in real-time lawyers subscription:', error);
      callback([]);
    }
  }, (error) => {
    console.error('Firebase subscription error:', error);
    callback([]);
  });
};