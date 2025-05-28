
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
    console.log('Response preview:', response.substring(0, 500));
    
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
      .replace(/\\/g, '\\\\') // Escape backslashes
      .trim();
    
    console.log('Cleaned JSON preview:', cleanResponse.substring(0, 500));
    
    // Validate JSON before parsing
    const parsed = JSON.parse(cleanResponse);
    console.log('Successfully parsed JSON with chapters:', parsed.chapters?.length);
    
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Raw response preview:', response.substring(0, 1000));
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

async function callOpenAI(prompt: string): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Making OpenAI API call with gpt-4o...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert presentation architect. Return only valid JSON in the exact format requested. Do not include any explanations or markdown formatting outside the JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7
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
צור מבנה הרצאה מקצועי ומותאם אישית עבור:

נושא: "${sanitizeText(formData.idea)}"
רקע המרצה: "${sanitizeText(formData.speakerBackground)}"
פרופיל קהל: "${sanitizeText(formData.audienceProfile)}"
משך זמן: ${formData.duration} דקות
התנגדויות צפויות: "${sanitizeText(formData.commonObjections)}"
מוצר/שירות: "${sanitizeText(formData.serviceOrProduct)}"
קריאה לפעולה: "${sanitizeText(formData.callToAction)}"

צור מבנה הרצאה המכיל בדיוק 4 פרקים ו-10 שלבי מכירה, המבוסס על עקרונות פסיכולוגיים ושכנוע.

כל פרק צריך:
- כותרת משכנעת ורלוונטית לנושא
- 3-4 נקודות תוכן מפורטות
- התייחסות לקהל הספציפי ולרקע המרצה

10 שלבי המכירה צריכים להיות משולבים באופן טבעי ולא פולשני בהרצאה.

החזר JSON תקין במבנה הבא:

{
  "chapters": [
    {
      "title": "כותרת פרק רלוונטית לנושא",
      "points": [
        {
          "content": "נקודת תוכן מפורטת המתייחסת לקהל ולנושא"
        }
      ]
    }
  ],
  "openingStyles": [
    "הצעה לפתיחה מעניינת מספר 1",
    "הצעה לפתיחה מעניינת מספר 2",
    "הצעה לפתיחה מעניינת מספר 3"
  ],
  "timeDistribution": "חלוקת זמנים מומלצת לפי משך ההרצאה",
  "presentationStructure": "מבנה ההרצאה הכללי",
  "salesGuide": "מדריך מכירות מותאם לנושא ולקהל",
  "motivationalMessage": "הודעה מעודדת למרצה",
  "salesProcess": [
    {
      "title": "שלב מכירה מספר 1",
      "description": "תיאור מפורט של השלב",
      "order": 1
    }
  ]
}

חשוב: החזר רק JSON תקין, ללא הסברים נוספים או עיצוב markdown.
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

    // Validate the result structure
    if (!result.chapters || !Array.isArray(result.chapters)) {
      throw new Error('Invalid response structure: missing chapters array');
    }

    if (result.chapters.length !== 4) {
      console.warn(`Expected 4 chapters, got ${result.chapters.length}`);
    }

    if (!result.salesProcess || !Array.isArray(result.salesProcess)) {
      console.warn('Missing or invalid salesProcess array');
      result.salesProcess = [];
    }

    if (result.salesProcess.length !== 10) {
      console.warn(`Expected 10 sales process steps, got ${result.salesProcess.length}`);
    }

    console.log('Successfully generated outline with', result.chapters.length, 'chapters and', result.salesProcess.length, 'sales steps');

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
