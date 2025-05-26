
export interface PresentationFormData {
  idea: string;
  speakerBackground: string;
  audienceProfile: string;
  duration: "30" | "45" | "60" | "75" | "90" | "120";
  serviceOrProduct: string;
  callToAction: string;
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

export interface PresentationOutline {
  chapters: Chapter[];
  openingStyles: string[];
  timeDistribution: string;
  interactiveActivities: string[];
  presentationStructure: string;
  discussionQuestions: Record<string, string[]>;
  salesGuide: string;
  postPresentationPlan: string;
}
