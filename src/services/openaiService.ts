
import { PresentationFormData, PresentationOutline, Chapter } from '@/types/presentation';
import { generateId } from '@/utils/helpers';

// OpenAI API configuration
const OPENAI_API_KEY = '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';
const OPENAI_ORG_ID = 'org-fdnj54f725C7rUNxPVyt8jEA';

// Assistant configuration
const ASSISTANT_ID = 'asst_etLDYkL7Oj3ggr9IKpwmGE76';

/**
 * Creates a structured prompt for the OpenAI API based on user form data
 */
function createPrompt(formData: PresentationFormData): string {
  return `
  אתה עוזר מומחה ליצירת מבנה הרצאות. אנא צור מבנה הרצאה על סמך המידע הבא:
  
  נושא ההרצאה: ${formData.idea}
  רקע המרצה: ${formData.speakerBackground}
  פרופיל הקהל: ${formData.audienceProfile}
  משך ההרצאה: ${formData.duration} דקות
  מוצר או שירות: ${formData.serviceOrProduct}
  קריאה לפעולה: ${formData.callToAction}
  
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
}

/**
 * Creates a new thread using the Assistants API
 */
async function createThread(): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Organization': OPENAI_ORG_ID,
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create thread: ${errorData.error?.message || 'Unknown error'}`);
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
      content: content
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to add message: ${errorData.error?.message || 'Unknown error'}`);
  }
}

/**
 * Runs the assistant on the thread
 */
async function runAssistant(threadId: string): Promise<string> {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
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

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to run assistant: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.id;
}

/**
 * Polls the run status until completion
 */
async function pollRunStatus(threadId: string, runId: string): Promise<void> {
  const maxAttempts = 30; // 5 minutes max (10 second intervals)
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Organization': OPENAI_ORG_ID,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to check run status: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log(`Run status: ${data.status} (attempt ${attempts + 1})`);

    if (data.status === 'completed') {
      return;
    } else if (data.status === 'failed' || data.status === 'cancelled' || data.status === 'expired') {
      throw new Error(`Assistant run failed with status: ${data.status}`);
    }

    // Wait 10 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;
  }

  throw new Error('Assistant run timed out after 5 minutes');
}

/**
 * Retrieves the final message from the thread
 */
async function getThreadMessages(threadId: string): Promise<string> {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Organization': OPENAI_ORG_ID,
      'OpenAI-Beta': 'assistants=v2'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to retrieve messages: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Get the first message (most recent) from the assistant
  const assistantMessage = data.data.find((msg: any) => msg.role === 'assistant');
  
  if (!assistantMessage || !assistantMessage.content || assistantMessage.content.length === 0) {
    throw new Error('No response received from assistant');
  }

  // Extract text content from the message
  const textContent = assistantMessage.content.find((content: any) => content.type === 'text');
  
  if (!textContent) {
    throw new Error('No text content found in assistant response');
  }

  return textContent.text.value;
}

/**
 * Parses the API response and formats it to match our PresentationOutline interface
 */
function parseApiResponse(response: any): PresentationOutline {
  try {
    let parsedResponse;
    
    // Check if response is already an object or needs parsing
    if (typeof response === 'string') {
      // Extract JSON from the message (handle potential markdown formatting)
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```([\s\S]*?)```/);
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        // Try to parse the whole content as JSON
        parsedResponse = JSON.parse(response);
      }
    } else {
      parsedResponse = response;
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

/**
 * Generates a presentation outline using the OpenAI Assistants API
 */
export async function generatePresentationOutline(
  formData: PresentationFormData
): Promise<PresentationOutline> {
  try {
    console.log('Starting Assistants API workflow...');
    
    const prompt = createPrompt(formData);
    
    // Step 1: Create a new thread
    console.log('Creating new thread...');
    const threadId = await createThread();
    console.log(`Thread created: ${threadId}`);
    
    // Step 2: Add the user message to the thread
    console.log('Adding message to thread...');
    await addMessageToThread(threadId, prompt);
    
    // Step 3: Run the assistant
    console.log('Running assistant...');
    const runId = await runAssistant(threadId);
    console.log(`Assistant run started: ${runId}`);
    
    // Step 4: Poll until completion
    console.log('Polling for completion...');
    await pollRunStatus(threadId, runId);
    console.log('Assistant run completed');
    
    // Step 5: Retrieve the response
    console.log('Retrieving messages...');
    const responseContent = await getThreadMessages(threadId);
    
    // Step 6: Parse the response
    console.log('Parsing response...');
    return parseApiResponse(responseContent);
    
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw error;
  }
}
