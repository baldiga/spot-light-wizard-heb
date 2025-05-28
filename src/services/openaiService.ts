import { PresentationFormData, PresentationOutline } from '@/types/presentation';
import { generateId } from '@/utils/helpers';

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_ORG_ID = Deno.env.get('OPENAI_ORG_ID');

// Custom assistant ID
const ASSISTANT_ID = 'asst_etLDYkL7Oj3ggr9IKpwmGE76';

/**
 * Sanitizes Hebrew text for JSON compatibility
 */
function sanitizeText(text: string): string {
  return text
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\\/g, '\\\\');
}

/**
 * Cleans and validates JSON response with enhanced error handling
 */
function cleanAndParseJSON(response: string): any {
  try {
    console.log('Raw AI response:', response.substring(0, 500) + '...');
    
    // Remove any markdown formatting
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object boundaries
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    
    // Enhanced JSON cleaning for Hebrew text
    cleanResponse = cleanResponse
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/\r/g, '') // Remove carriage returns
      .trim();
    
    console.log('Cleaned JSON:', cleanResponse.substring(0, 300) + '...');
    
    // Validate JSON before parsing
    const parsed = JSON.parse(cleanResponse);
    console.log('Successfully parsed JSON');
    
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Raw response length:', response.length);
    console.error('Response preview:', response.substring(0, 1000));
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * Generates presentation outline using the custom assistant with enhanced personalization
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  try {
    console.log('Generating presentation outline...');
    const threadId = await createThread();
    
    const prompt = `
אתה אדריכל הרצאות מומחה המתמחה בפסיכולוגיה של שכנוע, נוירו-מרקטינג וניהול תודעה. המשימה שלך היא ליצור אדריכלות הרצאה מתקדמת המבוססת על עקרונות מדעיים של השפעה ושכנוע.

=== ניתוח מתקדם של פרמטרי קלט ===
נושא מרכזי: "${sanitizeText(formData.idea)}"
רקע והתמחות המרצה: "${sanitizeText(formData.speakerBackground)}"
פרופיל קהל מטרה: "${sanitizeText(formData.audienceProfile)}"
משך הרצאה: ${formData.duration} דקות
התנגדויות פסיכולוגיות צפויות: "${sanitizeText(formData.commonObjections)}"
מוצר/שירות לקידום: "${sanitizeText(formData.serviceOrProduct)}"
קריאה לפעולה מבוקשת: "${sanitizeText(formData.callToAction)}"

=== מסגרת עבודה פסיכולוגית מתקדמת ===

**מודול ניתוח פסיכו-דמוגרפי עמוק:**
1. **מיפוי כאבים רגשיים**: חפש מעבר לבעיות הטכניות את הכאבים הרגשיים העמוקים
2. **ניתוח דפוסי התנגדות**: הבן את המנגנונים הפסיכולוגיים מאחורי ההתנגדויות
3. **זיהוי טריגרי פעולה**: מצא מה באמת מניע את הקהל הזה לקבלת החלטות
4. **מיפוי מצבים רגשיים**: תכנן את המסע הרגשי האופטימלי לאורך ההרצאה
5. **הירארכיית ערכים אמיתית**: חשוף מה באמת חשוב לקהל במעמקי תודעתו

**אדריכלות סמכותיות מרצה:**
1. **בניית סמכות מדעית**: הפוך את הרקע המקצועי לסמכות בלתי מעורערת
2. **נקודות חיבור רגשי**: יצר קשרים רגשיים עמוקים מתוך הניסיון האישי
3. **סיפורי הוכחה אישיים**: בנה נרטיבים שמוכיחים מומחיות בצורה משכנעת
4. **רגעי פגיעות מחושבים**: תכנן רגעי חשיפה שבונים אמון והזדהות
5. **הדרגת אמינות**: צור עלייה מתמדת ומתוכננת באמינות

**פסיכולוגיית הצגה נוירו-מבוססת:**
1. **ניהול עומס קוגניטיבי**: חלק מידע באופן שמייעל קליטה ועיבוד
2. **עוגני זיכרון אסטרטגיים**: צור נקודות זיכרון שישארו לטווח ארוך
3. **רצף שכנוע מדעי**: בנה רצף לוגי-רגשי מבוסס מחקר שמוביל לפעולה
4. **מעברים רגשיים מתוכננים**: נהל את המצבים הרגשיים לאורך ההרצאה
5. **נקודות התעוררות נוירולוגיות**: מקם רגעים שמעוררים את המוח ומגבירים קשב

**ארכיטקטורת מכירות משולבת:**
1. **סולם ערכים הדרגתי**: בנה בנייה הדרגתית של ערך שמובילה טבעית למוצר
2. **ניטרול התנגדויות יזום**: פתור התנגדויות לפני שהן מתעוררות בתודעה
3. **הוכחה חברתית אסטרטגית**: מקם עדויות ותוצאות בנקודות השפעה מקסימלית
4. **דחיפות טבעית אמיתית**: בנה תחושת דחיפות מתוך צורך אמיתי ולא מלאכותי
5. **מעברים זורמים**: צור מעברים טבעיים מהערך החינמי לערך בתשלום

**מדע המעורבות המתקדם:**
1. **טריגרים נוירולוגיים**: השתמש בטכניקות שמפעילות את מרכזי ההנאה במוח
2. **אופטימיזציה אינטראקטיבית**: תכנן פעילויות שמקסימות מעורבות ושמירת מידע
3. **ניהול אנרגיה דינמי**: שמור על רמת אנרגיה אופטימלית לאורך כל ההרצאה
4. **טכניקות שינוי מצב**: עזור לקהל לעבור ממצבי התנגדות למצבי קבלה
5. **מקסום רטנציה**: וודא שהמסרים המרכזיים נשמרים בזיכרון ארוך טווח

**הוראות ליצירת תוכן מתקדם:**

יש ליצור מבנה הרצאה שכולל:
- **בדיוק 4 פרקים** עם מטרה פסיכולוגית ספציפית לכל פרק
- **10 שלבי מכירה** משולבים באופן טבעי ולא פולשני
- **טכניקות מעורבות מדעיות** בכל שלב
- **אסטרטגיית ניטרול התנגדויות** מובנית
- **מסלול רגשי מתוכנן** מהתעוררות ועד לפעולה

עבור כל פרק, חובה לכלול:
- מטרה פסיכולוגית מדויקת (איך זה משפיע על התודעה)
- טכניקת מעורבות מדעית (איך לשמור על קשב מקסימלי)
- נקודת מכירה טבעית (איך זה מקדם למוצר באופן זורם)
- ניטרול התנגדות ספציפית (איך זה פותר חששות)
- מעבר רגשי אסטרטגי (איך זה מכין לשלב הבא)

החזר JSON תקין במבנה המדויק הבא:
{
  "chapters": [
    {
      "title": "כותרת מושכת שמתחברת לכאב הרגשי העמוק של הקהל",
      "psychologyGoal": "המטרה הפסיכולוגית הספציפית של הפרק",
      "emotionalState": "המצב הרגשי הרצוי שנרצה ליצור",
      "points": [
        {
          "content": "נקודה מבוססת מחקר התנהגותי שנוגעת לכאב אמיתי ועמוק",
          "engagementTechnique": "טכניקה מדעית למעורבות (שאלה נוירולוגית, סיפור רגשי, אינטראקציה)",
          "psychologyBehind": "העיקרון הפסיכולוגי/נוירולוגי שפועל בנקודה זו",
          "salesElement": "איך הנקודה מקדמת טבעית למוצר/שירות ללא יבש או פולשני"
        }
      ],
      "transitionStrategy": "האסטרטגיה הרגשית למעבר לפרק הבא",
      "objectionHandled": "איזו התנגדות פסיכולוגית נפתרת/מנוטרלת בפרק זה"
    }
  ],
  "openingStyles": [
    "פתיחה מבוססת נוירופסיכולוגיה שיוצרת התעוררות מיידית ותחושת דחיפות אמיתית",
    "פתיחה המתבססת על הכאב הרגשי העמוק ביותר של הקהל ויוצרת חיבור מיידי",
    "פתיחה שמציבה את המרצה כסמכות עליונה ויוצרת אמון ואמינות מיידיים"
  ],
  "timeDistribution": "חלוקת זמנים אסטרטגית המבוססת על עקומת קשב ומעורבות נוירולוגית",
  "interactiveActivities": [
    "פעילות מעורבות נוירופסיכולוגית רלוונטית לקהל היעד",
    "אינטראקציה המתאימה לנושא הספציפי ומפעילה מרכזי עניין במוח",
    "משימה מעשית המבוססת על התוכן ויוצרת קשירה רגשית"
  ],
  "presentationStructure": "מבנה מדעי מבוסס מחקר שמוביל לשינוי התנהגות מדיד ובר קיימא",
  "discussionQuestions": {
    "פרק 1": ["שאלה שחושפת כאבים עמוקים", "שאלה שמעמיקה הבנה עצמית"],
    "פרק 2": ["שאלה מתקדמת בנושא", "שאלה שבונה אמון ומתודעת"],
    "פרק 3": ["שאלה מסכמת ומחברת", "שאלה המובילה לפעולה"]
  },
  "salesGuide": "מדריך מכירות פסיכולוגי מותאם שמתבסס על הבנת דפוסי קנייה וקבלת החלטות של הקהל הספציפי",
  "postPresentationPlan": "תוכנית מעקב מתקדמת המבוססת על עקרונות שכנוע ובניית יחסי אמון ארוכי טווח",
  "motivationalMessage": "הודעה מעודדת ומעצימה המתייחסת לחוזקות הייחודיות של המרצה ולפוטנציאל ההשפעה שלו",
  "salesProcess": [
    {
      "title": "שלב מכירה מבוסס על טריגר פסיכולוגי מדויק ומחקרי",
      "description": "תיאור מפורט ומדעי שמתבסס על מחקר התנהגותי ועקרונות שכנוע מתקדמים",
      "psychologyPrinciple": "העיקרון הפסיכולוגי/נוירולוגי הספציפי שפועל בשלב זה",
      "implementationTip": "איך ליישם בצורה טבעית, אותנטית ולא מניפולטיבית",
      "order": 1
    }
  ],
  "advancedEngagement": {
    "attentionCurveManagement": "מפת ניהול קשב מדעית לאורך ההרצאה",
    "energyOptimization": "אסטרטגיית ניהול אנרגיה המבוססת על ביולוגיה",
    "neurologicalInteractionPoints": "נקודות אינטראקציה שמפעילות מרכזי עניין במוח",
    "longTermMemoryAnchors": "עוגנים מדעיים לזיכרון ארוך טווח"
  },
  "persuasionFramework": {
    "scientificPersuasionSequence": "הרצף המדעי של השכנוע שנבנה בהרצאה",
    "psychologicalResistanceManagement": "נטרול התנגדויות",
    "trustArchitecture": "האדריכלות של בניית אמון מדרגתי לאורך ההרצאה",
    "neurologicalActionTriggers": "הטריגרים הנוירולוגיים שמניעים לפעולה אמיתית"
  }
}

הוראות קריטיות לביצוע:
- בדיוק 4 פרקים ו-10 שלבי מכירה - זה חובה מוחלטת!
- כל אלמנט חייב להיות מבוסס על מחקר פסיכולוגי ונוירולוגי אמיתי
- המבנה חייב לזרום בצורה טבעית מבחינה רגשית ולוגית
- טכניקות המכירה חייבות להיות משולבות באופן טבעי ואותנטי
- הטיפול בהתנגדויות חייב להיות יזום ומקצועי, לא תגובתי
- כל פרק חייב לבנות על הקודם ולהכין בצורה אסטרטגית לבא אחריו
- השפה והגישה חייבים להיות מותאמים מושלם לרמת הקהל הספציפי
- התוכן חייב להיות ייחודי ואישי לנושא ולמרצה, לא גנרי
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    const parsedData = cleanAndParseJSON(response);
    
    if (!validateOutlineResponse(parsedData)) {
      throw new Error('Invalid response structure from AI assistant');
    }
    
    console.log('Enhanced presentation outline generated successfully');
    return parseApiResponse(JSON.stringify(parsedData));
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw error;
  }
}

/**
 * Generates dynamic slide structure with deep personalization
 */
export async function generateDynamicSlideStructure(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  try {
    console.log('Generating dynamic slide structure...');
    const threadId = await createThread();
    
    const durationMinutes = parseInt(formData.duration);
    const estimatedSlides = Math.min(Math.floor(durationMinutes * 0.8), 35);
    
    const prompt = `
אתה מומחה ליצירת מצגות מותאמות אישית. עליך ליצור מבנה שקפים מפורט המשקף בדיוק את המומחיות של המרצה ואת הצרכים של הקהל.

פרטי ההרצאה:
- נושא: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"
- משך: ${formData.duration} דקות (יש ליצור ${estimatedSlides} שקפים)
- מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"

פרקי ההרצאה שנוצרו:
${outline.chapters.map((chapter, idx) => 
  `פרק ${idx + 1}: ${chapter.title}\n${chapter.points.map(point => `- ${point.content}`).join('\n')}`
).join('\n\n')}

הוראות ליצירת שקפים מותאמים:

1. כל שקף חייב להשקף את המומחיות הספציפית של המרצה
2. התוכן חייב להיות רלוונטי ישירות לקהל היעד
3. השתמש במושגים ובשפה המתאימים לרמת הקהל
4. צור תוכן ייחודי שרק מומחה בתחום יכול לספק
5. האלמנטים הויזואליים חייבים להתאים לנושא הספציפי
6. הערות למרצה חייבות לנצל את הרקע המקצועי שלו

מבנה נדרש:
- פתיחה: 3 שקפים מותאמים אישית
- תוכן מרכזי: מחולק לפי הפרקים שנוצרו
- סיכום ופעולה: 3 שקפים

החזר JSON array של שקפים (מקסימום ${estimatedSlides} שקפים):
[
  {
    "number": 1,
    "section": "פתיחה",
    "headline": "כותרת ייחודית הקשורה לנושא הספציפי",
    "content": "תוכן המשקף את המומחיות של המרצה ורלוונטי לקהל",
    "visual": "הצעה ויזואלית ספציפית לנושא ולתחום",
    "notes": "הערות שמנצלות את הרקע המקצועי של המרצה",
    "timeAllocation": "זמן מותאם",
    "engagementTip": "טיפ מעורבות הספציפי לסוג הקהל",
    "transitionPhrase": "מעבר המתאים לסגנון המרצה"
  }
]

חשוב: כל שקף חייב להיות ייחודי ולהשקף את התמחות המרצה. הימנע מתוכן גנרי!
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    const slides = cleanAndParseJSON(response);
    
    if (!validateSlideResponse(slides)) {
      throw new Error('Invalid slide structure from AI response');
    }
    
    console.log(`Generated ${slides.length} slides successfully`);
    return slides;
  } catch (error) {
    console.error("Error generating slide structure:", error);
    throw error;
  }
}

