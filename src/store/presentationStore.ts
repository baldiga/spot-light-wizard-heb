
import { create } from 'zustand';
import { PresentationFormData, PresentationOutline, Chapter, UserRegistrationData } from '@/types/presentation';
import { generateId } from '@/utils/helpers';
import { generatePresentationOutline } from '@/services/presentationService';
import { sendToZapierWebhook } from '@/services/webhookService';

interface PresentationState {
  formData: PresentationFormData | null;
  userRegistration: UserRegistrationData | null;
  outline: PresentationOutline | null;
  chapters: Chapter[];
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  setFormData: (data: PresentationFormData) => void;
  setUserRegistration: (data: UserRegistrationData) => void;
  setOutline: (outline: PresentationOutline) => void;
  setChapters: (chapters: Chapter[]) => void;
  updateChapter: (chapterId: string, title: string) => void;
  updatePoint: (chapterId: string, pointId: string, content: string) => void;
  generateOutlineFromAPI: () => Promise<void>;
  generateDummyOutline: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  formData: null,
  userRegistration: null,
  outline: null,
  chapters: [],
  isLoading: false,
  loadingMessage: "יוצרים את מבנה ההרצאה...",
  error: null,
  
  setFormData: (data) => set({ formData: data }),
  setUserRegistration: (data) => set({ userRegistration: data }),
  setOutline: (outline) => set({ outline }),
  setChapters: (chapters) => set({ chapters }),
  
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
      set({ error: "אין מידע זמין ליצירת מבנה הרצאה" });
      return;
    }
    
    set({ 
      isLoading: true, 
      error: null,
      loadingMessage: "מתחברים לשירות הבינה המלאכותית ויוצרים תוכן מותאם אישית..."
    });
    
    try {
      console.log('Starting outline generation for topic:', formData.idea);
      console.log('Speaker background:', formData.speakerBackground);
      console.log('Audience profile:', formData.audienceProfile);
      
      // Generate outline using the secure Edge Function
      const outlineData = await generatePresentationOutline(formData);
      
      console.log('Outline generated successfully with', outlineData.chapters.length, 'chapters');
      console.log('Sales process steps:', outlineData.salesProcess?.length);
      
      // Validate 10 sales process steps
      if (outlineData.salesProcess && outlineData.salesProcess.length !== 10) {
        console.warn(`Expected 10 sales process steps, got ${outlineData.salesProcess.length}`);
      }
      
      // Validate that we got real content, not dummy content
      const hasPersonalizedContent = outlineData.chapters.some(chapter => 
        chapter.title.includes(formData.idea) || 
        chapter.points.some(point => 
          point.content.includes(formData.speakerBackground) ||
          point.content.includes(formData.audienceProfile)
        )
      );

      if (!hasPersonalizedContent) {
        console.warn('Generated content may not be properly personalized');
      }
      
      set({ 
        outline: outlineData,
        chapters: outlineData.chapters,
        isLoading: false,
        loadingMessage: "יוצרים את מבנה ההרצאה..."
      });

      // Send data to Zapier webhook after successful outline generation
      if (userRegistration) {
        try {
          await sendToZapierWebhook({
            presentationData: formData,
            userRegistration,
            outline: outlineData
          });
        } catch (webhookError) {
          console.error("Failed to send data to webhook:", webhookError);
        }
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
      
      // Provide more specific error messages based on error type
      let errorMessage = "אירעה שגיאה ביצירת מבנה הרצאה.";
      
      if (error.message.includes('API key')) {
        errorMessage = "בעיה במפתח ה-API של OpenAI. אנא בדוק את ההגדרות.";
      } else if (error.message.includes('parse') || error.message.includes('JSON')) {
        errorMessage = "שגיאה בעיבוד תשובת הבינה המלאכותית. אנא נסה שנית.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "בעיית תקשורת. בדוק את החיבור לאינטרנט ונסה שנית.";
      } else if (error.message.includes('Invalid response')) {
        errorMessage = "התקבלה תשובה לא תקינה מהשירות. אנא נסה שנית.";
      } else if (error.message.includes('Failed to generate outline')) {
        errorMessage = "השירות לא הצליח ליצור מבנה הרצאה. אנא נסה שנית או צור קשר עם התמיכה.";
      }
      
      set({ 
        error: errorMessage, 
        isLoading: false,
        loadingMessage: "יוצרים את מבנה ההרצאה..."
      });
    }
  },

  generateDummyOutline: () => {
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
      }
    ];

    const dummySalesProcess = Array.from({ length: 10 }, (_, index) => ({
      id: generateId(),
      title: `שלב מכירה ${index + 1}`,
      description: `תיאור מפורט לשלב מכירה מספר ${index + 1}`,
      order: index + 1
    }));
    
    set({ 
      chapters: dummyChapters,
      outline: {
        chapters: dummyChapters,
        openingStyles: [
          "סיפור אישי: שתף חוויה אישית שממחישה את הצורך בפתרון שאתה מציע",
          "שאלה רטורית: 'האם אי פעם תהיתם כיצד החברות המובילות בתחום מצליחות להשיג תוצאות כה מרשימות?'",
          "עובדה מפתיעה: הצג סטטיסטיקה מפתיעה שתעורר את תשומת לב הקהל מיד בהתחלה"
        ],
        timeDistribution: "פתיחה - 10%, פרק 1 - 25%, פרק 2 - 35%, פרק 3 - 20%, סיכום וקריאה לפעולה - 10%",
        interactiveActivities: [
          "סקר מהיר: שאל את הקהל שאלה רלוונטית והצג את התוצאות על המסך",
          "תרגיל בזוגות: הנחה את המשתתפים לדון עם השכן שלהם בנקודה ספציפית למשך 2 דקות",
          "סיעור מוחות קצר: בקש מהקהל להציע פתרונות אפשריים לבעיה שהצגת"
        ],
        presentationStructure: "שקף פתיחה, הצגה עצמית, מבנה ההרצאה, תוכן מרכזי (3 פרקים), הדגמה של המוצר/שירות, סיכום עם נקודות מפתח, קריאה לפעולה",
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
