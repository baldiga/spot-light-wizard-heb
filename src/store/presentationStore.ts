
import { create } from 'zustand';
import { PresentationFormData, PresentationOutline, Chapter, UserRegistrationData } from '@/types/presentation';
import { generateId } from '@/utils/helpers';
import { generatePresentationOutline, generateMarketingContent, generateMarketingVisuals, generateSalesStrategy } from '@/services/presentationService';
import { sendToZapierWebhook } from '@/services/webhookService';

interface PresentationState {
  formData: PresentationFormData | null;
  userRegistration: UserRegistrationData | null;
  outline: PresentationOutline | null;
  chapters: Chapter[];
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  error: string | null;
  isGeneratingMarketing: boolean;
  marketingLoadingMessage: string;
  marketingLoadingProgress: number;
  setFormData: (data: PresentationFormData) => void;
  setUserRegistration: (data: UserRegistrationData) => void;
  setOutline: (outline: PresentationOutline) => void;
  setChapters: (chapters: Chapter[]) => void;
  updateChapter: (chapterId: string, title: string) => void;
  updatePoint: (chapterId: string, pointId: string, content: string) => void;
  generateBasicOutline: () => Promise<void>;
  generateEnhancedContent: () => Promise<void>;
  generateDummyOutline: () => void;
  resetError: () => void;
  setLoadingProgress: (progress: number) => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  formData: null,
  userRegistration: null,
  outline: null,
  chapters: [],
  isLoading: false,
  loadingMessage: "יוצרים את מבנה ההרצאה...",
  loadingProgress: 0,
  error: null,
  isGeneratingMarketing: false,
  marketingLoadingMessage: "",
  marketingLoadingProgress: 0,
  
