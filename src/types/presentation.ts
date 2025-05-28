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

export interface MarketingContent {
  facebookLaunchPost: string;
  storytellingPost: {
    title: string;
    content: string;
  };
  instagramStories: Array<{
    storyNumber: number;
    concept: string;
    content: string;
    callToAction: string;
  }>;
  tiktokScript: {
    disrupt: string;
    hook: string;
    issue: string;
    credibility: string;
    aboutLecture: string;
    callToAction: string;
  };
  emailCampaign: {
    subject: string;
    content: string;
  };
}

export interface MarketingVisuals {
  marketingImage: {
    imageUrl: string | null;
    downloadNote: string;
    canvaLink: string;
    instructions: string;
  };
}

export interface EnhancedStrategy {
  fourWeekPlan: Record<string, {
    theme: string;
    focus: string;
    goals: string[];
    activities: string[];
    contentTypes: string[];
  }>;
  budgetAllocation: Record<string, string>;
  successMetrics: string[];
  contingencyPlans: Array<{
    scenario: string;
    solution: string;
  }>;
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
  dynamicSlides?: SlideStructure[];
  dynamicB2BEmail?: string;
  dynamicSalesStrategy?: DynamicSalesStrategy;
  salesProcess?: SalesProcessStep[];
  motivationalMessage?: string;
  marketingContent?: MarketingContent;
  marketingVisuals?: MarketingVisuals;
  enhancedStrategy?: EnhancedStrategy;
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
