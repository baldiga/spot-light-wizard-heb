
import { PresentationFormData, PresentationOutline, Chapter } from '@/types/presentation';
import { generateId } from '@/utils/helpers';

// OpenAI API configuration
const OPENAI_API_KEY = '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';
const OPENAI_ORG_ID = 'org-fdnj54f725C7rUNxPVyt8jEA';

// Use gpt-3.5-turbo for cost efficiency
const MODEL = 'gpt-3.5-turbo';
const TEMPERATURE = 0.7; // Balanced approach

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
 * Parses the API response and formats it to match our PresentationOutline interface
 */
function parseApiResponse(response: any): PresentationOutline {
  try {
    let parsedResponse;
    
    // Check if response is already an object or needs parsing
    if (typeof response === 'string') {
      parsedResponse = JSON.parse(response);
    } else if (response.choices && response.choices[0] && response.choices[0].message) {
      // Extract the message content from the OpenAI response
      const content = response.choices[0].message.content;
      
      // Extract JSON from the message (handle potential markdown formatting)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        // Try to parse the whole content as JSON
        parsedResponse = JSON.parse(content);
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
 * Generates a presentation outline based on form data using the OpenAI API
 */
export async function generatePresentationOutline(
  formData: PresentationFormData
): Promise<PresentationOutline> {
  try {
    const prompt = createPrompt(formData);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Organization': OPENAI_ORG_ID
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert presentation structure assistant. Respond only with JSON in the specified format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: TEMPERATURE,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to communicate with the OpenAI API');
    }
    
    const data = await response.json();
    return parseApiResponse(data);
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw error;
  }
}
