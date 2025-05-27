
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
      console.log('No JSON found, creating fallback strategy');
      return {
        targetAudiences: ["קהל יעד ראשי"],
        marketingChannels: [
          {
            channel: "רשתות חברתיות",
            strategy: "יצירת תוכן איכותי",
            timeline: "4 שבועות",
            budget: "1000₪"
          }
        ],
        pricingStrategy: {
          basicTicket: "כרטיס רגיל: 150₪",
          vipTicket: "כרטיס VIP: 350₪"
        },
        collaborationOpportunities: ["שיתופי פעולה עם ארגונים"],
        contentMarketing: ["יצירת תוכן רלוונטי"],
        followUpStrategy: "מעקב אחר משתתפים"
      };
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
    console.log('Successfully parsed strategy JSON');
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return {
      targetAudiences: ["בעלי עסקים", "יזמים", "מנהלים"],
      marketingChannels: [
        {
          channel: "רשתות חברתיות",
          strategy: "יצירת תוכן מקצועי",
          timeline: "4 שבועות",
          budget: "1000₪"
        }
      ],
      pricingStrategy: {
        basicTicket: "כרטיס רגיל: 150₪",
        vipTicket: "כרטיס VIP: 350₪"
      },
      collaborationOpportunities: ["שיתופי פעולה"],
      contentMarketing: ["תוכן איכותי"],
      followUpStrategy: "מעקב ומדידה"
    };
  }
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

async function generateStrategyContent(formData: any, outline: any): Promise<any> {
  const prompt = `
צור אסטרטגיית שיווק ומכירות מקיפה עבור הרצאה בנושא: "${formData.idea}"

החזר JSON תקין בפורמט הבא:

{
  "targetAudiences": [
    "קהל יעד ראשי",
    "קהל יעד משני"
  ],
  "marketingChannels": [
    {
      "channel": "שם הערוץ",
      "strategy": "אסטרטגיה",
      "timeline": "זמן",
      "budget": "תקציב"
    }
  ],
  "pricingStrategy": {
    "basicTicket": "מחיר רגיל",
    "vipTicket": "מחיר VIP"
  },
  "collaborationOpportunities": ["הזדמנות 1"],
  "contentMarketing": ["תוכן 1"],
  "followUpStrategy": "אסטרטגיית מעקב"
}

התאם הכל לנושא "${formData.idea}" ולקהל "${formData.audienceProfile}".
`;

  return await callOpenAI(prompt);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, outline } = await req.json();
    
    console.log('Generating strategy for topic:', formData.idea);

    const result = await generateStrategyContent(formData, outline);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-strategy function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      targetAudiences: [],
      marketingChannels: [],
      pricingStrategy: {},
      collaborationOpportunities: [],
      contentMarketing: [],
      followUpStrategy: ""
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
