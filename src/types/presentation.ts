
export interface PresentationFormData {
  idea: string;
  speakerBackground: string;
  audienceProfile: string;
  duration: "30" | "45" | "60" | "75" | "90" | "120";
  commonObjections: string;
  serviceOrProduct: string;
  callToAction: string;
}

export interface UserRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  emailConsent: boolean;
  emailVerified: boolean;
}

export interface ChapterPoint {
  id: string;
  content: string;
}

export interface Chapter {
  id: string;
  title: string;
  points: ChapterPoint[];
}

export interface SlideStructure {
  number: number;
  headline: string;
  content: string;
  visual: string;
  notes: string;
  timeAllocation?: string;
}

export interface MarketingChannel {
  channel: string;
  strategy: string;
  timeline: string;
  budget: string;
}

export interface PricingStrategy {
  basicTicket: string;
  vipTicket: string;
  premiumTicket: string;
  corporatePackage: string;
}

export interface DynamicSalesStrategy {
  targetAudiences: string[];
  marketingChannels: MarketingChannel[];
  pricingStrategy: PricingStrategy;
  collaborationOpportunities: string[];
  contentMarketing: string[];
  followUpStrategy: string;
}

export interface PresentationOutline {
  chapters: Chapter[];
  openingStyles: string[];
  timeDistribution: string;
  interactiveActivities: string[];
  presentationStructure: string;
  discussionQuestions: Record<string, string[]>;
  salesGuide: string;
  postPresentationPlan: string;
  // New dynamic content fields
  dynamicSlides?: SlideStructure[];
  dynamicB2BEmail?: string;
  dynamicSalesStrategy?: DynamicSalesStrategy;
}
