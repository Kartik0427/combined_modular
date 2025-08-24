import { createConsultationRequest, ConsultationRequest } from './consultationService';

export interface ConsultationRequestData {
  userId: string;
  lawyerId: string;
  serviceType: 'audio' | 'video' | 'chat';
  message: string;
  pricing: number;
  userInfo: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  requestedTime?: Date;
}

export interface UserInfoFormData {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
}

export const submitConsultationRequest = async (
  requestData: ConsultationRequestData
): Promise<string> => {
  try {
    // Prepare the consultation request according to the existing interface
    const consultationRequest: Omit<ConsultationRequest, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: requestData.userId,
      lawyerId: requestData.lawyerId,
      serviceType: requestData.serviceType,
      status: 'pending',
      message: requestData.message,
      requestedTime: requestData.requestedTime,
      pricing: requestData.pricing,
      clientInfo: {
        name: requestData.userInfo.name,
        email: requestData.userInfo.email,
        phone: requestData.userInfo.phoneNumber,
      }
    };

    // Create the consultation request using existing service
    const requestId = await createConsultationRequest(consultationRequest);

    console.log('Consultation request created successfully:', requestId);
    return requestId;
  } catch (error) {
    console.error('Error submitting consultation request:', error);
    throw new Error('Failed to submit consultation request. Please try again.');
  }
};

export const validateUserInfo = (userInfo: UserInfoFormData): string[] => {
  const errors: string[] = [];

  if (!userInfo.name.trim()) {
    errors.push('Name is required');
  }

  if (!userInfo.email.trim()) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(userInfo.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!userInfo.phoneNumber.trim()) {
    errors.push('Phone number is required');
  } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(userInfo.phoneNumber.replace(/\s/g, ''))) {
    errors.push('Please enter a valid phone number');
  }

  if (!userInfo.message.trim()) {
    errors.push('Please describe your legal issue');
  }

  return errors;
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Add +91 if it's a 10-digit Indian number without country code
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    return `+91${cleaned}`;
  }

  // Add + if it starts with a country code but no +
  if (cleaned.length > 10 && !cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }

  return cleaned;
};