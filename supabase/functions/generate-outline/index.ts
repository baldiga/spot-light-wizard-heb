
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
    
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    
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

async function callOpenAI(prompt: string): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Making OpenAI API call with o1-mini...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'o1-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 4000
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

=== מודול 1: ניתוח פסיכו-דמוגרפי מעמיק ===

בצע ניתוח רב-שכבתי של הקהל:

1. **מיפוי כאבים פסיכולוגיים**: זהה את הכאבים הרגשיים העמוקים מעבר לבעיות הטכניות
2. **דפוסי התנגדות**: נתח את המנגנונים הפסיכולוגיים מאחורי ההתנגדויות
3. **טריגרים של קבלת החלטות**: זהה מה מניע את הקהל לפעולה
4. **מפת מצבים רגשיים**: תכנן את המסע הרגשי לאורך ההרצאה
5. **היררכיית ערכים**: בחן מה באמת חשוב לקהל במעמקי תודעתו

=== מודול 2: אדריכלות סמכותיות המרצה ===

בנה אסטרטגיית אמינות מתקדמת:

1. **סימני סמכות**: זהה איך להציג את הרקע כסמכות בלתי מעורערת
2. **נקודות חיבור אישיות**: מצא איך ליצור קשר רגשי עם הקהל
3. **סיפורי הוכחה**: תכנן נרטיבים שמוכיחים מומחיות
4. **רגעי חשיפה**: תכנן רגעים של פגיעות אנושית לבניית אמון
5. **הדרגת אמינות**: בנה עלייה מתמדת באמינות לאורך ההרצאה

=== מודול 3: פסיכולוגיית הצגה מתקדמת ===

יישם עקרונות נוירופסיכולוגיים:

1. **ניהול עומס קוגניטיבי**: חלק מידע לקטעים קלים לעיכול
2. **טכניקות עיגון זיכרון**: צור נקודות זיכרון בלתי נמחקות
3. **רצף שכנוע מדעי**: בנה רצף לוגי-רגשי שמוביל לפעולה
4. **מיפוי מסע רגשי**: תכנן את המעברים הרגשיים בצורה אסטרטגית
5. **נקודות התעוררות**: תכנן רגעים שיגבירו תשומת לב ורגש

=== מודול 4: ארכיטקטורת מכירות משולבת ===

שלב מכירות באופן טבעי ולא פולשני:

1. **סולם ערכים**: בנה הדרגה של ערך שמוביל למוצר/שירות
2. **אסטרטגיית טיפול בהתנגדויות**: הקדם ופתור התנגדויות לפני שהן עולות
3. **נקודות הוכחה חברתית**: מקם עדויות ותוצאות באופן אסטרטגי
4. **יצירת דחיפות טבעית**: בנה תחושת דחיפות מתוך הצורך האמיתי
5. **טכניקות מעבר**: צור מעברים טבעיים מהרצאה למכירה

=== מודול 5: מדע המעורבות ===

יישם טכניקות מעורבות מבוססות מחקר:

1. **טריגרים נוירולוגיים**: השתמש בטכניקות שמעוררות את המוח
2. **אופטימיזציה של רגעים אינטראקטיביים**: תכנן פעילויות שמגבירות מעורבות
3. **ניהול אנרגיה**: שמור על רמת אנרגיה גבוהה לאורך ההרצאה
4. **טכניקות שינוי מצב**: עזור לקהל לעבור ממצבי התנגדות לקבלה
5. **מקסום שמירת מידע**: וודא שהמסרים המרכזיים נשמרים בזיכרון

=== מודול 6: מסגרות מבניות מתקדמות ===

השתמש במסגרות מוכחות:

1. **ארכיטקטורה מבוססת סיפור**: בנה נרטיב עם התחלה, אמצע וסוף
2. **מתודולוגיית בעיה-גירוי-פתרון**: הדרם את הבעיה לפני הצגת הפתרון
3. **התאמת מסע הגיבור**: הפוך את הקהל לגיבור של הסיפור
4. **נרטיב טרנספורמציה**: הראה את המעבר ממצב נוכחי למצב רצוי
5. **התקדמות מוכוונת תוצאות**: כל חלק מוביל לתוצאה מדידה

=== הוראות יצירה ===

צור מבנה הרצאה המכיל:

