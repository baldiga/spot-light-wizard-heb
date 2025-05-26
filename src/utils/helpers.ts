
import { PresentationFormData, UserRegistrationData } from "@/types/presentation";

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function createEmptyPresentationFormData(): PresentationFormData {
  return {
    idea: "",
    speakerBackground: "",
    audienceProfile: "",
    duration: "45",
    serviceOrProduct: "",
    callToAction: ""
  };
}

export function createEmptyUserRegistrationData(): UserRegistrationData {
  return {
    fullName: "",
    email: "",
    phone: "",
    emailConsent: false,
    emailVerified: false
  };
}