  setFormData: (data) => set({ formData: data }),
  setUserRegistration: (data) => set({ userRegistration: data }),
  setOutline: (outline) => set({ outline }),
  setChapters: (chapters) => set({ chapters }),
  resetError: () => set({ error: null }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  
  updateChapter: (chapterId, title) => set((state) => ({
    chapters: state.chapters.map(chapter => 
      chapter.id === chapterId ? { ...chapter, title } : chapter
    )
  })),
  
  updatePoint: (chapterId, pointId, content) => set((state) => ({
    chapters: state.chapters.map(chapter => 
      chapter.id === chapterId 
        ? { 
            ...chapter, 
            points: chapter.points.map(point => 
              point.id === pointId ? { ...point, content } : point
            )
          } 
        : chapter
    )
  })),

  generateBasicOutline: async () => {
    const { formData } = get();
    
    if (!formData) {
      console.error('No form data available for outline generation');
      set({ error: "אין מידע זמין ליצירת מבנה הרצאה" });
      return;
    }
    
    const currentFormData = { ...formData };
    
    set({ 
      isLoading: true, 
      error: null,
      loadingMessage: "יוצרים מבנה הרצאה בסיסי...",
      loadingProgress: 10
    });
    
    try {
      console.log('Starting basic outline generation for topic:', currentFormData.idea);
      
      set({ loadingMessage: "יוצרים פרקים וכותרות...", loadingProgress: 50 });
      const outlineData = await generatePresentationOutline(currentFormData);
      
      set({ 
        formData: currentFormData,
        outline: outlineData,
        chapters: outlineData.chapters,
        isLoading: false,
        loadingMessage: "יוצרים את מבנה ההרצאה...",
        loadingProgress: 100,
        error: null
      });
    } catch (error) {
      console.error("Failed to generate basic outline:", error);
      
      let errorMessage = "אירעה שגיאה ביצירת מבנה ההרצאה. אנא נסה שנית.";
      
      if (error.message.includes('API key')) {
        errorMessage = "בעיה במפתח ה-API של OpenAI. אנא בדוק את ההגדרות.";
      } else if (error.message.includes('parse') || error.message.includes('JSON')) {
        errorMessage = "שגיאה בעיבוד תשובת הבינה המלאכותית. אנא נסה שנית.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "בעיית תקשורת. בדוק את החיבור לאינטרנט ונסה שנית.";
      }
      
      set({ 
        formData: currentFormData,
        error: errorMessage, 
        isLoading: false,
        loadingMessage: "יוצרים את מבנה ההרצאה...",
        loadingProgress: 0
      });
    }
  },

  generateEnhancedContent: async () => {
    const { formData, userRegistration, outline } = get();
    
    if (!formData || !outline) {
      console.error('No form data or outline available for enhanced content generation');
      set({ error: "אין מידע זמין ליצירת תוכן משופר" });
      return;
    }
    
    set({ 
      isGeneratingMarketing: true, 
      error: null,
      marketingLoadingMessage: "יוצרים תוכן שיווקי מותאם אישית...",
      marketingLoadingProgress: 10
    });
    
    try {
      console.log('Starting enhanced content generation...');
      
      // Step 1: Generate marketing content (40% progress)
      set({ marketingLoadingMessage: "יוצרים פוסטים ותוכן לרשתות חברתיות...", marketingLoadingProgress: 40 });
      const marketingContent = await generateMarketingContent(formData);
      
      // Step 2: Generate marketing visuals (70% progress)
      set({ marketingLoadingMessage: "יוצרים תמונות שיווקיות...", marketingLoadingProgress: 70 });
      const marketingVisuals = await generateMarketingVisuals(formData);
      
      // Step 3: Generate enhanced strategy (95% progress)
      set({ marketingLoadingMessage: "יוצרים אסטרטגיית שיווק מתקדמת...", marketingLoadingProgress: 95 });
      const enhancedStrategy = await generateSalesStrategy(formData, outline);
      
      // Combine all data
      const enhancedOutline = {
        ...outline,
        marketingContent: marketingContent,
        marketingVisuals: marketingVisuals,
        enhancedStrategy: enhancedStrategy
      };
      
      set({ 
        outline: enhancedOutline,
        isGeneratingMarketing: false,
        marketingLoadingMessage: "",
        marketingLoadingProgress: 100,
        error: null
      });

      // Send data to webhook (non-blocking)
      if (userRegistration) {
        try {
          console.log('Sending data to webhook in background...');
          sendToZapierWebhook({
            presentationData: formData,
            userRegistration,
            outline: enhancedOutline
          }).catch(webhookError => {
            console.error("Webhook failed but continuing with main flow:", webhookError);
          });
        } catch (webhookError) {
          console.error("Failed to initiate webhook call, but continuing:", webhookError);
        }
      }
    } catch (error) {
      console.error("Failed to generate enhanced content:", error);
      
      let errorMessage = "אירעה שגיאה ביצירת התוכן המשופר. אנא נסה שנית.";
      
      if (error.message.includes('API key')) {
        errorMessage = "בעיה במפתח ה-API של OpenAI. אנא בדוק את ההגדרות.";
      } else if (error.message.includes('parse') || error.message.includes('JSON')) {
        errorMessage = "שגיאה בעיבוד תשובת הבינה המלאכותית. אנא נסה שנית.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "בעיית תקשורת. בדוק את החיבור לאינטרנט ונסה שנית.";
      }
      
      set({ 
        error: errorMessage, 
        isGeneratingMarketing: false,
        marketingLoadingMessage: "",
        marketingLoadingProgress: 0
      });
    }
  },

  generateDummyOutline: () => {
    const { formData } = get();
    
    // Ensure we don't lose formData when generating dummy outline
    const currentFormData = formData ? { ...formData } : null;
    
    const dummyChapters: Chapter[] = [
      {
        id: generateId(),
        title: "יסודות וידע בסיסי",
        points: [
          { id: generateId(), content: "מושגי יסוד בתחום ומשמעותם" },
          { id: generateId(), content: "הסברת חשיבות הנושא בתעשייה הנוכחית" },
          { id: generateId(), content: "טכניקות בסיסיות ויישומן בשטח" }
        ]
      },
      {
        id: generateId(),
        title: "אסטרטגיות מתקדמות",
        points: [
          { id: generateId(), content: "שיטות עבודה מוכחות להצלחה" },
          { id: generateId(), content: "אופטימיזציה של תהליכים קיימים" },
          { id: generateId(), content: "כלים וטכנולוגיות חדשניות" }
        ]
      },
      {
        id: generateId(),
        title: "יישום ותוצאות",
        points: [
          { id: generateId(), content: "מקרי מבחן מוצלחים והלקחים מהם" },
          { id: generateId(), content: "שילוב השיטות בעבודה היומיומית" },
          { id: generateId(), content: "מדידת הצלחה ואופטימיזציה מתמשכת" }
        ]
      },
      {
        id: generateId(),
        title: "סיכום והמלצות",
        points: [
          { id: generateId(), content: "סיכום הנקודות המרכזיות" },
          { id: generateId(), content: "המלצות ליישום מיידי" },
          { id: generateId(), content: "צעדים הבאים והמשך הלמידה" }
        ]
      }
    ];
    
    set({ 
      formData: currentFormData,
      chapters: dummyChapters,
      outline: {
        chapters: dummyChapters,
        openingStyles: [
          "סיפור אישי: שתף חוויה אישית שממחישה את הצורך בפתרון שאתה מציע",
          "שאלה רטורית: 'האם אי פעם תהיתם כיצד החברות המובילות בתחום מצליחות להשיג תוצאות כה מרשימות?'",
          "עובדה מפתיעה: הצג סטטיסטיקה מפתיעה שתעורר את תשומת לב הקהל מיד בהתחלה"
        ],
        timeDistribution: "פתיחה - 10%, פרק 1 - 25%, פרק 2 - 30%, פרק 3 - 25%, פרק 4 - 10%",
        interactiveActivities: [
          "סקר מהיר: שאל את הקהל שאלה רלוונטית והצג את התוצאות על המסך",
          "תרגיל בזוגות: הנחה את המשתתפים לדון עם השכן שלהם בנקודה ספציפית למשך 2 דקות",
          "סיעור מוחות קצר: בקש מהקהל להציע פתרונות אפשריים לבעיה שהצגת"
        ],
        presentationStructure: "שקף פתיחה, הצגה עצמית, מבנה ההרצאה, תוכן מרכזי (4 פרקים), הדגמה של המוצר/שירות, סיכום עם נקודות מפתח, קריאה לפעולה",
        discussionQuestions: {
          "חלק 1": [
            "כיצד הידע הבסיסי שהוצג משתלב במציאות היומיומית שלכם?",
            "אילו אתגרים אתם נתקלים בהם בהקשר זה?"
          ],
          "חלק 2": [
            "איזו מהאסטרטגיות שהוצגו נראית הכי ישימה עבורכם?",
            "מה לדעתכם החסמים העיקריים ליישום אסטרטגיות אלו?"
          ],
          "חלק 3": [
            "כיצד תוכלו למדוד את ההצלחה ביישום התהליכים שהוצגו?",
            "אילו משאבים דרושים לכם כדי להתחיל ביישום השיטות הללו?"
          ]
        },
        salesGuide: "פתח בהצגת האתגר, הדגם כיצד המוצר/שירות שלך פותר אותו, הצג עדויות והצלחות קודמות, הסבר את התהליך בפשטות, הדגש את הערך והתועלת, הצג אפשרויות שונות והצעה מיוחדת למשתתפי ההרצאה.",
        postPresentationPlan: "שליחת מייל תודה עם סיכום הנקודות המרכזיות והצעה לפגישת המשך, שליחת סקר משוב קצר לאיסוף תובנות, מעקב טלפוני אישי עם משתתפים מעוניינים, הצעת חבילת התנסות בשירות במחיר מיוחד",
        motivationalMessage: "כל הכבוד! יצרת מבנה הרצאה מקצועי ומותאם אישית. ההרצאה שלך בנויה על עקרונות מוכחים של הצגה יעילה ומכירה טבעית. עכשיו הגיע הזמן לסקור את התוכן ולוודא שהוא משקף בדיוק את החזון שלך."
      },
      error: null,
      isLoading: false,
      loadingMessage: "יוצרים את מבנה ההרצאה..."
    });
  }
}));
