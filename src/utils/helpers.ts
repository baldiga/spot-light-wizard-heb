
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
