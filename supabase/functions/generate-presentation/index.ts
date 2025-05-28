
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PresentationFormData {
  idea: string;
  speakerBackground: string;
  audienceProfile: string;
  duration: string;
  commonObjections: string;
  serviceOrProduct: string;
  callToAction: string;
}

interface GenerationRequest {
  type: 'outline' | 'slides' | 'email' | 'strategy' | 'tools';
  formData: PresentationFormData;
  outline?: any;
}

function sanitizeText(text: string): string {
  return text
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function cleanAndParseJSON(response: string): any {
  try {
    console.log('Raw AI response length:', response.length);
    
    // Remove markdown formatting
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON boundaries
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    
    // Clean up JSON
    cleanResponse = cleanResponse
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
      .replace(/:\s*'([^']*)'/g, ': "$1"')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\r/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanResponse);
    console.log('Successfully parsed JSON');
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

async function generateOutlineContent(formData: PresentationFormData): Promise<any> {
  const prompt = `
אתה אדריכל הרצאות מומחה המתמחה בפסיכולוגיה של שכנוע וניהול תודעה. המשימה שלך היא ליצור אדריכלות הרצאה מתקדמת המבוססת על עקרונות נוירופסיכולוגיים, מחקר התנהגותי, ועקרונות מכירות משולבים.

=== ניתוח פרמטרי הקלט ===
נושא מרכזי: "${sanitizeText(formData.idea)}"
רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
פרופיל קהל: "${sanitizeText(formData.audienceProfile)}"
משך הרצאה: ${formData.duration} דקות
התנגדויות צפויות: "${sanitizeText(formData.commonObjections)}"
מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"
קריאה לפעולה: "${sanitizeText(formData.callToAction)}"

=== מסגרת עבודה מתקדמת ===

**מודול ניתוח פסיכו-דמוגרפי:**
- מיפוי כאבים רגשיים עמוקים מעבר לבעיות טכניות
- ניתוח דפוסי התנגדות פסיכולוגיים
- זיהוי טריגרים של קבלת החלטות
- תכנון מסלול רגשי אסטרטגי
- הבנת היררכיית ערכים אמיתית

**אדריכלות סמכותיות מרצה:**
- בניית סמכות בלתי מעורערת מהרקע המקצועי
- יצירת נקודות חיבור רגשי עמוק
- תכנון סיפורי הוכחה חזקים
- ניהול רגעי פגיעות לבניית אמון
- הדרגת אמינות מתמדת

**פסיכולוגיית הצגה מדעית:**
- ניהול עומס קוגניטיבי אופטימלי
- יצירת עוגני זיכרון בלתי נמחקים
- בניית רצף שכנוע מדעי
- תכנון מעברים רגשיים אסטרטגיים
- מיקום נקודות התעוררות מחושבות

**מכירות משולבת טבעית:**
- בניית סולם ערכים הדרגתי
- טיפול יזום בהתנגדויות
- מיקום הוכחה חברתית אסטרטגי
- יצירת דחיפות טבעית אמיתית
- מעברים חלקים מתוכן למכירה

**מדע המעורבות:**
- טריגרים נוירולוגיים מוכחים
- אופטימיזציה של אינטראקציות
- ניהול אנרגיה מתמשך
- טכניקות שינוי מצב מוח
- מקסום שמירת מידע

צור מבנה הרצאה עם 4 פרקים ו-10 שלבי מכירה משולבים:

החזר JSON במבנה:
{
  "chapters": [
    {
      "title": "כותרת מבוססת פסיכולוגיה ומותאמת לכאב העמוק",
      "psychologyGoal": "מטרה פסיכולוגית מדויקת",
      "emotionalJourney": "המסלול הרגשי המתוכנן",
      "points": [
        {
          "content": "תוכן מבוסס מחקר התנהגותי ונוגע לכאב אמיתי",
          "engagementTechnique": "טכניקה מעורבות מדעית",
          "psychologyPrinciple": "עיקרון פסיכולוגי שפועל",
          "salesConnection": "חיבור טבעי למוצר/שירות"
        }
      ],
      "objectionResolution": "פתרון התנגדות ספציפית",
      "transitionStrategy": "אסטרטגיית מעבר רגשי"
    }
  ],
  "openingStyles": [
    "פתיחה פסיכולוגית שיוצרת התעוררות ודחיפות מיידית",
    "פתיחה מבוססת כאב עמוק וחיבור רגשי",
    "פתיחה מבססת סמכות ואמון מיידי"
  ],
  "timeDistribution": "חלוקה אסטרטגית מבוססת עקומת קשב",
  "interactiveActivities": [
    "פעילות נוירופסיכולוגית למעורבות עמוקה",
    "אינטראקציה למיפוי כאבים אישיים"
  ],
  "presentationStructure": "מבנה מדעי למוטיבציה ושינוי התנהגות",
  "discussionQuestions": {
    "פרק 1": ["שאלות שחושפות כאבים עמוקים ויוצרות חיבור"],
    "פרק 2": ["שאלות שמעמיקות הבנה ובונות אמון"]
  },
  "salesGuide": "מדריך מכירות פסיכולוגי מבוסס דפוסי קנייה",
  "postPresentationPlan": "תוכנית מעקב מבוססת עקרונות שכנוע",
  "motivationalMessage": "הודעה מעצימה לחיזוק ביטחון המרצה",
  "salesProcess": [
    {
      "title": "שלב מבוסס טריגר פסיכולוגי מדויק",
      "description": "תיאור מבוסס מחקר התנהגותי",
      "psychologyPrinciple": "עיקרון פסיכולוגי פעיל",
      "naturalImplementation": "יישום טבעי ולא פולשני",
      "order": 1
    }
  ],
  "advancedEngagement": {
    "attentionManagement": "ניהול קשב מדעי",
    "energyOptimization": "אופטימיזציה אנרגטית",
    "interactionDesign": "עיצוב אינטראקציות אסטרטגי",
    "memoryArchitecture": "ארכיטקטורת זיכרון"
  },
  "persuasionFramework": {
    "scientificSequence": "רצף שכנוע מדעי",
    "resistanceNeutralization": "נטרול התנגדויות",
    "trustConstruction": "בניית אמון מדרגתי",
    "actionActivation": "הפעלת טריגרי פעולה"
  }
}

הוראות קריטיות:
- בדיוק 4 פרקים ו-10 שלבי מכירה
- כל אלמנט מבוסס מחקר פסיכולוגי
- זרימה רגשית ולוגית מושלמת
- מכירות משולבות טבעית
- טיפול יזום בהתנגדויות
- התאמה מלאה לקהל הספציפי
  `;

  return await callOpenAI(prompt);
}

async function generateSlidesContent(formData: PresentationFormData, outline: any): Promise<any> {
  const prompt = `
אתה מומחה ליצירת מצגות מקצועיות ומעוררות עניין. צור מבנה שקפים מפורט עם אלמנטי מעורבות אינטראקטיביים.

פרטי ההרצאה:
- נושא: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"
- משך: ${formData.duration} דקות
- מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"
- קריאה לפעולה: "${sanitizeText(formData.callToAction)}"

מבנה ההרצאה:
${JSON.stringify(outline.chapters, null, 2)}

צור מבנה שקפים מקיף עם 15-20 שקפים הכולל אלמנטי מעורבות חדשניים:

{
  "slides": [
    {
      "number": 1,
      "section": "פתיחה",
      "headline": "כותרת מושכת עבור ${formData.idea} - ${formData.speakerBackground}",
      "content": "תוכן פתיחה חזק שמתחבר ל${formData.audienceProfile} ומציג את הערך של ${formData.idea}. כולל סטטיסטיקה מרשימה, שאלה רטורית או סיפור אישי.",
      "visual": "רקע מרשים עם גרפיקה דינמית הקשורה ל${formData.idea}. תמונה מרכזית או אייקון המייצג את הנושא. שימוש בצבעים חמים ומזמינים.",
      "notes": "התחל בביטחון, קיים קשר עין עם הקהל. השתמש בשפת גוף פתוחה. הזכר את הרקע שלך ב${formData.speakerBackground} כדי לבסס אמינות מיידית.",
      "timeAllocation": "3 דקות",
      "engagementTip": "בקש מהקהל להרים יד אם יש להם חוויה עם ${formData.idea}. ספור את המרימים יד וקשר זאת לסטטיסטיקה שתציג.",
      "transitionPhrase": "עכשיו שהכרנו את השטח, בואו נצלול לעומק הנושא ונבין מדוע ${formData.idea} הוא כל כך קריטי עבור ${formData.audienceProfile}",
      "interactionElement": "סקר מהיר: בקש מהקהל להרים יד או להשתמש באפליקציה לסקרים לענות על שאלה פתיחה",
      "audienceAction": "המשתתפים מגיבים פיזית או דיגיטלית לשאלת הפתיחה"
    },
    {
      "number": 2,
      "section": "הצגת הבעיה",
      "headline": "האתגר הגדול: מה מונע מ${formData.audienceProfile} להצליח ב${formData.idea}",
      "content": "הצגה מפורטת של הבעיות והאתגרים הספציפיים שמתמודד איתם ${formData.audienceProfile} בתחום ${formData.idea}. כולל נתונים מדאיגים, מחקרים אמיתיים ועדויות מהשטח.",
      "visual": "אינפוגרפיקה המציגה את הבעיות בצורה ויזואלית ברורה. גרפים המראים מגמות שליליות או סטטיסטיקות מדאיגות. איורים שמייצגים כאב וקושי.",
      "notes": "דבר בטון רציני אבל מעודד. הדגש שאתה מבין את הכאב שלהם. השתמש בדוגמאות קונקרטיות מהתחום ${formData.speakerBackground}.",
      "timeAllocation": "4 דקות",
      "engagementTip": "בקש מהקהל לכתוב על פתק את האתגר הגדול ביותר שלהם ב${formData.idea}. אסוף חלק מהפתקים ותקרא כמה בקול.",
      "transitionPhrase": "זה נשמע מדאיג, נכון? אבל הבשורה הטובה היא שיש פתרון מוכח שכבר עזר לאלפי ${formData.audienceProfile} אחרים",
      "interactionElement": "פעילות כתיבה אישית ושיתוף קבוצתי של אתגרים",
      "audienceAction": "כתיבת אתגרים אישיים ושיתוף עם הקבוצה"
    }
  ]
}

הוראות מיוחדות:
1. כל שקף חייב להכיל אלמנט מעורבות ספציפי (interactionElement)
2. כל שקף חייב להגדיר פעולה ברורה לקהל (audienceAction)
3. משפטי מעבר חייבים להיות טבעיים וחלקים
4. התוכן חייב להיות ספציפי ל${formData.idea} ול${formData.audienceProfile}
5. כל הערות המרצה חייבות להיות מעשיות ובנות ביצוע
6. התזמון חייב להתאים למשך ההרצאה ${formData.duration} דקות
7. צור לפחות 15-18 שקפים מפורטים המכסים את כל ההרצאה

החזר אך ורק JSON תקין עם מערך slides מלא.
`;

  return await callOpenAI(prompt);
}

async function generateEmailContent(formData: PresentationFormData, outline: any): Promise<any> {
  const prompt = `
אתה מומחה שיווק B2B ויצירת תוכן מקצועי. צור דוא"ל מכירות מתקדם ומותאם אישית.

פרטי ההרצאה:
- נושא: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"
- מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"
- קריאה לפעולה: "${sanitizeText(formData.callToAction)}"
- התנגדויות נפוצות: "${sanitizeText(formData.commonObjections)}"

צור דוא"ל B2B מקצועי ומותאם בפורמט JSON:

{
  "emailContent": "נושא: [נושא מושך ומותאם לקהל ${formData.audienceProfile}]

שלום [שם],

פתיחה אישית:
[פתיחה חמה ואישית שמתחברת לצרכים הספציפיים של ${formData.audienceProfile}]

זיהוי הבעיה:
[הצגה מדויקת של הבעיות שמתמודד איתן ${formData.audienceProfile} בתחום ${formData.idea}]

הצגת הפתרון:
[הסבר כיצד ההרצאה שלי על ${formData.idea} פותרת בדיוק את הבעיות שהוצגו]

הוכחה חברתית:
[עדויות ותוצאות ממשיות מההרצאות הקודמות שלי כ${formData.speakerBackground}]

טיפול בהתנגדויות:
[מענה ישיר לחששות: ${formData.commonObjections}]

יתרון ייחודי:
[הדגשת הרקע הייחודי שלי ב${formData.speakerBackground} והערך שאני מביא]

קריאה לפעולה:
[${formData.callToAction} - בצורה ברורה ומעוררת פעולה]

סגירה מקצועית:
[סגירה חמה עם פרטי קשר מלאים]

בכבוד רב,
[שם המרצה]
[תפקיד קשור ל${formData.speakerBackground}]
[פרטי קשר]

---

P.S. [הודעה נוספת שמחזקת את הערך או יוצרת דחיפות]"
}

הוראות חשובות:
1. הדוא"ל חייב להיות ספציפי לנושא ${formData.idea}
2. השתמש בשפה מקצועית אך חמה ונגישה
3. התייחס ישירות לצרכים של ${formData.audienceProfile}
4. כלול הוכחה חברתית ממשית מהתחום ${formData.speakerBackground}
5. טפל באופן ישיר בהתנגדויות: ${formData.commonObjections}
6. הקריאה לפעולה חייבת להיות ברורה ומעוררת פעולה
7. אורך הדוא"ל: 300-500 מילים
8. כלול נושא מושך שיגרום לפתיחת הדוא"ל

החזר JSON תקין עם emailContent המכיל את הדוא"ל המלא.
`;

  const result = await callOpenAI(prompt);
  return result.emailContent || result;
}

async function generateStrategyContent(formData: PresentationFormData, outline: any): Promise<any> {
  const prompt = `
אתה יועץ שיווק ומכירות מומחה עם התמחות בבניית אסטרטגיות מכירות מקיפות. צור אסטרטגיית שיווק ומכירות מתקדמת.

פרטי ההרצאה:
- נושא: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"
- מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"
- משך ההרצאה: ${formData.duration} דקות
- קריאה לפעולה: "${sanitizeText(formData.callToAction)}"

צור אסטרטגיה מקיפה ומפורטת:

{
  "targetAudiences": [
    "קהל יעד ראשי: ${formData.audienceProfile} בעלי עניין מרבי ב${formData.idea}",
    "קהל יעד משני: ${formData.audienceProfile} מתחילים בתחום ${formData.idea}",
    "קהל יעד שלישי: מקבלי החלטות ב${formData.audienceProfile} המעוניינים ב${formData.serviceOrProduct}",
    "קהל יעד רביעי: ${formData.audienceProfile} המתמודדים עם אתגרים ספציפיים"
  ],
  "marketingChannels": [
    {
      "channel": "לינקדאין B2B",
      "strategy": "יצירת תוכן מקצועי על ${formData.idea} המותאם ל${formData.audienceProfile}, פרסום מאמרים מקצועיים המבוססים על הרקע ב${formData.speakerBackground}, יצירת קשרים עם מקבלי החלטות",
      "timeline": "4-6 שבועות לפני ההרצאה: התחלת בניית נוכחות. 2 שבועות לפני: פרסום מאמר מקצועי. שבוע לפני: טיזרים והזמנות אישיות",
      "budget": "500-1000₪ לחודש לפרסום מקודד + זמן יצירת תוכן"
    },
    {
      "channel": "אימייל מרקטינג",
      "strategy": "רשימת מיילים מקוטלגת של ${formData.audienceProfile}, סדרת אימיילים מותאמת אישית, תוכן ערך מוקדם, הזמנות VIP",
      "timeline": "6 שבועות לפני: בניית רשימה. 4 שבועות לפני: תחילת סדרת הערך. 2 שבועות לפני: הזמנות רשמיות",
      "budget": "200-400₪ לחודש לכלי אימייל מרקטינג + עיצוב"
    },
    {
      "channel": "שיתופי פעולה אסטרטגיים",
      "strategy": "זיהוי ארגונים ומומחים בתחום ${formData.idea}, יצירת שיתופי פעולה הדדיים, הרצאות משותפות, המלצות צולבות",
      "timeline": "8 שבועות לפני: זיהוי שותפים פוטנציאליים. 6 שבועות לפני: יצירת קשר וגיבוש שיתופי פעולה",
      "budget": "עלות זמן בעיקר + עלויות רשת והכנסת אירועים"
    },
    {
      "channel": "תוכן וידאו באינסטגרם וטיקטוק",
      "strategy": "סרטונים קצרים עם טיפים מקצועיים על ${formData.idea}, הדגמות מהירות, מאחורי הקלעים של ההכנות להרצאה",
      "timeline": "מתמשך: 2-3 פוסטים בשבוע. עלייה בתדירות 2 שבועות לפני האירוע",
      "budget": "300-600₪ לחודש לעריכה ופרסום + זמן יצירה"
    }
  ],
  "pricingStrategy": {
    "basicTicket": "כרטיס רגיל: 150₪ - כולל השתתפות בהרצאה, חומרי סיכום דיגיטליים, גישה לקהילה המקצועית למשך חודש",
    "vipTicket": "כרטיס VIP: 350₪ - כולל מקומות ישיבה מועדפים, חבילת חומרים מודפסים, זמן שאלות אישיות אחרי ההרצאה, הנחה 20% על ${formData.serviceOrProduct}",
    "premiumTicket": "כרטיס פרימיום: 750₪ - כולל כל היתרונות של VIP + ייעוץ אישי של 30 דקות בטלפון, חבילת כלים מקצועיים, גישה מלאה לקורס המקוון המלווה",
    "corporatePackage": "חבילה ארגונית: 2,500₪ ל-10 משתתפים - כולל הנחה מיוחדת, חומרים מותאמים לארגון, אפשרות הרצאה פנימית נוספת, ייעוץ ארגוני של שעתיים"
  },
  "collaborationOpportunities": [
    "שיתוף פעולה עם איגודים מקצועיים בתחום ${formData.idea}",
    "שותפויות עם חברות טכנולוגיה המשרתות את ${formData.audienceProfile}",
    "שיתופי פעולה עם מומחים נוספים בתחום ${formData.speakerBackground}",
    "שותפויות עם מוסדות הכשרה וקורסים מקצועיים",
    "שיתוף פעולה עם פלטפורמות למידה דיגיטלית"
  ],
  "contentMarketing": [
    "סדרת מאמרים מקצועיים: '5 שגיאות נפוצות ב${formData.idea} שעולות ל${formData.audienceProfile} ביוקר'",
    "וובינר מקדים: 'מבוא ל${formData.idea} - מה שכל ${formData.audienceProfile} חייב לדעת'",
    "פודקאסט עם מומחים: 'שיחות על ${formData.idea} עם ${formData.speakerBackground}'",
    "אינפוגרפיקות: 'המדריך המלא ל${formData.idea} עבור ${formData.audienceProfile}'",
    "סדרת טיפים בוידאו: 'דקה של ${formData.idea} - טיפים מהירים לכל יום'",
    "חומרי הורדה: 'צ'קליסט ${formData.idea} - כלי עזר מעשי ל${formData.audienceProfile}'"
  ],
  "followUpStrategy": "אסטרטגיית מעקב מקיפה: שליחת אימייל תודה תוך 24 שעות עם סיכום נקודות המפתח ומשאבים נוספים. יצירת קשר טלפוני תוך 48-72 שעות עם משתתפים שהביעו עניין במוצר/שירות. הפעלת רצף אימיילים אוטומטי בן 5 הודעות במשך 3 שבועות עם תוכן ערך נוסף. הצעה מיוחדת למשתתפי ההרצאה בתוקף למשך 30 יום. הזמנה לקהילה מקצועית סגורה עם תוכן בלעדי. מעקב רבעוני עם עדכונים בתחום ואירועים חדשים. יצירת תוכנית נאמנות ללקוחות חוזרים.",
  "conversionOptimization": {
    "landingPageElements": "עמוד נחיתה מותאם עם וידאו פתיחה, עדויות לקוחות, שאלות נפוצות, טופס הרשמה פשוט",
    "socialProof": "הצגת לוגואים של חברות שעבדת איתן, ציטוטים של לקוחות, סטטיסטיקות הצלחה",
    "urgencyTactics": "מקומות מוגבלים, הנחה מוקדמת, בונוסים לנרשמים הראשונים",
    "retargetingStrategy": "פרסום מחודש למבקרים שלא השלימו הרשמה, הצעות מיוחדות בפייסבוק ולינקדאין"
  },
  "roiProjections": {
    "expectedAttendees": "50-80 משתתפים בהרצאה הראשונה",
    "conversionRate": "15-25% מהמשתתפים יפנו לקבלת מידע נוסף על ${formData.serviceOrProduct}",
    "averageCustomerValue": "מתבסס על מחיר ${formData.serviceOrProduct} וערך לקוח לכל החיים",
    "marketingROI": "צפי להחזר השקעה של 300-500% במעגל השיווק הראשון"
  }
}

הוראות חשובות:
1. כל האסטרטגיה חייבת להיות ספציפית לנושא ${formData.idea}
2. התאם את הערוצים והטקטיקות לקהל ${formData.audienceProfile}
3. הדגש את הרקע הייחודי ${formData.speakerBackground}
4. כלול מחירים ריאליים בשוק הישראלי
5. ההצעות חייבות להיות בנות ביצוע ומעשיות
6. התייחס לקריאה לפעולה ${formData.callToAction}
7. כלול מדדי הצלחה ומעקב

החזר JSON תקין עם האסטרטגיה המקיפה.
`;

  return await callOpenAI(prompt);
}

async function generateToolsContent(formData: PresentationFormData, outline: any): Promise<any> {
  const prompt = `
אתה מומחה הדרכות ופיתוח כלים למרצים מקצועיים. צור ארגז כלים מקיף ומפורט למרצה.

פרטי ההרצאה:
- נושא: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"
- משך: ${formData.duration} דקות
- קריאה לפעולה: "${sanitizeText(formData.callToAction)}"

צור ארגז כלים מקיף ומתקדם:

{
  "openingSuggestions": [
    {
      "type": "פתיחה בסיפור אישי מההרצאה של ${formData.speakerBackground}",
      "script": "לפני 3 שנים, כש[תאר מצב קונקרטי קשור ל${formData.idea}], הבנתי שיש פער עצום בין מה שאנחנו יודעים על ${formData.idea} למה שאנחנו באמת יודעים ליישם. היום אני רוצה לחלוק איתכם את הלקחים החשובים ביותר שלמדתי כ${formData.speakerBackground}, ובעיקר - איך אתם כ${formData.audienceProfile} יכולים להפוך את הידע הזה לתוצאות מדידות.",
      "tips": "דבר בקצב איטי וברור. קיים קשר עין עם קהל מגוון. הדגש את המילים 'תוצאות מדידות'. עצור לרגע אחרי הביטוי 'לקחים החשובים ביותר' כדי ליצור מתח."
    },
    {
      "type": "פתיחה בשאלה רטורית המתחברת לכאב הקהל",
      "script": "כמה מכם חוויתם את התסכול של להשקיע זמן וכסף ב${formData.idea}, רק לגלות שהתוצאות לא מגיעות? [הנח לקהל להגיב] אני מניח שרוב הידיים כאן למעלה. זה לא המקרה שלכם בלבד - זה קורה ל-85% מה${formData.audienceProfile} שפונים אליי. אבל הבשורה הטובה? יש פתרון קונקרטי.",
      "tips": "בקש באמת מהקהל להרים יד. ספור בקול את מי שמרים יד. השתמש בטון אמפתי ולא שיפוטי. הדגש את הסטטיסטיקה '85%' בבירור."
    },
    {
      "type": "פתיחה עם עובדה מפתיעה ורלוונטית",
      "script": "אם אני אגיד לכם שיש דרך לשפר את התוצאות שלכם ב${formData.idea} ב-40% תוך 90 יום, מבלי להוסיף תקציב או משאבים - האם תרצו לשמוע איך? [המתן לתגובה] הנתון הזה לא יצא לי מהראש. זה מבוסס על מחקר שעשיתי על 200 ${formData.audienceProfile} שיישמו את השיטה שאני עומד לחלוק איתכם היום.",
      "tips": "עצור אחרי השאלה ותן לקהל להגיב באמת. אל תמשיך בלי לקבל תגובה. הדגש את המספרים '40%' ו'90 יום' בבירור. הראה ביטחון בנתונים שלך."
    }
  ],
  "chapterQuestions": {
    "פרק 1": [
      {
        "question": "בהתבסס על הנתונים שראינו, מה לדעתכם הגורם העיקרי לכישלונות ב${formData.idea} אצל ${formData.audienceProfile}?",
        "purpose": "להביא את הקהל לחשוב על השורש של הבעיה ולא רק על הסימפטומים",
        "expectedAnswers": ["חוסר ידע מעשי", "חוסר תקציב", "חוסר זמן", "חוסר מחויבות ארגונית"],
        "followUp": "תשובות מעולות! אני שמח לראות שאתם חושבים בצורה מעמיקה. למעשה, המחקר שלי מראה שהגורם העיקרי הוא [קשר לנושא הבא ברצף ההרצאה]"
      },
      {
        "question": "מי מכם ניסה בעבר ליישם פתרון ב${formData.idea} ולא הצליח? מה היה החסם הגדול ביותר?",
        "purpose": "ליצור קשר אישי עם הקהל ולאסוף תובנות לשימוש בהמשך ההרצאה",
        "expectedAnswers": ["בעיות טכניות", "התנגדות צוות", "חוסר בהירות במדידה", "בעיות תקציב"],
        "followUp": "תודה שחלקתם את החוויות שלכם. אני רואה כמה דפוסים מוכרים כאן שחוזרים גם במחקר שלי. בואו נראה איך אפשר לפתור בדיוק את הבעיות שהזכרתם"
      }
    ],
    "פרק 2": [
      {
        "question": "אחרי מה שראינו על הגישה החדשה ל${formData.idea}, איזה חלק נראה לכם הכי מאתגר ליישום בארגון שלכם?",
        "purpose": "לזהות התנגדויות פוטנציאליות ולהכין מענה מותאם",
        "expectedAnswers": ["שינוי תהליכים קיימים", "הכשרת צוות", "שכנוע הנהלה", "אינטגרציה טכנית"],
        "followUp": "הערכה מדויקת! זה בדיוק מה שאני שומע מרוב הלקוחות שלי. בשקף הבא אני אראה לכם איך 3 חברות דומות לשלכם התמודדו עם בדיוק את האתגרים שהזכרתם"
      }
    ],
    "פרק 3": [
      {
        "question": "בהינתן כל מה שראינו היום, מה יהיה הצעד הראשון שתעשו כשתחזרו למשרד?",
        "purpose": "להביא את הקהל לחשיבה מעשית ולהכנה לקריאה לפעולה",
        "expectedAnswers": ["בחינת מצב קיים", "הצגה להנהלה", "בדיקת תקציב", "איסוף מידע נוסף"],
        "followUp": "תשובות מצוינות! אני רואה שאתם כבר בהילוך של ביצוע. עכשיו אני רוצה לעזור לכם להפוך את הכוונות הטובות האלה לתוכנית פעולה קונקרטית"
      }
    ]
  },
  "interactiveActivities": [
    {
      "activity": "מיפוי אתגרים קבוצתי",
      "timing": "אחרי הצגת הבעיה הראשית (דקה 15)",
      "duration": "5 דקות",
      "instructions": "חלקו את הקהל לקבוצות של 4-5 אנשים. כל קבוצה תכין רשימה של 3 האתגרים הגדולים ביותר שלהם ב${formData.idea}. אחרי 3 דקות, כל קבוצה תשתף אתגר אחד עם כל הקהל. רשמו את האתגרים על הלוח.",
      "materials": "דף לכל קבוצה, עטים, לוח או פליפצ'ארט"
    },
    {
      "activity": "תרגיל חישוב ROI אישי",
      "timing": "אמצע ההרצאה (דקה 25)",
      "duration": "4 דקות",
      "instructions": "כל משתתף מקבל דף עבודה פשוט לחישוב ROI פוטנציאלי מיישום ${formData.idea} בארגון שלו. הם ממלאים נתונים בסיסיים ורואים הערכה של החיסכון השנתי הפוטנציאלי. אחר כך 2-3 אנשים חולקים את התוצאות.",
      "materials": "דפי עבודה מודפסים, מחשבונים (או אפליקציה בטלפון)"
    },
    {
      "activity": "דמיון מודרך - הצלחה בעתיד",
      "timing": "לקראת סוף ההרצאה (דקה 40)",
      "duration": "3 דקות",
      "instructions": "בקש מהקהל לעצום עיניים ולדמיין איך יראה הארגון שלהם בעוד שנה אחרי יישום מוצלח של ${formData.idea}. תן להם דקה של דמיון בשקט, ואז בקש מ3-4 אנשים לחלוק מה ראו.",
      "materials": "אין צורך בחומרים מיוחדים"
    }
  ],
  "transitionPhrases": [
    {
      "from": "הצגת הבעיה",
      "to": "הצגת הפתרון",
      "phrase": "עכשיו, אחרי שזיהינו את האתגרים האמיתיים, אני רוצה להראות לכם בדיוק איך אפשר להתמודד איתם. מה שאני עומד לחלוק איתכם עבד עבור מאות ${formData.audienceProfile} אחרים, וזה יעבוד גם עבורכם"
    },
    {
      "from": "הצגת הפתרון",
      "to": "דוגמאות ומקרי מבחן",
      "phrase": "זה נשמע טוב בתיאוריה, אבל אני יודע שאתם חושבים 'איך זה באמת עובד בפועל?' אז בואו נראה בדיוק איך ${formData.audienceProfile} אחרים השיגו תוצאות מדהימות עם השיטה הזו"
    },
    {
      "from": "דוגמאות ומקרי מבחן",
      "to": "יישום מעשי",
      "phrase": "הדוגמאות האלה מרשימות, נכון? עכשיו השאלה היא - איך אתם הופכים את זה למציאות בארגון שלכם? בואו נפרק את זה לצעדים קונקרטיים שאתם יכולים להתחיל ליישם כבר מחר"
    },
    {
      "from": "יישום מעשי",
      "to": "סיכום וקריאה לפעולה",
      "phrase": "אני רואה בעיניים שלכם שאתם כבר מתחילים לחשוב איך ליישם את זה. זה בדיוק מה שאני רוצה לראות! עכשיו, בואו נסכם את הנקודות החשובות ונדבר על איך אני יכול לעזור לכם להמשיך בדרך הזו"
    }
  ],
  "engagementTechniques": [
    {
      "technique": "הפעלת חושים מרובים בלמידה",
      "when": "לאורך כל ההרצאה",
      "howTo": "השתמש בתמונות, צלילים קצרים, והזמן את הקהל לכתוב או לצייר. לדוגמה: 'ציירו בדמיונכם איך זה ייראה בארגון שלכם' או 'שמעתם את הצליל? זה בדיוק מה שקורה כש...'",
      "benefits": "שיפור שמירת מידע ב-40%, הגברת מעורבות והפחתת הסחות דעת"
    },
    {
      "technique": "שימוש בטכניקת 'כן-סולם'",
      "when": "לפני הצגת פתרון או בקשה",
      "howTo": "התחל בשאלות שהתשובה שלהן היא בוודאי 'כן': 'מי מכם רוצה לשפר את התוצאות שלו?' 'מי מכם מעוניין בפתרון פשוט ויעיל?' אחר כך הגש את ההצעה שלך",
      "benefits": "יצירת מומנטום חיובי והכנת הקהל לקבלת הרעיון החדש"
    },
    {
      "technique": "שימוש בשפת גוף דינמית",
      "when": "בנקודות מפתח בהרצאה",
      "howTo": "זוז על הבמה, השתמש בידיים להדגמה, שנה גובה קול ומהירות דיבור. כשאתה מציג נתון חשוב - עצור, קדם צעד למרכז הבמה, ודבר לאט יותר",
      "benefits": "שמירה על קשב הקהל, הדגשת נקודות חשובות, יצירת קשר רגשי"
    },
    {
      "technique": "יצירת 'רגעי גילוי' מתוכננים",
      "when": "בעת הצגת פתרונות או תובנות חדשות",
      "howTo": "בנה מתח: 'המחקר הזה גילה משהו מפתיע...' [השהיה] 'מסתבר שהגורם האמיתי זה לא מה שחשבנו...' [השהיה] 'זה בעצם...'",
      "benefits": "יצירת זיכרון חזק לנקודות מפתח, הגברת סקרנות ומעורבות"
    }
  ],
  "troubleshooting": [
    {
      "problem": "קהל לא מגיב לשאלות",
      "solution": "שנה את סוג השאלה: במקום 'יש לכם שאלות?' שאל 'מה השאלה הראשונה שעולה לכם על הנושא הזה?' או בקש מהם לדון בזוגות ואז לשתף",
      "prevention": "קבע כללי מעורבות בהתחלה: 'ההרצאה תהיה אינטראקטיבית, אני אשאל שאלות ואשמח לתשובות'"
    },
    {
      "problem": "טעות טכנית או שכחת נקודה חשובה",
      "solution": "תודה לקהל על הסבלנות, תקן בביטחון: 'רגע, אני רוצה לוודא שהנקודה הזו ברורה...' אל תתנצל יותר מדי",
      "prevention": "הכן רשימת נקודות מפתח בכרטיסיות, עבור על ההרצאה 3 פעמים לפני"
    },
    {
      "problem": "שאלה קשה או תוקפנית מהקהל",
      "solution": "תודה על השאלה, הסבר שזה נושא מורכב, תן תשובה חלקית אם יש לך, והציע להמשיך בשיחה פרטית אחרי ההרצאה",
      "prevention": "הכן תשובות לשאלות קשות צפויות, קבע זמן מוגדר לשאלות"
    },
    {
      "problem": "קהל מתחיל להיות חסר סבלנות או מסתכל בטלפונים",
      "solution": "שנה את הקצב, הוסף אלמנט אינטראקטיבי: 'בואו נעשה משהו אחר לרגע...' או שאל שאלה שקשורה לחוויה האישית שלהם",
      "prevention": "תכנן נקודות אינטראקציה כל 7-10 דקות, השתמש בסיפורים אישיים"
    }
  ],
  "closingTechniques": [
    {
      "type": "סיום בקריאה לפעולה ספציפית",
      "script": "לפני שנפרדים, אני רוצה לתת לכם משימה פשוטה לשבוע הבא: בחרו נקודה אחת ממה ששמעתם היום ויישמו אותה בארגון שלכם. כשתראו את התוצאות הראשונות, תדעו שזה רק ההתחלה. ואם תרצו לקחת את זה לרמה הבאה - ${formData.callToAction}. אני כאן כדי לעזור לכם להגשים את הפוטנציאל המלא של ${formData.idea} בארגון שלכם.",
      "callToAction": "צרו קשר איתי השבוע הבא לייעוץ ראשוני ללא עלות"
    },
    {
      "type": "סיום עם חזון מעורר השראה",
      "script": "דמיינו לרגע את הארגון שלכם בעוד שנה מהיום. ${formData.idea} פועל בצורה מושלמת, הצוות שלכם בטוח ויעיל, והתוצאות עולות על הציפיות. זה לא חלום - זה בדיוק מה שאני רואה קורה עם הלקוחות שלי שלוקחים את הצעדים הנכונים. השאלה היא - האם אתם מוכנים להיות הבאים?",
      "callToAction": "בואו נדבר על איך להפוך את החזון הזה למציאות"
    }
  ],
  "presentationTechnology": {
    "recommendedTools": [
      "מצגת: PowerPoint או Canva עם תבניות מקצועיות",
      "אינטראקציה: Mentimeter או Kahoot לסקרים חיים",
      "הקלטה: OBS Studio לתיעוד איכותי",
      "גיבוי טכני: העתק מצגת בענן ובזכרון נייד"
    ],
    "backupPlans": [
      "הכן גרסה מקוצרת של 15 דקות למקרה של בעיות זמן",
      "שמור העתק של המצגת בטלפון הנייד",
      "הכן רשימת נקודות מפתח שאתה יכול להציג בלי מצגת כלל"
    ]
  }
}

הוראות חשובות:
1. כל הכלים חייבים להיות ספציפיים לנושא ${formData.idea}
2. התאם את הכלים לקהל ${formData.audienceProfile}
3. כלול את הרקע המקצועי ${formData.speakerBackground} בהתאמות
4. הכלים חייבים להיות מעשיים ובני ביצוע
5. כל סקריפט חייב להיות מותאם לאישיות המרצה
6. הכלול טיפים למרצים מתחילים ומתקדמים
7. התייחס למשך הזמן ${formData.duration} דקות

החזר JSON תקין עם ארגז הכלים המקיף.
`;

  return await callOpenAI(prompt);
}

async function callOpenAI(prompt: string): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Making OpenAI API call...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'אתה מומחה ליצירת הרצאות מקצועיות בעברית. תמיד החזר JSON תקין וספציפי לנושא המבוקש.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    }),
  });

  console.log('OpenAI API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('OpenAI API call successful');
  
  return cleanAndParseJSON(data.choices[0].message.content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, formData, outline }: GenerationRequest = await req.json();
    
    console.log('Generation request:', type, 'for topic:', formData.idea);

    let result;
    
    switch (type) {
      case 'outline':
        result = await generateOutlineContent(formData);
        break;
      case 'slides':
        result = await generateSlidesContent(formData, outline);
        break;
      case 'email':
        result = await generateEmailContent(formData, outline);
        break;
      case 'strategy':
        result = await generateStrategyContent(formData, outline);
        break;
      case 'tools':
        result = await generateToolsContent(formData, outline);
        break;
      default:
        throw new Error(`Unsupported generation type: ${type}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-presentation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
