
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, outline } = await req.json();
    
    console.log('Generating marketing plan for topic:', formData.idea);

    const prompt = `אתה אסטרטג שיווק. צור אסטרטגיית שיווק מקיפה ל-4 שבועות לקידום הרצאה/מצגת. כל התוכן חייב להיות בעברית בלבד.

פרטי ההרצאה:
- נושא: ${formData.idea}
- רקע המרצה: ${formData.speakerBackground}
- קהל יעד: ${formData.audienceProfile}
- משך זמן: ${formData.duration} דקות
- שירות/מוצר: ${formData.serviceOrProduct}
- קריאה לפעולה: ${formData.callToAction}

צור תוכנית שיווק ל-4 שבועות כאובייקט JSON עם המבנה המדויק הזה (החזר רק את ה-JSON, ללא עיצוב markdown):

{
  "fourWeekPlan": {
    "week1": {
      "title": "שבוע 1: השקה רכה ובניית מודעות",
      "goals": [
        "מטרה 1 לשבוע 1",
        "מטרה 2 לשבוע 1",
        "מטרה 3 לשבוע 1"
      ],
      "activities": [
        "פעילות 1",
        "פעילות 2", 
        "פעילות 3"
      ],
      "contentIdeas": [
        "רעיון תוכן 1",
        "רעיון תוכן 2"
      ]
    },
    "week2": {
      "title": "שבוע 2: ערך ומעורבות",
      "goals": [
        "מטרה 1 לשבוע 2",
        "מטרה 2 לשבוע 2",
        "מטרה 3 לשבוע 2"
      ],
      "activities": [
        "פעילות 1",
        "פעילות 2",
        "פעילות 3"
      ],
      "contentIdeas": [
        "רעיון תוכן 1",
        "רעיון תוכן 2"
      ]
    },
    "week3": {
      "title": "שבוע 3: בניית מומנטום",
      "goals": [
        "מטרה 1 לשבוע 3",
        "מטרה 2 לשבוע 3",
        "מטרה 3 לשבוע 3"
      ],
      "activities": [
        "פעילות 1",
        "פעילות 2",
        "פעילות 3"
      ],
      "contentIdeas": [
        "רעיון תוכן 1",
        "רעיון תוכן 2"
      ]
    },
    "week4": {
      "title": "שבוע 4: דחיפת מכירות ויצירת דחיפות",
      "goals": [
        "מטרה 1 לשבוע 4",
        "מטרה 2 לשבוע 4",
        "מטרה 3 לשבוע 4"
      ],
      "activities": [
        "פעילות 1",
        "פעילות 2",
        "פעילות 3"
      ],
      "contentIdeas": [
        "רעיון תוכן 1",
        "רעיון תוכן 2"
      ]
    }
  },
  "budgetConsiderations": [
    "טיפ תקציב 1",
    "טיפ תקציב 2",
    "טיפ תקציב 3"
  ],
  "keyMetrics": [
    "מדד 1 למעקב",
    "מדד 2 למעקב",
    "מדד 3 למעקב"
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'אתה אסטרטג שיווק. החזר רק JSON תקין בעברית ללא עיצוב markdown או בלוקי קוד.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API call successful');
    
    const rawResponse = data.choices[0].message.content;
    console.log('Raw AI response length:', rawResponse.length);

    // Clean the response to extract JSON
    let cleanedResponse = rawResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const marketingPlan = JSON.parse(cleanedResponse);
    console.log('Successfully parsed marketing plan JSON');

    return new Response(JSON.stringify(marketingPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-marketing-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
