
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

    const prompt = `You are a marketing strategist. Create a comprehensive 4-week marketing strategy for promoting a lecture/presentation.

LECTURE DETAILS:
- Topic: ${formData.idea}
- Speaker Background: ${formData.speakerBackground}
- Target Audience: ${formData.audienceProfile}
- Duration: ${formData.duration} minutes
- Service/Product: ${formData.serviceOrProduct}
- Call to Action: ${formData.callToAction}

Generate a 4-week marketing plan as a JSON object with this EXACT structure (return ONLY the JSON, no markdown formatting):

{
  "fourWeekPlan": {
    "week1": {
      "title": "Week 1: Soft Launch & Awareness",
      "goals": [
        "Goal 1 for week 1",
        "Goal 2 for week 1",
        "Goal 3 for week 1"
      ],
      "activities": [
        "Activity 1",
        "Activity 2", 
        "Activity 3"
      ],
      "contentIdeas": [
        "Content idea 1",
        "Content idea 2"
      ]
    },
    "week2": {
      "title": "Week 2: Value & Engagement",
      "goals": [
        "Goal 1 for week 2",
        "Goal 2 for week 2",
        "Goal 3 for week 2"
      ],
      "activities": [
        "Activity 1",
        "Activity 2",
        "Activity 3"
      ],
      "contentIdeas": [
        "Content idea 1",
        "Content idea 2"
      ]
    },
    "week3": {
      "title": "Week 3: Building Momentum",
      "goals": [
        "Goal 1 for week 3",
        "Goal 2 for week 3",
        "Goal 3 for week 3"
      ],
      "activities": [
        "Activity 1",
        "Activity 2",
        "Activity 3"
      ],
      "contentIdeas": [
        "Content idea 1",
        "Content idea 2"
      ]
    },
    "week4": {
      "title": "Week 4: Sales Push & Urgency",
      "goals": [
        "Goal 1 for week 4",
        "Goal 2 for week 4",
        "Goal 3 for week 4"
      ],
      "activities": [
        "Activity 1",
        "Activity 2",
        "Activity 3"
      ],
      "contentIdeas": [
        "Content idea 1",
        "Content idea 2"
      ]
    }
  },
  "budgetConsiderations": [
    "Budget tip 1",
    "Budget tip 2",
    "Budget tip 3"
  ],
  "keyMetrics": [
    "Metric 1 to track",
    "Metric 2 to track",
    "Metric 3 to track"
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
          { role: 'system', content: 'You are a marketing strategist. Return only valid JSON without any markdown formatting or code blocks.' },
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
