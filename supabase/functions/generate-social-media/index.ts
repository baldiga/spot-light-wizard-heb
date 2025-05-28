
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
    
    console.log('Generating social media content for topic:', formData.idea);

    const prompt = `אתה מומחה שיווק. צור תוכן מקיף לרשתות חברתיות לקידום הרצאה/מצגת. כל התוכן חייב להיות בעברית בלבד.

פרטי ההרצאה:
- נושא: ${formData.idea}
- רקע המרצה: ${formData.speakerBackground}
- קהל יעד: ${formData.audienceProfile}
- משך זמן: ${formData.duration} דקות
- שירות/מוצר: ${formData.serviceOrProduct}
- קריאה לפעולה: ${formData.callToAction}

צור תוכן לרשתות חברתיות כאובייקט JSON עם המבנה המדויק הזה (החזר רק את ה-JSON, ללא עיצוב markdown):

{
  "facebookShortPost": "פוסט פייסבוק קצר ומעניין (2-3 משפטים) להשקת מכירת כרטיסים להרצאה",
  "facebookStoryPost": "פוסט ארוך יותר מונע סיפור לפייסבוק/לינקדאין עם אלמנט סיפורי (3-4 פסקאות)",
  "instagramStories": [
    "סטורי 1: בניית ציפייה והתרגשות",
    "סטורי 2: הדגשת הערך והתועלת",
    "סטורי 3: קריאה לפעולה וקישור לרכישה"
  ],
  "tiktokScript": {
    "disrupt": "פתיחה מושכת תשומת לב (3-5 שניות)",
    "hook": "סיבה להמשיך לצפות (5-8 שניות)",
    "issue": "הבעיה שההרצאה פותרת (10-15 שניות)",
    "credibility": "הצהרת אמינות קצרה על המרצה (5-8 שניות)",
    "lectureDetails": "מידע מפתח על ההרצאה (10-15 שניות)",
    "callToAction": "הנחיה ללמוד עוד או לקנות כרטיסים (5-8 שניות)"
  }
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
          { role: 'system', content: 'אתה מומחה שיווק. החזר רק JSON תקין בעברית ללא עיצוב markdown או בלוקי קוד.' },
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

    const socialMediaContent = JSON.parse(cleanedResponse);
    console.log('Successfully parsed social media JSON');

    return new Response(JSON.stringify(socialMediaContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-social-media function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
