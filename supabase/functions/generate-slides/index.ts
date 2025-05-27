
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function cleanAndParseJSON(response: string): any {
  try {
    console.log('Raw AI response length:', response.length);
    console.log('First 500 chars:', response.substring(0, 500));
    
    // Remove markdown code blocks
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON boundaries
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.log('No JSON object found, trying to extract from response');
      // Try to create a simple structure if no JSON found
      return {
        slides: [
          {
            number: 1,
            headline: "שקף דוגמה",
            content: "תוכן דוגמה",
            visual: "תיאור ויזואלי",
            notes: "הערות למרצה"
          }
        ]
      };
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    
    // Clean up common JSON issues
    cleanResponse = cleanResponse
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Convert single quotes to double
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    
    console.log('Cleaned response length:', cleanResponse.length);
    
    const parsed = JSON.parse(cleanResponse);
    console.log('Successfully parsed JSON with keys:', Object.keys(parsed));
    
    // Ensure we have a slides array
    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      console.log('No slides array found, creating default structure');
      parsed.slides = [];
    }
    
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.log('Failed to parse, returning fallback structure');
    
    // Return a fallback structure instead of throwing
    return {
      slides: [
        {
          number: 1,
          headline: "שקף פתיחה",
          content: "תוכן השקף יוצר בהתאם לנושא ההרצאה",
          visual: "עיצוב ויזואלי מתאים",
          notes: "הערות למרצה"
        }
      ]
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
          content: 'אתה מומחה ליצירת הרצאות מקצועיות בעברית. תמיד החזר JSON תקין וספציפי לנושא המבוקש. ודא שהתשובה שלך היא JSON תקין בלבד.'
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

async function generateSlidesContent(formData: any, outline: any): Promise<any> {
  const prompt = `
צור מבנה שקפים מפורט עם אלמנטי מעורבות עבור הרצאה בנושא: "${formData.idea}"

החזר JSON תקין בפורמט הבא בלבד:

{
  "slides": [
    {
      "number": 1,
      "section": "פתיחה",
      "headline": "כותרת השקף",
      "content": "תוכן השקף",
      "visual": "תיאור ויזואלי",
      "notes": "הערות למרצה",
      "timeAllocation": "3 דקות",
      "engagementTip": "טיפ למעורבות",
      "transitionPhrase": "משפט מעבר"
    }
  ]
}

צור 10-12 שקפים מפורטים עבור נושא "${formData.idea}" למשך ${formData.duration} דקות.
`;

  return await callOpenAI(prompt);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, outline } = await req.json();
    
    console.log('Generating slides for topic:', formData.idea);

    const result = await generateSlidesContent(formData, outline);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-slides function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      slides: [] // Always return an array for slides
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
