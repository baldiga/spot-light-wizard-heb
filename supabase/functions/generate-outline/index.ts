
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
    
    // Remove markdown formatting
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON boundaries more reliably
    const jsonStart = cleanResponse.indexOf('{');
    let jsonEnd = -1;
    
    // Find the matching closing brace
    if (jsonStart !== -1) {
      let braceCount = 0;
      for (let i = jsonStart; i < cleanResponse.length; i++) {
        if (cleanResponse[i] === '{') braceCount++;
        if (cleanResponse[i] === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No valid JSON object found in response');
      throw new Error('No JSON object found in response');
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    
    // More aggressive JSON cleaning
    cleanResponse = cleanResponse
      // Remove trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix unquoted keys
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
      // Fix single quotes to double quotes
      .replace(/:\s*'([^']*)'/g, ': "$1"')
      // Remove unicode characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Clean up newlines and whitespace
      .replace(/\r/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    // Attempt to fix common JSON issues
    cleanResponse = cleanResponse
      // Fix missing quotes around string values
      .replace(/:\s*([^",{\[\]}\s]+)(?=\s*[,}])/g, ': "$1"')
      // Fix double quotes inside strings
      .replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1$2$3":')
      // Remove any remaining trailing commas
      .replace(/,(\s*[}\]])/g, '$1');
    
    console.log('Attempting to parse cleaned JSON...');
    const parsed = JSON.parse(cleanResponse);
    console.log('Successfully parsed JSON');
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Problematic JSON:', cleanResponse?.substring(0, 500));
    
    // Fallback: try to create a minimal valid structure
    return {
      chapters: [
        {
          title: "מבוא לנושא",
          points: [
            {"content": "נקודה ראשונה"},
            {"content": "נקודה שנייה"},
            {"content": "נקודה שלישית"}
          ]
        },
        {
          title: "פרק שני",
          points: [
            {"content": "נקודה ראשונה"},
            {"content": "נקודה שנייה"},
            {"content": "נקודה שלישית"}
          ]
        },
        {
          title: "פרק שלישי",
          points: [
            {"content": "נקודה ראשונה"},
            {"content": "נקודה שנייה"},
            {"content": "נקודה שלישית"}
          ]
        },
        {
          title: "סיכום ומסקנות",
          points: [
            {"content": "נקודה ראשונה"},
            {"content": "נקודה שנייה"},
            {"content": "נקודה שלישית"}
          ]
        }
      ],
      openingStyles: [
        "פתיחה בסיפור אישי",
        "פתיחה בשאלה רטורית",
        "פתיחה בעובדה מפתיעה"
      ],
      timeDistribution: "חלוקת זמנים מותאמת",
      presentationStructure: "מבנה מותאם לנושא",
      salesGuide: "מדריך מכירות",
      motivationalMessage: "הודעה מעודדת",
      salesProcess: Array.from({ length: 10 }, (_, i) => ({
        title: `שלב מכירה ${i + 1}`,
        description: `תיאור של שלב ${i + 1}`,
        order: i + 1
      }))
    };
  }
}

async function callOpenAI(prompt: string): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Making OpenAI API call with gpt-4o-mini...');
  
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
          content: 'אתה מומחה ליצירת הרצאות מקצועיות בעברית. תמיד החזר JSON תקין וספציפי לנושא המבוקש. ודא שה-JSON שלך תקין ללא שגיאות תחביר.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
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
אתה יועץ מקצועי ליצירת מבנה הרצאות. צור מבנה הרצאה עם בדיוק 4 פרקים ו-10 שלבי מכירה.

פרטי ההרצאה:
- נושא: "${sanitizeText(formData.idea)}"
- רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
- קהל יעד: "${sanitizeText(formData.audienceProfile)}"
- משך: ${formData.duration} דקות
- מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"
- קריאה לפעולה: "${sanitizeText(formData.callToAction)}"

הוראות חשובות:
1. צור בדיוק 4 פרקים - לא פחות ולא יותר
2. כל פרק עם 3-4 נקודות ספציפיות לנושא
3. חובה ליצור בדיוק 10 שלבי מכירה
4. התוכן חייב להיות ספציפי לנושא "${formData.idea}"

החזר JSON תקין במבנה הבא:
{
  "chapters": [
    {
      "title": "כותרת פרק 1 ספציפית לנושא ${formData.idea}",
      "points": [
        {"content": "נקודה ספציפית 1"},
        {"content": "נקודה ספציפית 2"},
        {"content": "נקודה ספציפית 3"}
      ]
    },
    {
      "title": "כותרת פרק 2",
      "points": [
        {"content": "נקודה ספציפית 1"},
        {"content": "נקודה ספציפית 2"},
        {"content": "נקודה ספציפית 3"}
      ]
    },
    {
      "title": "כותרת פרק 3",
      "points": [
        {"content": "נקודה ספציפית 1"},
        {"content": "נקודה ספציפית 2"},
        {"content": "נקודה ספציפית 3"}
      ]
    },
    {
      "title": "כותרת פרק 4",
      "points": [
        {"content": "נקודה ספציפית 1"},
        {"content": "נקודה ספציפית 2"},
        {"content": "נקודה ספציפית 3"}
      ]
    }
  ],
  "openingStyles": [
    "פתיחה ספציפית לנושא ${formData.idea}",
    "פתיחה המתאימה לקהל ${formData.audienceProfile}",
    "פתיחה המבוססת על ${formData.speakerBackground}"
  ],
  "timeDistribution": "חלוקת זמנים ל${formData.duration} דקות עבור 4 פרקים",
  "presentationStructure": "מבנה מותאם לנושא ${formData.idea} ולקהל ${formData.audienceProfile}",
  "salesGuide": "מדריך מכירות עבור ${formData.serviceOrProduct}",
  "motivationalMessage": "הודעה מעודדת שמתייחסת לרקע ${formData.speakerBackground}",
  "salesProcess": [
    {
      "title": "שלב מכירה ראשון מותאם ל${formData.serviceOrProduct}",
      "description": "תיאור ספציפי לנושא ${formData.idea}",
      "order": 1
    },
    {
      "title": "שלב מכירה שני",
      "description": "תיאור שני",
      "order": 2
    },
    {
      "title": "שלב מכירה שלישי",
      "description": "תיאור שלישי",
      "order": 3
    },
    {
      "title": "שלב מכירה רביעי",
      "description": "תיאור רביעי",
      "order": 4
    },
    {
      "title": "שלב מכירה חמישי",
      "description": "תיאור חמישי",
      "order": 5
    },
    {
      "title": "שלב מכירה שישי",
      "description": "תיאור שישי",
      "order": 6
    },
    {
      "title": "שלב מכירה שביעי",
      "description": "תיאור שביעי",
      "order": 7
    },
    {
      "title": "שלב מכירה שמיני",
      "description": "תיאור שמיני",
      "order": 8
    },
    {
      "title": "שלב מכירה תשיעי",
      "description": "תיאור תשיעי",
      "order": 9
    },
    {
      "title": "שלב מכירה עשירי",
      "description": "תיאור עשירי - סיום וקריאה לפעולה",
      "order": 10
    }
  ]
}

חשוב: בדיוק 4 פרקים ו-10 שלבי מכירה!
  `;

  return await callOpenAI(prompt);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    
    console.log('Generating outline for topic:', formData.idea);

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
