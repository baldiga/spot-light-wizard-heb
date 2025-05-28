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
  section?: string;
  headline: string;
  content: string;
  visual: string;
  notes: string;
  timeAllocation?: string;
  engagementTip?: string;
  transitionPhrase?: string;
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

export interface SalesProcessStep {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface SocialMediaContent {
  facebookShortPost: string;
  facebookStoryPost: string;
  instagramStories: string[];
  tiktokScript: {
    disrupt: string;
    hook: string;
    issue: string;
    credibility: string;
    lectureDetails: string;
    callToAction: string;
  };
}

export interface EmailImageContent {
  storytellingEmail: {
    subject: string;
    body: string;
  };
  promotionalImage: {
    description: string;
    downloadNote: string;
    canvaLink: string;
  };
}

export interface MarketingPlan {
  fourWeekPlan: {
    week1: WeekPlan;
    week2: WeekPlan;
    week3: WeekPlan;
    week4: WeekPlan;
  };
  budgetConsiderations: string[];
  keyMetrics: string[];
}

export interface WeekPlan {
  title: string;
  goals: string[];
  activities: string[];
  contentIdeas: string[];
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
  salesProcess?: SalesProcessStep[];
  motivationalMessage?: string;
  // New marketing content fields
  socialMediaContent?: SocialMediaContent;
  emailImageContent?: EmailImageContent;
  marketingPlan?: MarketingPlan;
}

export interface OpeningSuggestion {
  type: string;
  script: string;
  tips: string;
}

export interface ChapterQuestion {
  question: string;
  purpose: string;
  expectedAnswers: string[];
  followUp: string;
}

export interface InteractiveActivity {
  activity: string;
  timing: string;
  duration: string;
  instructions: string;
  materials: string;
}

export interface TransitionPhrase {
  from: string;
  to: string;
  phrase: string;
}

export interface EngagementTechnique {
  technique: string;
  when: string;
  howTo: string;
  benefits: string;
}

export interface TroubleshootingTip {
  problem: string;
  solution: string;
  prevention: string;
}

export interface ClosingTechnique {
  type: string;
  script: string;
  callToAction: string;
}

export interface PresentationTools {
  openingSuggestions: OpeningSuggestion[];
  chapterQuestions: Record<string, ChapterQuestion[]>;
  interactiveActivities: InteractiveActivity[];
  transitionPhrases: TransitionPhrase[];
  engagementTechniques: EngagementTechnique[];
  troubleshooting: TroubleshootingTip[];
  closingTechniques: ClosingTechnique[];
}
