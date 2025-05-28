
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log('Successfully parsed marketing content JSON');
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
          content: 'You are an expert marketing content creator. Create compelling, engaging content that drives action. Return only valid JSON without any explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.8
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

async function generateMarketingContent(formData: any): Promise<any> {
  const prompt = `
צור תוכן שיווקי מקצועי ומושך עבור הרצאה:

נושא ההרצאה: "${formData.idea}"
רקע המרצה: "${formData.speakerBackground}"
קהל יעד: "${formData.audienceProfile}"
משך ההרצאה: ${formData.duration} דקות
מוצר/שירות: "${formData.serviceOrProduct}"
קריאה לפעולה: "${formData.callToAction}"

צור תוכן שיווקי מקיף במבנה JSON הבא:

{
  "facebookLaunchPost": "פוסט פייסבוק קצר ומושך להשקת מכירת כרטיסים להרצאה. 2-3 משפטים חדים עם אמוג'י רלוונטיים",
  "storytellingPost": {
    "title": "כותרת מושכת לפוסט",
    "content": "פוסט סיפורי ארוך יותר לפייסבוק/לינקדאין שמספר סיפור אישי או מקצועי שמתחבר לנושא ההרצאה, יוצר זיהוי רגשי ומוביל לרצון להשתתף"
  },
  "instagramStories": [
    {
      "storyNumber": 1,
      "concept": "רעיון עיקרי לסטורי הראשון",
      "content": "תוכן מפורט - טקסט או הנחיות חזותיות",
      "callToAction": "קריאה לפעולה ספציפית"
    },
    {
      "storyNumber": 2,
      "concept": "רעיון עיקרי לסטורי השני",
      "content": "תוכן מפורט - טקסט או הנחיות חזותיות",
      "callToAction": "קריאה לפעולה ספציפית"
    },
    {
      "storyNumber": 3,
      "concept": "רעיון עיקרי לסטורי השלישי",
      "content": "תוכן מפורט - טקסט או הנחיות חזותיות",
      "callToAction": "קריאה לפעולה ספציפית"
    }
  ],
  "tiktokScript": {
    "disrupt": "משפט פותח שוברת תבניות - 3-5 שניות",
    "hook": "וו שמושך תשומת לב - 2-3 שניות",
    "issue": "הצגת הבעיה או האתגר - 10-15 שניות",
    "credibility": "למה צריך להקשיב לי - מי אני ומה ההתמחות שלי - 8-10 שניות",
    "aboutLecture": "מה יקבלו בהרצאה - תועלות קונקרטיות - 15-20 שניות",
    "callToAction": "קריאה לפעולה ברורה ומחייבת - 5-8 שניות"
  },
  "emailCampaign": {
    "subject": "נושא מייל מושך שמעורר סקרנות",
    "content": "תוכן מייל סיפורי (לא ארוך מדי) שמתאים לקהל היעד שהמשתמש הזין, כולל פתיחה אישית, סיפור קצר, הצגת הערך של ההרצאה וקריאה לפעולה"
  }
}

הנחיות חשובות:
1. התאם את כל התוכן לנושא "${formData.idea}" ולקהל "${formData.audienceProfile}"
2. השתמש בטון מקצועי אך חם ומזמין
3. צור תחושת דחיפות ללא להיות אגרסיבי
4. כלול אלמנטים פסיכולוגיים שמניעים לפעולה
5. התוכן צריך להיות מותאם לתרבות הישראלית
6. השתמש בשפה ברורה ופשוטה
`;

  return await callOpenAI(prompt);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    
    console.log('Generating marketing content for topic:', formData.idea);

    const result = await generateMarketingContent(formData);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-marketing-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