/**
 * Generates dynamic B2B email with deep personalization
 */
export async function generateDynamicB2BEmail(formData: PresentationFormData, outline: PresentationOutline): Promise<string> {
  try {
    console.log('Generating dynamic B2B email...');
    const threadId = await createThread();
    
    const prompt = `
כתב מייל פנייה B2B מותאם אישית המבוסס על המומחיות הספציפית של המרצה.

פרטי המרצה והנושא:
- נושא ההרצאה: "${sanitizeText(formData.idea)}"
- רקע והתמחות המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"
- מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"

הוראות למייל מותאם:

1. התחל בפתיחה שמראה הבנה עמוקה של האתגרים הספציפיים של הקהל היעד
2. הדגש את המומחיות הייחודית של המרצה הרלוונטית לנושא
3. התייחס לתוצאות או להצלחות קודמות בתחום הספציפי
4. הצע ערך ברור וישיר לקהל המסוים
5. צור קריאה לפעולה המתאימה לקהל העסקי הספציפי

המייל חייב להיות:
- 300-400 מילים
- מקצועי ואמין
- ספציפי לתחום ולא גנרי
- מותאם לרמת הקהל
- מבוסס על רקע המרצה בפועל

החזר רק את תוכן המייל ללא פורמט JSON או תגיות נוספות.
השתמש בעברית מקצועית וברורה.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    console.log('B2B email generated successfully');
    return response.trim();
  } catch (error) {
    console.error("Error generating B2B email:", error);
    throw error;
  }
}

/**
 * Generates dynamic sales strategy with deep customization
 */
export async function generateDynamicSalesStrategy(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  try {
    console.log('Generating dynamic sales strategy...');
    const threadId = await createThread();
    
    const prompt = `
צור אסטרטגיית שיווק ומכירות מותאמת אישית לפי המומחיות והנושא הספציפיים.

פרטי ההקשר:
- נושא ההרצאה: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"

הוראות ליצירת אסטרטגיה מותאמת:

1. קהלי יעד - זהה מי יהיה מעוניין בדיוק בנושא הספציפי הזה
2. ערוצי שיווק - הצע ערוצים שמתאימים לתחום ולקהל הספציפי
3. תמחור - בסס על ערך השירות/מוצר לקהל המסוים
4. שיתופי פעולה - הצע גורמים רלוונטיים בתחום
5. תוכן שיווקי - צור רעיונות ספציפיים לנושא
6. מעקב - התאם לסוג הקהל והשירות

החזר JSON בפורמט מותאם:
{
  "targetAudiences": ["קהל ספציפי לתחום", "קבוצה רלוונטיה נוספת"],
  "marketingChannels": [
    {
      "channel": "ערוץ רלוונטי לתחום",
      "strategy": "אסטרטגיה ספציפית לנושא",
      "timeline": "זמן מותאם",
      "budget": "תקציב הגיוני"
    }
  ],
  "pricingStrategy": {
    "basicTicket": "מחיר מותאם לערך הנושא",
    "vipTicket": "מחיר משקף עמק התמחות",
    "premiumTicket": "מחיר לפגישה אישית",
    "corporatePackage": "חבילה ארגונית מותאמת"
  },
  "collaborationOpportunities": ["שותף רלוונטי לתחום", "ארגון מקצועי בתחום"],
  "contentMarketing": ["תוכן ספציפי לנושא", "רעיון שיווקי ייחודי"],
  "followUpStrategy": "אסטרטגיית מעקב המתאימה לקהל ולשירות"
}

הקפד על תוכן ספציפי ולא גנרי!
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    const strategy = cleanAndParseJSON(response);
    console.log('Sales strategy generated successfully');
    return strategy;
  } catch (error) {
    console.error("Error generating sales strategy:", error);
    throw error;
  }
}

