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
  setFormData: (data: PresentationFormData) => void;
  setUserRegistration: (data: UserRegistrationData) => void;
  setOutline: (outline: PresentationOutline) => void;
  setChapters: (chapters: Chapter[]) => void;
  updateChapter: (chapterId: string, title: string) => void;
  updatePoint: (chapterId: string, pointId: string, content: string) => void;
  generateOutlineFromAPI: () => Promise<void>;
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

  generateOutlineFromAPI: async () => {
    const { formData, userRegistration } = get();
    
    if (!formData) {
      console.error('No form data available for outline generation');
      set({ error: "אין מידע זמין ליצירת מבנה הרצאה" });
      return;
    }
    
    const currentFormData = { ...formData };
    
    set({ 
      isLoading: true, 
      error: null,
      loadingMessage: "מתחברים לשירות הבינה המלאכותית ויוצרים תוכן מותאם אישית...",
      loadingProgress: 10
    });
    
    try {
      console.log('Starting outline generation for topic:', currentFormData.idea);
      
      // Step 1: Generate outline (30% progress)
      set({ loadingMessage: "יוצרים מבנה הרצאה מקצועי...", loadingProgress: 30 });
      const outlineData = await generatePresentationOutline(currentFormData);
      
      // Step 2: Generate marketing content (60% progress)
      set({ loadingMessage: "יוצרים תוכן שיווקי מותאם אישית...", loadingProgress: 60 });
      const marketingContent = await generateMarketingContent(currentFormData);
      
      // Step 3: Generate marketing visuals (80% progress)
      set({ loadingMessage: "יוצרים תמונות שיווקיות...", loadingProgress: 80 });
      const marketingVisuals = await generateMarketingVisuals(currentFormData);
      
      // Step 4: Generate enhanced strategy (95% progress)
      set({ loadingMessage: "יוצרים אסטרטגיית שיווק מתקדמת...", loadingProgress: 95 });
      const enhancedStrategy = await generateSalesStrategy(currentFormData, outlineData);
      
      // Combine all data
      const enhancedOutline = {
        ...outlineData,
        marketingContent: marketingContent,
        marketingVisuals: marketingVisuals,
        enhancedStrategy: enhancedStrategy
      };
      
      set({ 
        formData: currentFormData,
        outline: enhancedOutline,
        chapters: outlineData.chapters,
        isLoading: false,
        loadingMessage: "יוצרים את מבנה ההרצאה...",
        loadingProgress: 100,
        error: null
      });

      // Send data to webhook (non-blocking)
      if (userRegistration) {
        try {
          console.log('Sending data to webhook in background...');
          sendToZapierWebhook({
            presentationData: currentFormData,
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
      console.error("Failed to generate content:", error);
      
      let errorMessage = "אירעה שגיאה ביצירת התוכן. אנא נסה שנית.";
      
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

    const dummySalesProcess = Array.from({ length: 10 }, (_, index) => ({
      id: generateId(),
      title: `שלב מכירה ${index + 1}`,
      description: `תיאור מפורט לשלב מכירה מספר ${index + 1}`,
      order: index + 1
    }));
    
    set({ 
      formData: currentFormData, // Preserve formData
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
        motivationalMessage: "כל הכבוד! יצרת מבנה הרצאה מקצועי ומותאם אישית. ההרצאה שלך בנויה על עקרונות מוכחים של הצגה יעילה ומכירה טבעית. עכשיו הגיע הזמן לסקור את התוכן ולוודא שהוא משקף בדיוק את החזון שלך.",
        salesProcess: dummySalesProcess
      },
      error: null,
      isLoading: false,
      loadingMessage: "יוצרים את מבנה ההרצאה..."
    });
  }
}));
