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
 * Cleans and validates JSON response
 */
function cleanAndParseJSON(response: string): any {
  try {
    // Remove any markdown formatting
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object boundaries
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    
    // Try to fix common JSON issues
    cleanResponse = cleanResponse
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
      .replace(/\n\s*\n/g, '\n'); // Remove extra newlines
    
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Raw response:', response);
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
 * Creates a thread for assistant conversation with retry logic
 */
async function createThread(): Promise<string> {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
          content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
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
          assistant_id: ASSISTANT_ID
        })
      });

      if (!runResponse.ok) {
        throw new Error(`HTTP ${runResponse.status}: ${runResponse.statusText}`);
      }

      const runData = await runResponse.json();
      const runId = runData.id;

      // Poll for completion with timeout
      let status = 'queued';
      let pollCount = 0;
      const maxPolls = 60; // 60 seconds timeout
      
      while ((status === 'queued' || status === 'in_progress') && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        pollCount++;
        
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
          throw new Error(`Assistant run failed: ${statusData.last_error?.message || 'Unknown error'}`);
        }
      }

      if (pollCount >= maxPolls) {
        throw new Error('Assistant run timed out');
      }

      if (status !== 'completed') {
        throw new Error(`Assistant run failed with status: ${status}`);
      }

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
 * Generates presentation outline using the custom assistant with improved error handling
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  try {
    const threadId = await createThread();
    
    const prompt = `
אתה עוזר מומחה ליצירת מבנה הרצאות. אנא צור מבנה הרצאה מותאם אישית על סמך המידע הבא:

נושא ההרצאה: ${sanitizeText(formData.idea)}
רקע המרצה: ${sanitizeText(formData.speakerBackground)}
פרופיל הקהל: ${sanitizeText(formData.audienceProfile)}
משך ההרצאה: ${formData.duration} דקות
התנגדויות נפוצות ואמונות מגבילות: ${sanitizeText(formData.commonObjections)}
מוצר או שירות לקידום: ${sanitizeText(formData.serviceOrProduct)}
קריאה לפעולה: ${sanitizeText(formData.callToAction)}

חשוב מאוד:
1. הקפד על פורמט JSON תקין בלבד
2. השתמש במרכאות כפולות בלבד
3. הימנע מעריכות בסוף השורות
4. וודא שכל מחרוזת עברית מסתיימת כהלכה

יש להחזיר JSON תקין במבנה הבא בלבד:
{
  "chapters": [
    {
      "title": "כותרת פרק 1",
      "points": [
        {"content": "נקודה 1"},
        {"content": "נקודה 2"},
        {"content": "נקודה 3"}
      ]
    }
  ],
  "openingStyles": ["סגנון 1", "סגנון 2", "סגנון 3"],
  "timeDistribution": "חלוקת זמנים",
  "interactiveActivities": ["פעילות 1", "פעילות 2", "פעילות 3"],
  "presentationStructure": "מבנה המצגת",
  "discussionQuestions": {
    "חלק 1": ["שאלה 1", "שאלה 2"],
    "חלק 2": ["שאלה 1", "שאלה 2"],
    "חלק 3": ["שאלה 1", "שאלה 2"]
  },
  "salesGuide": "מדריך מכירות",
  "postPresentationPlan": "תוכנית מעקב",
  "motivationalMessage": "הודעה מוטיבציונית",
  "salesProcess": [
    {
      "title": "כותרת שלב 1",
      "description": "תיאור השלב",
      "order": 1
    }
  ]
}

אנא הקפד על פורמט JSON תקין בלבד ללא תוספות טקסט.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    const parsedData = cleanAndParseJSON(response);
    
    if (!validateOutlineResponse(parsedData)) {
      throw new Error('Invalid response structure from AI assistant');
    }
    
    return parseApiResponse(JSON.stringify(parsedData));
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw error;
  }
}

/**
 * Generates dynamic slide structure using chunked approach
 */
export async function generateDynamicSlideStructure(formData: PresentationFormData, outline: PresentationOutline): Promise<SlideStructure[]> {
  try {
    const threadId = await createThread();
    
    const durationMinutes = parseInt(formData.duration);
    const estimatedSlides = Math.floor(durationMinutes * 0.8);
    
    const prompt = `
צור מבנה מפורט של שקפים להרצאה. הקפד על JSON תקין בלבד.

פרטי ההרצאה:
- נושא: ${sanitizeText(formData.idea)}
- משך: ${formData.duration} דקות (בערך ${estimatedSlides} שקפים)
- קהל: ${sanitizeText(formData.audienceProfile)}

דרישות למבנה השקפים:
1. פתיחה: 5 שקפים
2. כל פרק: 6-9 שקפים
3. מהלך מכירה: שקף לכל שלב
4. סיום: 3 שקפים

החזר JSON array של שקפים בפורמט:
[
  {
    "number": 1,
    "section": "פתיחה",
    "headline": "כותרת השקף",
    "content": "תוכן השקף",
    "visual": "הצעה ויזואלית",
    "notes": "הערות למרצה",
    "timeAllocation": "2 דקות",
    "engagementTip": "טיפ למעורבות",
    "transitionPhrase": "משפט מעבר"
  }
]

הקפד על JSON תקין בלבד.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    const slides = cleanAndParseJSON(response);
    
    if (!Array.isArray(slides)) {
      throw new Error('Expected array of slides from AI response');
    }
    
    return slides;
  } catch (error) {
    console.error("Error generating slide structure:", error);
    throw error;
  }
}

