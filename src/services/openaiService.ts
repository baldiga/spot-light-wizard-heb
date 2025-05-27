import { PresentationFormData, PresentationOutline, Chapter, SlideStructure, DynamicSalesStrategy } from '@/types/presentation';
import { generateId } from '@/utils/helpers';

// OpenAI API configuration
const OPENAI_API_KEY = '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';
const OPENAI_ORG_ID = 'org-fdnj54f725C7rUNxPVyt8jEA';

// Custom assistant ID
const ASSISTANT_ID = 'asst_etLDYkL7Oj3ggr9IKpwmGE76';

/**
 * Creates a thread for assistant conversation
 */
async function createThread(): Promise<string> {
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
    throw new Error('Failed to create thread');
  }

  const data = await response.json();
  return data.id;
}

/**
 * Adds a message to the thread
 */
async function addMessageToThread(threadId: string, content: string): Promise<void> {
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
    throw new Error('Failed to add message to thread');
  }
}

/**
 * Runs the assistant and waits for completion
 */
async function runAssistant(threadId: string): Promise<string> {
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
    throw new Error('Failed to start assistant run');
  }

  const runData = await runResponse.json();
  const runId = runData.id;

  // Poll for completion
  let status = 'queued';
  while (status === 'queued' || status === 'in_progress') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Organization': OPENAI_ORG_ID,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!statusResponse.ok) {
      throw new Error('Failed to check run status');
    }

    const statusData = await statusResponse.json();
    status = statusData.status;
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
    throw new Error('Failed to retrieve messages');
  }

  const messagesData = await messagesResponse.json();
  const lastMessage = messagesData.data[0];
  
  return lastMessage.content[0].text.value;
}

/**
 * Generates presentation outline using the custom assistant
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  try {
    const threadId = await createThread();
    
    const prompt = `
אתה עוזר מומחה ליצירת מבנה הרצאות. אנא צור מבנה הרצאה על סמך המידע הבא:

נושא ההרצאה: ${formData.idea}
רקע המרצה: ${formData.speakerBackground}
פרופיל הקהל: ${formData.audienceProfile}
משך ההרצאה: ${formData.duration} דקות
התנגדויות נפוצות ואמונות מגבילות: ${formData.commonObjections}
מוצר או שירות: ${formData.serviceOrProduct}
קריאה לפעולה: ${formData.callToAction}

חשוב מאוד: בנה את ההרצאה כך שתתמודד עם ההתנגדויות והאמונות המגבילות שצוינו. הרצאה טובה היא כמו שיחת מכירה שמתמודדת עם התנגדויות בצורה טבעית ללא שיכול את הקהל.

יש לענות בעברית בלבד ולהחזיר תוכן במבנה JSON הכולל:
1. שלושה פרקים עיקריים (chapters) עם כותרת ו-3 נקודות מרכזיות לכל פרק
2. סגנונות פתיחה אפשריים (openingStyles)
3. חלוקת זמנים מומלצת (timeDistribution)
4. פעילויות אינטראקטיביות מומלצות (interactiveActivities)
5. מבנה המצגת הכולל (presentationStructure)
6. שאלות לדיון לפי חלקים (discussionQuestions)
7. מדריך מכירות (salesGuide) אם רלוונטי למוצר/שירות
8. תוכנית למעקב לאחר ההרצאה (postPresentationPlan)

נדרש מבנה JSON כדלקמן:
{
  "chapters": [
    {
      "title": "כותרת פרק 1",
      "points": [
        {"content": "נקודה 1"},
        {"content": "נקודה 2"},
        {"content": "נקודה 3"}
      ]
    },
    // chapters 2 and 3...
  ],
  "openingStyles": ["סגנון 1", "סגנון 2", "סגנון 3"],
  "timeDistribution": "חלוקת זמנים מפורטת",
  "interactiveActivities": ["פעילות 1", "פעילות 2", "פעילות 3"],
  "presentationStructure": "מבנה המצגת המוצע",
  "discussionQuestions": {
    "חלק 1": ["שאלה 1", "שאלה 2"],
    "חלק 2": ["שאלה 1", "שאלה 2"],
    "חלק 3": ["שאלה 1", "שאלה 2"]
  },
  "salesGuide": "מדריך מכירות",
  "postPresentationPlan": "תוכנית למעקב"
}

אנא הקפד על פורמט זה בדיוק, כדי שהמערכת תוכל לעבד את התשובה.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    return parseApiResponse(response);
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw error;
  }
}

/**
 * Generates dynamic slide structure using the assistant
 */
