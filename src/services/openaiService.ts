
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
 * Generates presentation outline using the custom assistant with improved error handling
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  try {
    console.log('Generating presentation outline...');
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
5. השתמש בטקסט קצר וברור

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
    
    console.log('Presentation outline generated successfully');
    return parseApiResponse(JSON.stringify(parsedData));
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw error;
  }
}

/**
 * Generates dynamic slide structure using chunked approach with enhanced error handling
 */
export async function generateDynamicSlideStructure(formData: PresentationFormData, outline: PresentationOutline): Promise<SlideStructure[]> {
  try {
    console.log('Generating dynamic slide structure...');
    const threadId = await createThread();
    
    const durationMinutes = parseInt(formData.duration);
    const estimatedSlides = Math.min(Math.floor(durationMinutes * 0.8), 25); // Cap at 25 slides
    
    const prompt = `
צור מבנה מפורט של שקפים להרצאה. הקפד על JSON תקין בלבד.

פרטי ההרצאה:
- נושא: ${sanitizeText(formData.idea)}
- משך: ${formData.duration} דקות (בערך ${estimatedSlides} שקפים)
- קהל: ${sanitizeText(formData.audienceProfile)}

דרישות למבנה השקפים:
1. פתיחה: 3 שקפים
2. כל פרק: 4-6 שקפים
3. מהלך מכירה: 3 שקפים
4. סיום: 2 שקפים

החזר JSON array של שקפים בפורמט (מקסימום ${estimatedSlides} שקפים):
[
  {
    "number": 1,
    "section": "פתיחה",
    "headline": "כותרת השקף",
    "content": "תוכן השקף - טקסט קצר",
    "visual": "הצעה ויזואלית - טקסט קצר",
    "notes": "הערות למרצה - טקסט קצר",
    "timeAllocation": "2 דקות",
    "engagementTip": "טיפ למעורבות - טקסט קצר",
    "transitionPhrase": "משפט מעבר - טקסט קצר"
  }
]

הקפד על JSON תקין בלבד. השתמש בטקסט קצר וברור.
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
 * Generates dynamic B2B email using the assistant with error handling
 */
export async function generateDynamicB2BEmail(formData: PresentationFormData, outline: PresentationOutline): Promise<string> {
  try {
    console.log('Generating dynamic B2B email...');
    const threadId = await createThread();
    
    const prompt = `
כתב מייל פנייה B2B מקצועי בעברית להרצאה:

נושא: ${sanitizeText(formData.idea)}
רקע מרצה: ${sanitizeText(formData.speakerBackground)}
קהל יעד: ${sanitizeText(formData.audienceProfile)}
מוצר/שירות: ${sanitizeText(formData.serviceOrProduct)}

המייל צריך להיות 250-350 מילים, מקצועי וחם.
החזר רק את תוכן המייל ללא פורמט JSON או תגיות נוספות.
השתמש בעברית פשוטה וברורה.
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
 * Generates dynamic sales strategy using the assistant with validation
 */
export async function generateDynamicSalesStrategy(formData: PresentationFormData, outline: PresentationOutline): Promise<DynamicSalesStrategy> {
  try {
    console.log('Generating dynamic sales strategy...');
    const threadId = await createThread();
    
    const prompt = `
צור אסטרטגיית שיווק ומכירות מותאמת:

נושא: ${sanitizeText(formData.idea)}
מוצר/שירות: ${sanitizeText(formData.serviceOrProduct)}
קהל: ${sanitizeText(formData.audienceProfile)}

החזר JSON בפורמט קצר וברור:
{
  "targetAudiences": ["קהל 1", "קהל 2"],
  "marketingChannels": [
    {
      "channel": "שם ערוץ",
      "strategy": "אסטרטגיה קצרה",
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
  "followUpStrategy": "אסטרטגיית מעקב קצרה"
}

הקפד על JSON תקין בלבד. השתמש בטקסט קצר.
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
 * Generates presentation tools and tips with enhanced structure
 */
export async function generatePresentationTools(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  try {
    console.log('Generating presentation tools...');
    const threadId = await createThread();
    
    const prompt = `
צור כלים מעשיים להצגה:

נושא: ${sanitizeText(formData.idea)}
רקע מרצה: ${sanitizeText(formData.speakerBackground)}
קהל: ${sanitizeText(formData.audienceProfile)}

החזר JSON בפורמט קצר:
{
  "openingSuggestions": [
    {
      "type": "סוג פתיחה",
      "script": "סקריפט קצר",
      "tips": "טיפים קצרים לביצוע"
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
      "instructions": "הוראות קצרות",
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

הקפד על JSON תקין בלבד. השתמש בטקסט קצר וברור.
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
