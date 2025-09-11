rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Lawyer profiles - lawyers can update their own, users can read
    match /lawyer_profiles/{lawyerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == lawyerId;
    }

    // Categories - read only for all authenticated users
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Consultation requests
    match /consultation_requests/{requestId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.clientId || 
         request.auth.uid == resource.data.lawyerId ||
         request.auth.uid == resource.data.userId);
      allow create: if request.auth != null && 
        (request.auth.uid == request.resource.data.clientId ||
         request.auth.uid == request.resource.data.userId);
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.lawyerId ||
         request.auth.uid == resource.data.clientId ||
         request.auth.uid == resource.data.userId);
    }

    // Chat sessions (renamed from active_sessions)
    match /chat_sessions/{sessionId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.clientId || 
         request.auth.uid == resource.data.lawyerId);
      allow create: if request.auth != null &&
        (request.auth.uid == request.resource.data.clientId || 
         request.auth.uid == request.resource.data.lawyerId);
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.clientId || 
         request.auth.uid == resource.data.lawyerId);
    }

    // Chats collection
    match /chats/{chatId} {
      allow read, update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
        request.auth.uid in request.resource.data.participants;

      // Messages subcollection under chats
      match /messages/{messageId} {
        allow read: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if request.auth != null && 
          request.auth.uid == request.resource.data.senderId &&
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow update: if request.auth != null && 
          request.auth.uid == resource.data.senderId;
      }
    }

    // Messages collection (standalone)
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
    }

    // Legacy support for sessions
    match /{path=**}/sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.lawyerId ||
         request.auth.uid == resource.data.clientId);
    }

    // Chat rooms and messages (legacy support)
    match /chat_rooms/{roomId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;

      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid == resource.data.senderId;
      }
    }

    // Video call sessions
    match /video_call_sessions/{sessionId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.lawyerId || 
         request.auth.uid == resource.data.clientId);
      allow create: if request.auth != null &&
        (request.auth.uid == request.resource.data.lawyerId || 
         request.auth.uid == request.resource.data.clientId);
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.lawyerId || 
         request.auth.uid == resource.data.clientId);
      allow delete: if request.auth != null &&
        (request.auth.uid == resource.data.lawyerId || 
         request.auth.uid == resource.data.clientId);
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}