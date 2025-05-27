
import { PresentationFormData, UserRegistrationData } from '@/types/presentation';

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const createEmptyPresentationFormData = (): PresentationFormData => ({
  idea: '',
  speakerBackground: '',
  audienceProfile: '',
  duration: "30",
  commonObjections: '',
  serviceOrProduct: '',
  callToAction: ''
});

export function createEmptyUserRegistrationData(): UserRegistrationData {
  return {
    fullName: "",
    email: "",
    phone: "",
    emailConsent: false,
    emailVerified: false
  };
}

export const validateCharacterCount = (text: string, min: number = 50, max: number = 1000) => {
  return {
    isValid: text.length >= min && text.length <= max,
    count: text.length,
    min,
    max
  };
};