/**
 * Generates presentation tools and tips
 */
export async function generatePresentationTools(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  try {
    const threadId = await createThread();
    
    const prompt = `
על סמך מבנה ההרצאה ומידע המשתמש, צור כלים מעשיים להצגה:

נושא ההרצאה: "${formData.idea}"
רקע המרצה: "${formData.speakerBackground}"
פרופיל הקהל: "${formData.audienceProfile}"
משך ההרצאה: ${formData.duration} דקות

פרקי ההרצאה:
${outline.chapters.map((chapter, idx) => 
  `פרק ${idx + 1}: ${chapter.title}\n${chapter.points.map(point => `- ${point.content}`).join('\n')}`
).join('\n\n')}

אנא צור JSON עם הכלים הבאים:

{
  "openingSuggestions": [
    {
      "type": "סיפור אישי",
      "script": "סקריפט מפורט למשך 2-3 דקות",
      "tips": "טיפים לביצוע"
    }
  ],
  "chapterQuestions": {
    "פרק 1": [
      {
        "question": "שאלה למעורבות הקהל",
        "purpose": "מטרת השאלה",
        "expectedAnswers": ["תשובה אפשרית 1", "תשובה אפשרית 2"],
        "followUp": "איך להמשיך מהתשובות"
      }
    ]
  },
  "interactiveActivities": [
    {
      "activity": "שם הפעילות",
      "timing": "מתי לבצע",
      "duration": "כמה זמן",
      "instructions": "הוראות מפורטות",
      "materials": "מה צריך להכין"
    }
  ],
  "transitionPhrases": [
    {
      "from": "פתיחה",
      "to": "פרק 1",
      "phrase": "משפט מעבר חלק"
    }
  ],
  "engagementTechniques": [
    {
      "technique": "שם הטכניקה",
      "when": "מתי להשתמש",
      "howTo": "איך לבצע",
      "benefits": "יעילות הטכניקה"
    }
  ],
  "troubleshooting": [
    {
      "problem": "בעיה אפשרית",
      "solution": "פתרון מיידי",
      "prevention": "איך למנוע מראש"
    }
  ],
  "closingTechniques": [
    {
      "type": "סוג סיום",
      "script": "סקריפט לסיום",
      "callToAction": "קריאה לפעולה ספציפית"
    }
  ]
}

התאם הכל לתוכן הספציפי שהמשתמש הזין.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    // Parse the JSON response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const tools = JSON.parse(jsonMatch[0].includes('```') ? jsonMatch[1] : jsonMatch[0]);
      return tools;
    } else {
      throw new Error("Could not parse presentation tools from assistant response");
    }
  } catch (error) {
    console.error("Error generating presentation tools:", error);
    throw error;
  }
}

/**
 * Generates dynamic B2B email using the assistant with error handling
 */
