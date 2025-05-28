
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
      console.error('No form data provided');
      throw new Error('No form data provided');
    }

    console.log('Generating basic outline for:', formData.idea);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert presentation consultant. Generate a structured presentation outline in Hebrew based on the user's input.

CRITICAL: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text. Do not wrap the response in \`\`\`json or any other formatting. Start directly with { and end with }.

The response must be a valid JSON object with this exact structure:

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
Speaker Background: ${formData.speakerBackground || 'לא צוין'}
Target Audience: ${formData.audienceProfile || 'לא צוין'}
Common Objections: ${formData.commonObjections || 'לא צוין'}
Service/Product: ${formData.serviceOrProduct || 'לא צוין'}
Call to Action: ${formData.callToAction || 'לא צוין'}

Create a professional presentation structure with 4 chapters, each containing exactly 3 main points. Focus on creating engaging content that builds toward the call to action naturally.`;

    console.log('Making request to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure from OpenAI:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    let content = data.choices[0].message.content;

    console.log('Raw AI response:', content);

    // Clean and extract JSON from potential markdown formatting
    content = content.trim();
    
    // Remove markdown code block formatting if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any leading/trailing whitespace after cleaning
    content = content.trim();
    
    console.log('Cleaned content for parsing:', content);

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error('Invalid JSON response from AI - response was not properly formatted');
    }

    // Validate the response structure
    if (!parsedContent.chapters || !Array.isArray(parsedContent.chapters)) {
      console.error('Invalid response structure - missing chapters array:', parsedContent);
      throw new Error('Invalid response structure from AI - missing chapters');
    }

    if (parsedContent.chapters.length !== 4) {
      console.error('Invalid number of chapters:', parsedContent.chapters.length);
      throw new Error('AI did not generate exactly 4 chapters as requested');
    }

    // Validate each chapter has 3 points
    for (let i = 0; i < parsedContent.chapters.length; i++) {
      const chapter = parsedContent.chapters[i];
      if (!chapter.points || !Array.isArray(chapter.points) || chapter.points.length !== 3) {
        console.error(`Chapter ${i + 1} does not have exactly 3 points:`, chapter);
        throw new Error(`Chapter ${i + 1} does not have exactly 3 points`);
      }
    }

    console.log('Successfully generated basic outline with', parsedContent.chapters.length, 'chapters');
    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-outline function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