export async function generateDynamicSlideStructure(formData: PresentationFormData, outline: PresentationOutline): Promise<SlideStructure[]> {
  try {
    const threadId = await createThread();
    
    const prompt = `
על סמך מבנה ההרצאה הבא, אנא צור מבנה מפורט למצגת שקף אחר שקף:

נושא ההרצאה: ${formData.idea}
רקע המרצה: ${formData.speakerBackground}
פרופיל הקהל: ${formData.audienceProfile}
משך ההרצאה: ${formData.duration} דקות
התנגדויות נפוצות ואמונות מגבילות: ${formData.commonObjections}
מוצר או שירות: ${formData.serviceOrProduct}

פרקי ההרצאה:
${outline.chapters.map((chapter, idx) => 
  `פרק ${idx + 1}: ${chapter.title}\n${chapter.points.map(point => `- ${point.content}`).join('\n')}`
).join('\n\n')}

חשוב: הקפד לבנות את השקפים כך שיתמודדו עם ההתנגדויות והאמונות המגבילות שצוינו.

אנא צור מבנה מפורט של שקפים במבנה JSON הבא:
[
  {
    "number": 1,
    "headline": "כותרת השקף",
    "content": "תוכן מפורט של השקף",
    "visual": "הצעה לאלמנטים ויזואליים",
    "notes": "הערות למרצה",
    "timeAllocation": "זמן מוקדש בדקות"
  }
]

הקפד על:
1. חלוקה הגיונית של התוכן לשקפים
2. פירוק רעיונות מורכבים למספר שקפים
3. שקפי מעבר בין פרקים
4. שקפי פתיחה וסיכום
5. שקפים להדגמות והצגת המוצר/שירות
6. התאמה למשך ההרצאה (${formData.duration} דקות)
7. שקפים שמתמודדים עם ההתנגדויות הנפוצות
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    // Parse the JSON response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\[([\s\S]*?)\]/);
    
    if (jsonMatch) {
      const slides = JSON.parse(jsonMatch[0].includes('```') ? jsonMatch[1] : jsonMatch[0]);
      return slides;
    } else {
      throw new Error("Could not parse slide structure from assistant response");
    }
  } catch (error) {
    console.error("Error generating slide structure:", error);
    throw error;
  }
}

/**
 * Generates dynamic B2B email using the assistant
 */