export async function generateDynamicB2BEmail(formData: PresentationFormData, outline: PresentationOutline): Promise<string> {
  try {
    const threadId = await createThread();
    
    const prompt = `
כתב מייל פנייה B2B מקצועי בעברית להרצאה:

נושא: ${sanitizeText(formData.idea)}
רקע מרצה: ${sanitizeText(formData.speakerBackground)}
קהל יעד: ${sanitizeText(formData.audienceProfile)}
מוצר/שירות: ${sanitizeText(formData.serviceOrProduct)}

המייל צריך להיות 300-400 מילים, מקצועי וחם.
החזר רק את תוכן המייל ללא פורמט JSON.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    return response.trim();
  } catch (error) {
    console.error("Error generating B2B email:", error);
    throw error;
  }
}

/**
 * Generates dynamic sales strategy using the assistant with validation
 */
export async function generateDynamicSalesStrategy(formData: PresentationFormData, outline: PresentationOutline): Promise<DynamicSalesStrategy> {
  try {
    const threadId = await createThread();
    
    const prompt = `
צור אסטרטגיית שיווק ומכירות מותאמת:

נושא: ${sanitizeText(formData.idea)}
מוצר/שירות: ${sanitizeText(formData.serviceOrProduct)}
קהל: ${sanitizeText(formData.audienceProfile)}

החזר JSON בפורמט:
{
  "targetAudiences": ["קהל 1", "קהל 2"],
  "marketingChannels": [
    {
      "channel": "שם ערוץ",
      "strategy": "אסטרטגיה",
      "timeline": "זמן",
      "budget": "תקציב"
    }
  ],
  "pricingStrategy": {
    "basicTicket": "מחיר בסיסי",
    "vipTicket": "מחיר VIP",
    "premiumTicket": "מחיר פרמיום",
    "corporatePackage": "חבילה ארגונית"
  },
  "collaborationOpportunities": ["הזדמנות 1", "הזדמנות 2"],
  "contentMarketing": ["רעיון 1", "רעיון 2"],
  "followUpStrategy": "אסטרטגיית מעקב"
}

הקפד על JSON תקין בלבד.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    return cleanAndParseJSON(response);
  } catch (error) {
    console.error("Error generating sales strategy:", error);
    throw error;
  }
}

/**
 * Generates presentation tools and tips with enhanced structure
 */
export async function generatePresentationTools(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  try {
    const threadId = await createThread();
    
    const prompt = `
צור כלים מעשיים להצגה:

נושא: ${sanitizeText(formData.idea)}
רקע מרצה: ${sanitizeText(formData.speakerBackground)}
קהל: ${sanitizeText(formData.audienceProfile)}

החזר JSON בפורמט:
{
  "openingSuggestions": [
    {
      "type": "סוג פתיחה",
      "script": "סקריפט מפורט",
      "tips": "טיפים לביצוע"
    }
  ],
  "chapterQuestions": {
    "פרק 1": [
      {
        "question": "שאלה למעורבות",
        "purpose": "מטרת השאלה",
        "expectedAnswers": ["תשובה 1", "תשובה 2"],
        "followUp": "איך להמשיך"
      }
    ]
  },
  "interactiveActivities": [
    {
      "activity": "שם פעילות",
      "timing": "מתי לבצע",
      "duration": "משך זמן",
      "instructions": "הוראות",
      "materials": "חומרים נדרשים"
    }
  ],
  "transitionPhrases": [
    {
      "from": "מקטע מקור",
      "to": "מקטע יעד",
      "phrase": "משפט מעבר"
    }
  ],
  "engagementTechniques": [
    {
      "technique": "שם טכניקה",
      "when": "מתי להשתמש",
      "howTo": "איך לבצע",
      "benefits": "יעילות"
    }
  ],
  "troubleshooting": [
    {
      "problem": "בעיה אפשרית",
      "solution": "פתרון",
      "prevention": "מניעה"
    }
  ],
  "closingTechniques": [
    {
      "type": "סוג סיום",
      "script": "סקריפט",
      "callToAction": "קריאה לפעולה"
    }
  ]
}

הקפד על JSON תקין בלבד.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    return cleanAndParseJSON(response);
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
