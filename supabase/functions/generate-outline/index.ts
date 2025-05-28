
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    
    if (!formData) {
      throw new Error('No form data provided');
    }

    console.log('Generating basic outline for:', formData.idea);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert presentation consultant. Generate a structured presentation outline in Hebrew based on the user's input.

Return ONLY a valid JSON object with this exact structure - no additional text or explanations:

{
  "chapters": [
    {
      "id": "chapter_1",
      "title": "כותרת הפרק",
      "points": [
        {"id": "point_1_1", "content": "נקודה ראשונה"},
        {"id": "point_1_2", "content": "נקודה שנייה"},
        {"id": "point_1_3", "content": "נקודה שלישית"}
      ]
    }
  ],
  "openingStyles": ["סגנון פתיחה 1", "סגנון פתיחה 2", "סגנון פתיחה 3"],
  "timeDistribution": "פתיחה - X%, פרק 1 - Y%, וכו'",
  "interactiveActivities": ["פעילות 1", "פעילות 2"],
  "presentationStructure": "תיאור מבנה ההרצאה",
  "discussionQuestions": {
    "חלק 1": ["שאלה 1", "שאלה 2"],
    "חלק 2": ["שאלה 1", "שאלה 2"]
  },
  "salesGuide": "מדריך למכירה",
  "postPresentationPlan": "תוכנית לאחר ההרצאה",
  "motivationalMessage": "הודעה מעודדת"
}

Create exactly 4 chapters with 3 points each. Make it relevant to the presentation topic and audience.`;

    const userPrompt = `Create a presentation outline for:

Topic: ${formData.idea}
Duration: ${formData.duration} minutes
Speaker Background: ${formData.speakerBackground}
Target Audience: ${formData.audienceProfile}
Common Objections: ${formData.commonObjections}
Service/Product: ${formData.serviceOrProduct}
Call to Action: ${formData.callToAction}

Create a professional presentation structure with 4 chapters, each containing exactly 3 main points. Focus on creating engaging content that builds toward the call to action naturally.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('Raw AI response:', content);

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('Invalid JSON response from AI');
    }

    console.log('Successfully generated basic outline');
    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-outline function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