export async function generateDynamicB2BEmail(formData: PresentationFormData, outline: PresentationOutline): Promise<string> {
  try {
    const threadId = await createThread();
    
    const prompt = `
אנא כתב מייל פנייה B2B מקצועי לארגונים בעברית על סמך המידע הבא:

נושא ההרצאה: ${formData.idea}
רקע המרצה: ${formData.speakerBackground}
פרופיל הקהל: ${formData.audienceProfile}
משך ההרצאה: ${formData.duration} דקות
התנגדויות נפוצות ואמונות מגבילות: ${formData.commonObjections}
מוצר או שירות: ${formData.serviceOrProduct}
קריאה לפעולה: ${formData.callToAction}

פרקי ההרצאה:
${outline.chapters.map((chapter, idx) => 
  `${idx + 1}. ${chapter.title}`
).join('\n')}

חשוב: הקפד לכתוב מייל שמתמודד עם ההתנגדויות והאמונות המגבילות שצוינו.

דרישות למייל:
1. נושא מעניין וחודר
2. פתיחה עם סיפור או נתון מעניין
3. הצגת הערך הייחודי של ההרצאה
4. פירוט קצר של התועלות למשתתפים
5. התמודדות עדינה עם התנגדויות נפוצות
6. קריאה לפעולה ברורה
7. טון מקצועי אך חם ואישי
8. התייחסות ספציפית לתחום הקהל
9. עברית ברמה גבוהה

המייל צריך להיות ברמה של 300-400 מילים ולכלול את כל החלקים הנדרשים.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    return response;
  } catch (error) {
    console.error("Error generating B2B email:", error);
    throw error;
  }
}

/**
 * Generates dynamic sales strategy using the assistant
 */
export async function generateDynamicSalesStrategy(formData: PresentationFormData, outline: PresentationOutline): Promise<DynamicSalesStrategy> {
  try {
    const threadId = await createThread();
    
    const prompt = `
על סמך המידע הבא, אנא צור אסטרטגיית שיווק ומכירות מותאמת אישית:

נושא ההרצאה: ${formData.idea}
רקע המרצה: ${formData.speakerBackground}
פרופיל הקהל: ${formData.audienceProfile}
מוצר או שירות: ${formData.serviceOrProduct}
קריאה לפעולה: ${formData.callToAction}

אנא צור תוכנית מפורטת במבנה JSON הבא:
{
  "targetAudiences": ["קהל יעד 1", "קהל יעד 2", "קהל יעד 3"],
  "marketingChannels": [
    {
      "channel": "שם הערוץ",
      "strategy": "אסטרטגיה מפורטת",
      "timeline": "ציר זמן",
      "budget": "תקציב מוערך"
    }
  ],
  "pricingStrategy": {
    "basicTicket": "מחיר בסיסי והסבר",
    "vipTicket": "מחיר VIP והטבות",
    "premiumTicket": "מחיר פרמיום והטבות",
    "corporatePackage": "חבילה ארגונית"
  },
  "collaborationOpportunities": [
    "הזדמנות שיתוף 1",
    "הזדמנות שיתוף 2"
  ],
  "contentMarketing": [
    "רעיון תוכן 1",
    "רעיון תוכן 2"
  ],
  "followUpStrategy": "אסטרטגיית מעקב מפורטת"
}

התאם את האסטרטגיה לתחום הספציפי ולקהל היעד.
    `;

    await addMessageToThread(threadId, prompt);
    const response = await runAssistant(threadId);
    
    // Parse the JSON response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const strategy = JSON.parse(jsonMatch[0].includes('```') ? jsonMatch[1] : jsonMatch[0]);
      return strategy;
    } else {
      throw new Error("Could not parse sales strategy from assistant response");
    }
  } catch (error) {
    console.error("Error generating sales strategy:", error);
    throw error;
  }
}

/**
 * Parses the API response and formats it to match our PresentationOutline interface
 */
function parseApiResponse(response: string): PresentationOutline {
  try {
    // Extract JSON from the message (handle potential markdown formatting)
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
    
    let parsedResponse;
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0].includes('```') ? jsonMatch[1] : jsonMatch[0]);
    } else {
      // Try to parse the whole content as JSON
      parsedResponse = JSON.parse(response);
    }
    
    // Add IDs to chapters and points
    const chaptersWithIds = parsedResponse.chapters.map((chapter: any) => ({
      id: generateId(),
      title: chapter.title,
      points: chapter.points.map((point: any) => ({
        id: generateId(),
        content: point.content
      }))
    }));
    
    return {
      chapters: chaptersWithIds,
      openingStyles: parsedResponse.openingStyles || [],
      timeDistribution: parsedResponse.timeDistribution || "",
      interactiveActivities: parsedResponse.interactiveActivities || [],
      presentationStructure: parsedResponse.presentationStructure || "",
      discussionQuestions: parsedResponse.discussionQuestions || {},
      salesGuide: parsedResponse.salesGuide || "",
      postPresentationPlan: parsedResponse.postPresentationPlan || ""
    };
  } catch (error) {
    console.error("Error parsing API response:", error);
    throw new Error("Failed to parse the AI response. Please try again.");
  }
}
