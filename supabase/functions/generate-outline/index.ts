
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
  let cleanResponse = response;
  
  try {
    console.log('Raw AI response length:', response.length);
    console.log('First 200 chars:', response.substring(0, 200));
    
    // Remove markdown formatting
    cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
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
    
    // Clean up problematic characters for Hebrew text
    cleanResponse = cleanResponse
      // Remove control characters but preserve Hebrew characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Remove unicode BOM and other problematic characters
      .replace(/[\uFEFF\u200B-\u200D]/g, '')
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, '$1')
      // Clean up newlines and excessive whitespace
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    console.log('Cleaned response length:', cleanResponse.length);
    console.log('Cleaned first 200 chars:', cleanResponse.substring(0, 200));
    
    const parsed = JSON.parse(cleanResponse);
    console.log('Successfully parsed JSON');
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error.message);
    console.error('Problematic JSON section:', cleanResponse.substring(0, 500));
    
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
          title: "פיתוח הרעיון",
          points: [
            {"content": "נקודה ראשונה"},
            {"content": "נקודה שנייה"},
            {"content": "נקודה שלישית"}
          ]
        },
        {
          title: "יישום מעשי",
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
          content: 'אתה מומחה ליצירת הרצאות מקצועיות בעברית. תמיד החזר JSON תקין בלבד ללא כל טקסט נוסף. ודא שה-JSON שלך תקין ללא שגיאות תחביר ואותיות בקרה.'
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

החזר אך ורק JSON תקין במבנה הבא (ללא טקסט נוסף):

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
    {
      "title": "כותרת פרק 2",
      "points": [
        {"content": "נקודה 1"},
        {"content": "נקודה 2"},
        {"content": "נקודה 3"}
      ]
    },
    {
      "title": "כותרת פרק 3",
      "points": [
        {"content": "נקודה 1"},
        {"content": "נקודה 2"},
        {"content": "נקודה 3"}
      ]
    },
    {
      "title": "כותרת פרק 4",
      "points": [
        {"content": "נקודה 1"},
        {"content": "נקודה 2"},
        {"content": "נקודה 3"}
      ]
    }
  ],
  "openingStyles": [
    "פתיחה ראשונה",
    "פתיחה שנייה",
    "פתיחה שלישית"
  ],
  "timeDistribution": "חלוקת זמנים",
  "presentationStructure": "מבנה הרצאה",
  "salesGuide": "מדריך מכירות",
  "motivationalMessage": "הודעה מעודדת",
  "salesProcess": [
    {"title": "שלב 1", "description": "תיאור", "order": 1},
    {"title": "שלב 2", "description": "תיאור", "order": 2},
    {"title": "שלב 3", "description": "תיאור", "order": 3},
    {"title": "שלב 4", "description": "תיאור", "order": 4},
    {"title": "שלב 5", "description": "תיאור", "order": 5},
    {"title": "שלב 6", "description": "תיאור", "order": 6},
    {"title": "שלב 7", "description": "תיאור", "order": 7},
    {"title": "שלב 8", "description": "תיאור", "order": 8},
    {"title": "שלב 9", "description": "תיאור", "order": 9},
    {"title": "שלב 10", "description": "תיאור", "order": 10}
  ]
}

חשוב: החזר אך ורק JSON תקין, ללא markdown או טקסט נוסף!
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
