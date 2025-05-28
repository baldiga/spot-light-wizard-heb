
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

    const prompt = `You are a marketing expert. Create comprehensive social media content for promoting a lecture/presentation. 

LECTURE DETAILS:
- Topic: ${formData.idea}
- Speaker Background: ${formData.speakerBackground}
- Target Audience: ${formData.audienceProfile}
- Duration: ${formData.duration} minutes
- Service/Product: ${formData.serviceOrProduct}
- Call to Action: ${formData.callToAction}

Generate social media content as a JSON object with this EXACT structure (return ONLY the JSON, no markdown formatting):

{
  "facebookShortPost": "Short engaging Facebook post (2-3 sentences) to launch lecture sales",
  "facebookStoryPost": "Longer narrative-driven Facebook/LinkedIn post with storytelling element (3-4 paragraphs)",
  "instagramStories": [
    "Story 1: Build anticipation",
    "Story 2: Highlight value",
    "Story 3: Call to action"
  ],
  "tiktokScript": {
    "disrupt": "Attention-grabbing opener (3-5 seconds)",
    "hook": "Reason to keep watching (5-8 seconds)",
    "issue": "Problem the lecture solves (10-15 seconds)",
    "credibility": "Brief speaker credibility statement (5-8 seconds)",
    "lectureDetails": "Key lecture information (10-15 seconds)",
    "callToAction": "Prompt to learn more or buy tickets (5-8 seconds)"
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
          { role: 'system', content: 'You are a marketing expert. Return only valid JSON without any markdown formatting or code blocks.' },
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
