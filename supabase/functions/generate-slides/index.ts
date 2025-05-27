
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
      console.log('No JSON object found, creating fallback slides');
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
    
    cleanResponse = cleanResponse
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
      .replace(/:\s*'([^']*)'/g, ': "$1"')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\r/g, '')
      .trim();
    
    const parsed = JSON.parse(cleanResponse);
    console.log('Successfully parsed slides JSON');
    
    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      console.log('No slides array found, creating default structure');
      parsed.slides = [];
    }
    
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
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

async function callOpenAIAssistant(prompt: string): Promise<any> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Using OpenAI Assistant API...');
  
  try {
    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });

    if (!threadResponse.ok) {
      throw new Error(`Thread creation failed: ${threadResponse.status}`);
    }

    const thread = await threadResponse.json();

    // Add message to thread
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: prompt
      })
    });

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: 'asst_etLDYkL7Oj3ggr9IKpwmGE76'
      })
    });

    const run = await runResponse.json();

    // Poll for completion
    let runStatus = run;
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      if (statusResponse.ok) {
        runStatus = await statusResponse.json();
      }
    }

    // Get messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    const messages = await messagesResponse.json();
    const assistantMessage = messages.data.find((msg: any) => msg.role === 'assistant');
    
    const content = assistantMessage?.content[0]?.text?.value || '';
    console.log('Assistant response received for slides');
    
    return cleanAndParseJSON(content);
  } catch (error) {
    console.error('Assistant API error:', error);
    throw error;
  }
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

  return await callOpenAIAssistant(prompt);
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
      slides: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
