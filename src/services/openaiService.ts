import { PresentationFormData, PresentationOutline, Chapter, SlideStructure, DynamicSalesStrategy, PresentationTools } from '@/types/presentation';
import { generateId } from '@/utils/helpers';

// OpenAI API configuration
const OPENAI_API_KEY = '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';
const OPENAI_ORG_ID = 'org-fdnj54f725C7rUNxPVyt8jEA';

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
 * Validates response against expected schema
 */
function validateOutlineResponse(data: any): boolean {
  return (
    data &&
    Array.isArray(data.chapters) &&
    data.chapters.length > 0 &&
    Array.isArray(data.openingStyles) &&
    typeof data.timeDistribution === 'string' &&
    Array.isArray(data.interactiveActivities) &&
    typeof data.presentationStructure === 'string' &&
    typeof data.salesGuide === 'string'
  );
}

/**
 * Validates slide structure response
 */
function validateSlideResponse(data: any): boolean {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(slide => 
      typeof slide.number === 'number' &&
      typeof slide.headline === 'string' &&
      typeof slide.content === 'string' &&
      typeof slide.visual === 'string'
    )
  );
}

/**
 * Creates a thread for assistant conversation with retry logic
 */
async function createThread(): Promise<string> {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Creating thread, attempt ${attempt}`);
      
      const response = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Organization': OPENAI_ORG_ID,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Thread created successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error(`Thread creation attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
  
  throw new Error('Failed to create thread after all retries');
}

/**
 * Adds a message to the thread with retry logic
 */
async function addMessageToThread(threadId: string, content: string): Promise<void> {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Adding message to thread ${threadId}, attempt ${attempt}`);
      
      const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Organization': OPENAI_ORG_ID,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: content.substring(0, 8000) // Limit message size
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('Message added successfully');
      return;
    } catch (error) {
      console.error(`Add message attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * Runs the assistant and waits for completion with enhanced error handling
 */
async function runAssistant(threadId: string): Promise<string> {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Running assistant for thread ${threadId}, attempt ${attempt}`);
      
      // Start the run
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Organization': OPENAI_ORG_ID,
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID,
          max_prompt_tokens: 4000,
          max_completion_tokens: 4000
        })
      });

      if (!runResponse.ok) {
        throw new Error(`HTTP ${runResponse.status}: ${runResponse.statusText}`);
      }

      const runData = await runResponse.json();
      const runId = runData.id;
      console.log('Assistant run started:', runId);

      // Poll for completion with timeout
      let status = 'queued';
      let pollCount = 0;
      const maxPolls = 90; // 90 seconds timeout
      
      while ((status === 'queued' || status === 'in_progress') && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        pollCount++;
        
        if (pollCount % 10 === 0) {
          console.log(`Assistant run status check ${pollCount}: ${status}`);
        }
        
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Organization': OPENAI_ORG_ID,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`HTTP ${statusResponse.status}: ${statusResponse.statusText}`);
        }

        const statusData = await statusResponse.json();
        status = statusData.status;
        
        if (status === 'failed') {
          console.error('Assistant run failed:', statusData.last_error);
          throw new Error(`Assistant run failed: ${statusData.last_error?.message || 'Unknown error'}`);
        }
      }

      if (pollCount >= maxPolls) {
        throw new Error('Assistant run timed out after 90 seconds');
      }

      if (status !== 'completed') {
        throw new Error(`Assistant run failed with status: ${status}`);
      }

      console.log('Assistant run completed successfully');

      // Get the assistant's response
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Organization': OPENAI_ORG_ID,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!messagesResponse.ok) {
        throw new Error(`HTTP ${messagesResponse.status}: ${messagesResponse.statusText}`);
      }

      const messagesData = await messagesResponse.json();
      const lastMessage = messagesData.data[0];
      
      console.log('Retrieved assistant response, length:', lastMessage.content[0].text.value.length);
      return lastMessage.content[0].text.value;
    } catch (error) {
      console.error(`Assistant run attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Longer backoff for assistant runs
    }
  }
  
  throw new Error('Failed to run assistant after all retries');
}

