
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
אתה יועץ מקצועי ליצירת הרצאות מותאמות אישית. צור מבנה הרצאה מפורט ומותאם אישית.

פרטי ההרצאה:
- נושא: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"
- משך: ${formData.duration} דקות
- התנגדויות: "${sanitizeText(formData.commonObjections)}"
- מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"
- קריאה לפעולה: "${sanitizeText(formData.callToAction)}"

הוראות חשובות:
1. צור תוכן ספציפי לנושא "${formData.idea}" - לא תוכן גנרי
2. התבסס על רקע המרצה: "${formData.speakerBackground}"
3. התאם לקהל: "${formData.audienceProfile}"
4. כל פרק חייב להתקשר ישירות לנושא הספציפי
5. השתמש במושגים ובדוגמאות מהתחום הרלוונטי
6. התייחס לחששות הספציפיים: "${formData.commonObjections}"

החזר JSON תקין במבנה הבא:
{
  "chapters": [
    {
      "title": "כותרת פרק ספציפית לנושא ${formData.idea}",
      "points": [
        {"content": "נקודה ספציפית הקשורה ל${formData.idea} ולרקע ${formData.speakerBackground}"},
        {"content": "תובנה מעשית לקהל ${formData.audienceProfile}"},
        {"content": "דוגמה קונקרטית מהתחום"}
      ]
    }
  ],
  "openingStyles": [
    "פתיחה ספציפית לנושא ${formData.idea}",
    "פתיחה המתאימה לקהל ${formData.audienceProfile}",
    "פתיחה המבוססת על ${formData.speakerBackground}"
  ],
  "timeDistribution": "חלוקת זמנים ל${formData.duration} דקות עבור ${formData.idea}",
  "interactiveActivities": [
    "פעילות רלוונטית לנושא ${formData.idea}",
    "אינטראקציה מתאימה לקהל ${formData.audienceProfile}"
  ],
  "presentationStructure": "מבנה מותאם לנושא ${formData.idea} ולקהל ${formData.audienceProfile}",
  "discussionQuestions": {
    "פרק 1": ["שאלה ספציפית לנושא ${formData.idea}"],
    "פרק 2": ["שאלה נוספת על ${formData.idea}"]
  },
  "salesGuide": "מדריך מכירות עבור ${formData.serviceOrProduct} בהקשר של ${formData.idea}",
  "postPresentationPlan": "תוכנית מעקב לקהל ${formData.audienceProfile} עבור ${formData.serviceOrProduct}",
  "motivationalMessage": "הודעה מעודדת שמתייחסת לרקע ${formData.speakerBackground} ולנושא ${formData.idea}",
  "salesProcess": [
    {
      "title": "שלב מכירה מותאם ל${formData.serviceOrProduct}",
      "description": "תיאור ספציפי לנושא ${formData.idea}",
      "order": 1
    }
  ]
}

חשוב: כל התוכן חייב להיות ספציפי לנושא "${formData.idea}" ולא גנרי!
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
