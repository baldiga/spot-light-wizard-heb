
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
    
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    
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

async function callOpenAI(prompt: string): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Making OpenAI API call with o1-mini...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'o1-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_completion_tokens: 2000
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

async function generateEmailContent(formData: any, outline: any): Promise<any> {
  const prompt = `
אתה מומחה שיווק B2B ויצירת תוכן מקצועי. צור דוא"ל מכירות מתקדם ומותאם אישית.

פרטי ההרצאה:
- נושא: "${formData.idea}"
- קהל יעד: "${formData.audienceProfile}"
- מוצר/שירות: "${formData.serviceOrProduct}"
- קריאה לפעולה: "${formData.callToAction}"

צור דוא"ל B2B מקצועי ומותאם:

{
  "emailContent": "נושא: [נושא מושך ומותאם לקהל ${formData.audienceProfile}]

שלום [שם],

פתיחה אישית:
[פתיחה חמה ואישית שמתחברת לצרכים הספציפיים של ${formData.audienceProfile}]

זיהוי הבעיה:
[הצגה מדויקת של הבעיות שמתמודד איתן ${formData.audienceProfile} בתחום ${formData.idea}]

הצגת הפתרון:
[הסבר כיצד ההרצאה שלי על ${formData.idea} פותרת בדיוק את הבעיות שהוצגו]

הוכחה חברתית:
[עדויות ותוצאות ממשיות מההרצאות הקודמות שלי]

קריאה לפעולה:
[${formData.callToAction} - בצורה ברורה ומעוררת פעולה]

בכבוד רב,
[שם המרצה]"
}

אורך הדוא"ל: 300-400 מילים. כלול נושא מושך שיגרום לפתיחת הדוא"ל.
`;

  const result = await callOpenAI(prompt);
  return result.emailContent || result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, outline } = await req.json();
    
    console.log('Generating email for topic:', formData.idea);

    const result = await generateEmailContent(formData, outline);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-email function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