/**
 * Generates presentation tools with deep personalization and specificity
 */
export async function generatePresentationTools(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  try {
    console.log('Generating presentation tools...');
    const threadId = await createThread();
    
    const prompt = `
צור כלים מעשיים ומותאמים אישית להצגה המבוססים על המומחיות הספציפית של המרצה.

פרטי ההקשר:
- נושא: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל: "${sanitizeText(formData.audienceProfile)}"
- משך: ${formData.duration} דקות

פרקי ההרצאה:
${outline.chapters.map((chapter, idx) => 
  `פרק ${idx + 1}: ${chapter.title}\n${chapter.points.map(point => `- ${point.content}`).join('\n')}`
).join('\n\n')}

הוראות ליצירת כלים מותאמים:

1. פתיחות - צור פתיחות שמנצלות את הרקע הספציפי של המרצה
2. שאלות לפרקים - התבסס על התוכן המסוים שנוצר
3. פעילויות - התאם לסוג הקהל ולנושא הספציפי
4. מעברים - צור מעברים שמתאימים לסגנון ולתוכן
5. טכניקות מעורבות - התאם לרמת הקהל ולנושא
6. פתרון בעיות - התמקד בבעיות הספציפיות לתחום
7. סיומים - צור סיומים שמתאימים למטרות המרצה

החזר JSON מותאם:
{
  "openingSuggestions": [
    {
      "type": "סוג פתיחה המותאם לרקע המרצה",
      "script": "סקריפט ספציפי שמנצל את המומחיות",
      "tips": "טיפים המבוססים על הנושא הספציפי"
    }
  ],
  "chapterQuestions": {
    "${outline.chapters[0]?.title || 'פרק 1'}": [
      {
        "question": "שאלה ספציפית לתוכן הפרק",
        "purpose": "מטרה המתאימה לקהל היעד",
        "expectedAnswers": ["תשובה רלוונטית לנושא", "תשובה נוספת מהתחום"],
        "followUp": "המשך המבוסס על הניסיון של המרצה"
      }
    ]
  },
  "interactiveActivities": [
    {
      "activity": "פעילות ספציפית לנושא ולקהל",
      "timing": "זמן מותאם להרצאה",
      "duration": "משך זמן הגיוני",
      "instructions": "הוראות ברורות ומותאמות",
      "materials": "חומרים רלוונטיים לנושא"
    }
  ],
  "transitionPhrases": [
    {
      "from": "נקודת מוצא מהתוכן",
      "to": "נקודת יעד מהתוכן",
      "phrase": "מעבר טבעי ורלוונטי"
    }
  ],
  "engagementTechniques": [
    {
      "technique": "טכניקה מותאמת לקהל ולנושא",
      "when": "זמן מתאים בהקשר ההרצאה",
      "howTo": "ביצוע ספציפי למרצה",
      "benefits": "יעילות מבוססת ניסיון"
    }
  ],
  "troubleshooting": [
    {
      "problem": "בעיה ספציפית לתחום או לקהל",
      "solution": "פתרון המבוסס על מומחיות המרצה",
      "prevention": "מניעה רלוונטית לנושא"
    }
  ],
  "closingTechniques": [
    {
      "type": "סיום המתאים למטרות המרצה",
      "script": "סקריפט ספציפי לקריאה לפעולה",
      "callToAction": "פעולה ברורה ומתאימה לקהל"
    }
  ]
}

חשוב: כל כלי חייב להיות ספציפי ומותאם! הימנע מתשובות גנריות.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    const tools = cleanAndParseJSON(response);
    console.log('Presentation tools generated successfully');
    return tools;
  } catch (error) {
    console.error("Error generating presentation tools:", error);
    throw error;
  }
}

/**
 * Parses the API response and formats it to match our PresentationOutline interface
 */
function parseApiResponse(response: string): PresentationOutline {
  try {
    const parsedResponse = cleanAndParseJSON(response);
    
    // Add IDs to chapters and points
    const chaptersWithIds = parsedResponse.chapters.map((chapter: any) => ({
      id: generateId(),
      title: chapter.title,
      points: chapter.points.map((point: any) => ({
        id: generateId(),
        content: point.content
      }))
    }));

    // Add IDs to sales process steps if they exist
    const salesProcessWithIds = parsedResponse.salesProcess ? 
      parsedResponse.salesProcess.map((step: any, index: number) => ({
        id: generateId(),
        title: step.title,
        description: step.description,
        order: step.order || index + 1
      })) : [];
    
    return {
      chapters: chaptersWithIds,
      openingStyles: parsedResponse.openingStyles || [],
      timeDistribution: parsedResponse.timeDistribution || "",
      interactiveActivities: parsedResponse.interactiveActivities || [],
      presentationStructure: parsedResponse.presentationStructure || "",
      discussionQuestions: parsedResponse.discussionQuestions || {},
      salesGuide: parsedResponse.salesGuide || "",
      postPresentationPlan: parsedResponse.postPresentationPlan || "",
      motivationalMessage: parsedResponse.motivationalMessage || "",
      salesProcess: salesProcessWithIds
    };
  } catch (error) {
    console.error("Error parsing API response:", error);
    throw new Error("Failed to parse the AI response. Please try again.");
  }
}