/**
 * Generates presentation outline using the custom assistant with enhanced personalization
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  try {
    console.log('Generating presentation outline...');
    const threadId = await createThread();
    
    const prompt = `
אתה יועץ מקצועי ליצירת הרצאות מותאמות אישית. המשימה שלך היא ליצור מבנה הרצאה מפורט ומדויק שמשקף בדיוק את המומחיות של המרצה ואת הצרכים הספציפיים של הקהל.

פרטי ההרצאה שעליך לבסס עליהם את התוכן:
- נושא מרכזי: "${sanitizeText(formData.idea)}" 
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- פרופיל הקהל: "${sanitizeText(formData.audienceProfile)}"
- משך ההרצאה: ${formData.duration} דקות
- התנגדויות נפוצות: "${sanitizeText(formData.commonObjections)}"
- מוצר/שירות לקידום: "${sanitizeText(formData.serviceOrProduct)}"
- קריאה לפעולה: "${sanitizeText(formData.callToAction)}"

הוראות מדויקות ליצירת תוכן מותאם:

1. השתמש ברקע המרצה כדי לקבוע:
   - עומק הידע הטכני שיוצג
   - סגנון הדיבור והמושגים שיפוצו
   - סוג הדוגמאות והניסיון שיוזכר
   - רמת המקצועיות והאמינות

2. התאם את התוכן לקהל הספציפי:
   - השתמש בשפה ומושגים מתאימים לרמת הקהל
   - צור דוגמאות רלוונטיות לתחום עיסוקם
   - התייחס לאתגרים הספציפיים שלהם
   - התאם את סגנון ההצגה לציפיות הקהל

3. בנה תוכן ייחודי לנושא:
   - כל פרק חייב להתקדם לוגית לעבר המטרה העיסקית
   - התייחס ישירות לנושא ולא לכללים
   - צור תוכן שרק מומחה בתחום יכול לספק
   - הימנע מתוכן גנרי או משותף

4. שלב את התנגדויות והפתרונות:
   - התייחס ישירות לחששות שהוזכרו
   - בנה תשובות מבוססות ידע מהרקע של המרצה
   - הראה איך הניסיון של המרצה פותר בעיות אלו

5. קשר טבעי למוצר/שירות:
   - אל תעשה מכירה ישירה בפרקים
   - צור זרימה טבעית שמובילה לפתרון
   - הראה איך המומחיות מתרגמת לערך מעשי

יש להחזיר JSON תקין במבנה הבא בלבד:
{
  "chapters": [
    {
      "title": "כותרת פרק מותאמת לנושא הספציפי",
      "points": [
        {"content": "נקודה מקצועית המבוססת על רקע המרצה"},
        {"content": "תובנה מעשית רלוונטית לקהל היעד"},
        {"content": "דוגמה ספציפית מהתחום"}
      ]
    }
  ],
  "openingStyles": [
    "פתיחה המתאימה לסגנון המרצה ולקהל הספציפי",
    "אפשרות שנייה המבוססת על הניסיון המקצועי",
    "גישה שלישית המותאמת לנושא הייחודי"
  ],
  "timeDistribution": "חלוקת זמנים מותאמת למשך ההרצאה ולתוכן הספציפי",
  "interactiveActivities": [
    "פעילות מעורבות רלוונטית לקהל היעד",
    "אינטראקציה המתאימה לנושא הספציפי",
    "משימה מעשית המבוססת על התוכן"
  ],
  "presentationStructure": "מבנה מפורט המותאם לסגנון המרצה ולמטרות ההרצאה",
  "discussionQuestions": {
    "פרק 1": ["שאלה ספציפית לתוכן", "שאלה נוספת המתאימה לקהל"],
    "פרק 2": ["שאלה מעמיקה בנושא", "שאלה מעשית יותר"],
    "פרק 3": ["שאלה מסכמת", "שאלה המובילה לפעולה"]
  },
  "salesGuide": "מדריך מכירות מותאם שמתבסס על האמינות והמומחיות של המרצה",
  "postPresentationPlan": "תוכנית מעקב מותאמת לסוג הקהל ולמטרות המרצה",
  "motivationalMessage": "הודעה מעודדת אישית המתייחסת לחוזקות המרצה",
  "salesProcess": [
    {
      "title": "שלב מכירה המותאם לסגנון המרצה",
      "description": "תיאור מפורט שמתבסס על הרקע המקצועי",
      "order": 1
    }
  ]
}

חשוב מאוד: אל תיצור תוכן גנרי! כל משפט חייב להיות רלוונטי לנושא הספציפי, לרקע המרצה ולקהל היעד.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    const parsedData = cleanAndParseJSON(response);
    
    if (!validateOutlineResponse(parsedData)) {
      throw new Error('Invalid response structure from AI assistant');
    }
    
    console.log('Presentation outline generated successfully');
    return parseApiResponse(JSON.stringify(parsedData));
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw error;
  }
}

/**
 * Generates dynamic slide structure with deep personalization
 */
export async function generateDynamicSlideStructure(formData: PresentationFormData, outline: PresentationOutline): Promise<SlideStructure[]> {
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
export async function generateDynamicSalesStrategy(formData: PresentationFormData, outline: PresentationOutline): Promise<DynamicSalesStrategy> {
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
