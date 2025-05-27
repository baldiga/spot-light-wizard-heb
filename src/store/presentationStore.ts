import { create } from 'zustand';
import { PresentationFormData, PresentationOutline, Chapter, UserRegistrationData, SlideStructure, DynamicSalesStrategy } from '@/types/presentation';
import { generateId } from '@/utils/helpers';
import { 
  generatePresentationOutline, 
  generateDynamicSlideStructure, 
  generateDynamicB2BEmail, 
  generateDynamicSalesStrategy, 
  generatePresentationTools 
} from '@/services/openaiService';
import { sendToZapierWebhook } from '@/services/webhookService';

interface PresentationState {
  formData: PresentationFormData | null;
  userRegistration: UserRegistrationData | null;
  outline: PresentationOutline | null;
  chapters: Chapter[];
  presentationTools: any | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  setFormData: (data: PresentationFormData) => void;
  setUserRegistration: (data: UserRegistrationData) => void;
  setOutline: (outline: PresentationOutline) => void;
  setChapters: (chapters: Chapter[]) => void;
  setPresentationTools: (tools: any) => void;
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
  presentationTools: null,
  isLoading: false,
  loadingMessage: "יוצרים את מבנה ההרצאה...",
  error: null,
  
  setFormData: (data) => set({ formData: data }),
  setUserRegistration: (data) => set({ userRegistration: data }),
  setOutline: (outline) => set({ outline }),
  setChapters: (chapters) => set({ chapters }),
  setPresentationTools: (tools) => set({ presentationTools: tools }),
  
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
      loadingMessage: "אנחנו בונים את ההרצאה בהתאמה אישית מלאה על סמך נסיון ומחקר של אלפי הרצאות ממירות, זה יקח עוד כמה שניות..."
    });
    
    try {
      // Step 1: Generate basic outline
      set({ loadingMessage: "יוצרים את מבנה ההרצאה הבסיסי..." });
      const outlineData = await generatePresentationOutline(formData);
      
      // Step 2: Generate dynamic slide structure
      set({ loadingMessage: "בונים מבנה מפורט של השקפים..." });
      const dynamicSlides = await generateDynamicSlideStructure(formData, outlineData);
      
      // Step 3: Generate dynamic B2B email
      set({ loadingMessage: "כותבים מייל פנייה מותאם אישית..." });
      const dynamicB2BEmail = await generateDynamicB2BEmail(formData, outlineData);
      
      // Step 4: Generate dynamic sales strategy
      set({ loadingMessage: "מכינים אסטרטגיית שיווק מותאמת..." });
      const dynamicSalesStrategy = await generateDynamicSalesStrategy(formData, outlineData);
      
      // Step 5: Generate presentation tools
      set({ loadingMessage: "יוצרים כלים מעשיים להצגה..." });
      const presentationTools = await generatePresentationTools(formData, outlineData);
      
      // Combine all generated content
      const completeOutline: PresentationOutline = {
        ...outlineData,
        dynamicSlides,
        dynamicB2BEmail,
        dynamicSalesStrategy
      };
      
      set({ 
        outline: completeOutline,
        chapters: outlineData.chapters,
        presentationTools,
        isLoading: false,
        loadingMessage: "יוצרים את מבנה ההרצאה..."
      });

      // Send data to Zapier webhook after successful outline generation
      if (userRegistration) {
        try {
          await sendToZapierWebhook({
            presentationData: formData,
            userRegistration,
            outline: completeOutline
          });
        } catch (webhookError) {
          console.error("Failed to send data to webhook:", webhookError);
        }
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
      set({ 
        error: "אירעה שגיאה ביצירת מבנה ההרצאה. נסה שנית.", 
        isLoading: false,
        loadingMessage: "יוצרים את מבנה ההרצאה..."
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

    const dummySalesProcess = [
      {
        id: generateId(),
        title: "יצירת קשר וחיבור",
        description: "פתיחה חמה שיוצרת חיבור מיידי עם הקהל ומעוררת עניין בנושא",
        order: 1
      },
      {
        id: generateId(),
        title: "זיהוי הבעיה",
        description: "הצגת האתגר או הבעיה שהקהל מתמודד איתה בצורה שמעוררת זיהוי",
        order: 2
      },
      {
        id: generateId(),
        title: "הגברת הכאב",
        description: "הדגשת המחיר של אי פתירת הבעיה והשלכותיה על העתיד",
        order: 3
      },
      {
        id: generateId(),
        title: "הצגת החזון",
        description: "ציור תמונה של העתיד הרצוי לאחר פתרון הבעיה",
        order: 4
      },
      {
        id: generateId(),
        title: "הוכחת יכולת",
        description: "הצגת הידע, הניסיון והכלים שמוכיחים את היכולת לעזור",
        order: 5
      },
      {
        id: generateId(),
        title: "התמודדות עם התנגדויות",
        description: "מענה טבעי ומוקדם לחששות ולהתנגדויות הנפוצות של הקהל",
        order: 6
      },
      {
        id: generateId(),
        title: "הצגת הפתרון",
        description: "חשיפת המוצר או השירות כתשובה המושלמת לבעיה שהוצגה",
        order: 7
      },
      {
        id: generateId(),
        title: "הוכחה חברתית",
        description: "הצגת עדויות, מקרי הצלחה ולקוחות מרוצים לבניית אמינות",
        order: 8
      },
      {
        id: generateId(),
        title: "יצירת דחיפות",
        description: "הסבר מדוע חשוב לפעול עכשיו ולא לדחות את ההחלטה",
        order: 9
      },
      {
        id: generateId(),
        title: "קריאה לפעולה",
        description: "הנחיה ברורה ומפורטת על השלבים הבאים לעבודה משותפת",
        order: 10
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
