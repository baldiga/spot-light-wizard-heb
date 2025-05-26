import { create } from 'zustand';
import { PresentationFormData, PresentationOutline, Chapter, UserRegistrationData } from '@/types/presentation';
import { generateId } from '@/utils/helpers';
import { generatePresentationOutline } from '@/services/openaiService';
import { sendToZapierWebhook } from '@/services/webhookService';

interface PresentationState {
  formData: PresentationFormData | null;
  userRegistration: UserRegistrationData | null;
  outline: PresentationOutline | null;
  chapters: Chapter[];
  isLoading: boolean;
  error: string | null;
  setFormData: (data: PresentationFormData) => void;
  setUserRegistration: (data: UserRegistrationData) => void;
  setOutline: (outline: PresentationOutline) => void;
  setChapters: (chapters: Chapter[]) => void;
  updateChapter: (chapterId: string, title: string) => void;
  updatePoint: (chapterId: string, pointId: string, content: string) => void;
  generateOutlineFromAPI: () => Promise<void>;
  generateDummyOutline: () => void; // Keeping for fallback
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  formData: null,
  userRegistration: null,
  outline: null,
  chapters: [],
  isLoading: false,
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
    
    set({ isLoading: true, error: null });
    
    try {
      const outlineData = await generatePresentationOutline(formData);
      
      set({ 
        outline: outlineData,
        chapters: outlineData.chapters,
        isLoading: false 
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
          // Don't fail the whole process if webhook fails
        }
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
      set({ 
        error: "אירעה שגיאה ביצירת מבנה ההרצאה. נסה שנית.", 
        isLoading: false 
      });
      
      // Fallback to dummy outline if API fails
      get().generateDummyOutline();
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
        postPresentationPlan: "שליחת מייל תודה עם סיכום הנקודות המרכזיות והצעה לפגישת המשך, שליחת סקר משוב קצר לאיסוף תובנות, מעקב טלפוני אישי עם משתתפים מעוניינים, הצעת חבילת התנסות בשירות במחיר מיוחד"
      },
      error: null
    });
  }
}));