1. **4 פרקים מדויקים** - כל פרק עם מטרה פסיכולוגית ספציפית
2. **10 שלבי מכירה משולבים** - שזורים באופן טבעי בתוכן
3. **טכניקות מעורבות מתקדמות** - בכל פרק
4. **אסטרטגיית טיפול בהתנגדויות** - מובנית במבנה
5. **מסלול רגשי מתוכנן** - מהתעוררות לפעולה

עבור כל פרק, כלול:
- **מטרה פסיכולוגיה** (איך זה משפיע על הקהל)
- **טכניקת מעורבות** (איך לשמור על קשב)
- **נקודת מכירה** (איך זה מקדם למוצר/שירות)
- **טיפול בהתנגדות** (איך זה פותר חששות)
- **מעבר רגשי** (איך זה מכין לשלב הבא)

החזר JSON תקין במבנה הבא:
{
  "chapters": [
    {
      "title": "כותרת שמושכת ומתחברת לכאב העמוק של הקהל",
      "psychologyGoal": "מטרה פסיכולוגית ספציפית לפרק זה",
      "emotionalState": "המצב הרגשי שאנחנו רוצים ליצור",
      "points": [
        {
          "content": "נקודה שמתבססת על מחקר התנהגותי ונוגעת לכאב אמיתי",
          "engagementTechnique": "טכניקה ספציפית למעורבות (שאלה, סיפור, אינטראקציה)",
          "psychologyBehind": "העיקרון הפסיכולוגי שפועל כאן",
          "salesElement": "איך הנקודה הזו מקדמת למוצר/שירות באופן טבעי"
        }
      ],
      "transitionStrategy": "אסטרטגיית המעבר הרגשי לפרק הבא",
      "objectionHandled": "איזו התנגדות נפתרת בפרק זה"
    }
  ],
  "openingStyles": [
    "פתיחה מבוססת פסיכולוגיה שיוצרת התעוררות מיידית ותחושת דחיפות",
    "פתיחה המתבססת על כאב עמוק שהקהל חווה ויוצרת חיבור רגשי",
    "פתיחה שמציבה את המרצה כסמכות ויוצרת אמון מיידי"
  ],
  "timeDistribution": "חלוקת זמנים אסטרטגית שמתחשבת בעקומת קשב ומעורבות",
  "presentationStructure": "מבנה מבוסס על מחקר שמביא לשינוי התנהגות מדיד",
  "salesGuide": "מדריך מכירות פסיכולוגי שמתבסס על הבנת דפוסי קנייה של הקהל",
  "motivationalMessage": "הודעה שמעצימה את המרצה ומחזקת את הביטחון בגישה",
  "salesProcess": [
    {
      "title": "שלב מכירה מבוסס על טריגר פסיכולוגי ספציפי",
      "description": "תיאור מפורט שמתבסס על מחקר התנהגותי ועקרונות שכנוע",
      "psychologyPrinciple": "העיקרון הפסיכולוגי שפועל בשלב זה",
      "implementationTip": "איך ליישם זאת בצורה טבעית ולא פולשנית",
      "order": 1
    }
  ],
  "engagementMasterPlan": {
    "attentionCurve": "מפת ניהול קשב לאורך ההרצאה",
    "energyManagement": "אסטרטגיית ניהול אנרגיה",
    "interactionPoints": "נקודות אינטראקציה אסטרטגיות",
    "memoryAnchors": "עוגנים לזיכרון ארוך טווח"
  },
  "psychologyFramework": {
    "persuasionSequence": "רצף השכנוע המדעי שנבנה",
    "resistanceManagement": "איך מתמודדים עם התנגדות פסיכולוגית",
    "trustBuilding": "בניית אמון מדרגת לאורך ההרצאה",
    "actionTriggers": "הטריגרים שמניעים לפעולה"
  }
}

חשוב מאוד:
- כל אלמנט חייב להיות מבוסס על מחקר פסיכולוגי אמיתי
- המבנה חייב לזרום מבחינה רגשית ולוגית
- טכניקות המכירה חייבות להיות משולבות באופן טבעי
- הטיפול בהתנגדויות חייב להיות יזום ולא תגובתי
- כל פרק חייב לבנות על הקודם ולהכין לבא אחריו
- השפה והגישה חייבים להיות מותאמים לרמת הקהל הספציפי
- בדיוק 4 פרקים ו-10 שלבי מכירה - חובה!
  `;

  return await callOpenAI(prompt);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    
    console.log('Generating enhanced outline for topic:', formData.idea);

    const result = await generateOutlineContent(formData);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-outline function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
