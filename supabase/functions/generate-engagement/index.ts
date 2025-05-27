
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
      console.log('No JSON found, creating fallback engagement');
      return {
        interactiveActivities: [
          "פעילות אינטראקטיבית 1",
          "פעילות אינטראקטיבית 2"
        ],
        discussionQuestions: {
          "פרק 1": ["שאלה 1", "שאלה 2"],
          "פרק 2": ["שאלה 3", "שאלה 4"]
        },
        engagementMetrics: {
          pollQuestions: ["שאלת סקר 1"],
          breakoutActivities: ["פעילות קבוצתית"],
          gamificationElements: ["אלמנט תחרותי"]
        }
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
    console.log('Successfully parsed engagement JSON');
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return {
      interactiveActivities: [
        "סקר מהיר בתחילת ההרצאה",
        "תרגיל בזוגות",
        "דיון קבוצתי קצר"
      ],
      discussionQuestions: {
        "פרק 1": ["איך זה משפיע על העבודה שלכם?"],
        "פרק 2": ["מה החסמים העיקריים?"],
        "פרק 3": ["איך תוכלו ליישם את זה?"]
      },
      engagementMetrics: {
        pollQuestions: ["מה הניסיון שלכם בתחום?"],
        breakoutActivities: ["דיון עם השכן"],
        gamificationElements: ["חידון קצר"]
      }
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
    console.log('Assistant response received for engagement');
    
    return cleanAndParseJSON(content);
  } catch (error) {
    console.error('Assistant API error:', error);
    throw error;
  }
}

async function generateEngagementContent(formData: any, outline: any): Promise<any> {
  const prompt = `
צור תוכן מעורבות מקיף עבור הרצאה בנושא: "${formData.idea}"

החזר JSON תקין בפורמט הבא:

{
  "interactiveActivities": [
    "פעילות אינטראקטיבית 1",
    "פעילות אינטראקטיבית 2"
  ],
  "discussionQuestions": {
    "פרק 1": ["שאלה 1", "שאלה 2"],
    "פרק 2": ["שאלה 3", "שאלה 4"]
  },
  "engagementMetrics": {
    "pollQuestions": ["שאלת סקר 1"],
    "breakoutActivities": ["פעילות קבוצתית"],
    "gamificationElements": ["אלמנט תחרותי"]
  }
}

התמקד ביצירת מעורבות גבוהה ורלוונטית לנושא "${formData.idea}" עבור קהל "${formData.audienceProfile}".
`;

  return await callOpenAIAssistant(prompt);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, outline } = await req.json();
    
    console.log('Generating engagement content for topic:', formData.idea);

    const result = await generateEngagementContent(formData, outline);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-engagement function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      interactiveActivities: [],
      discussionQuestions: {},
      engagementMetrics: {
        pollQuestions: [],
        breakoutActivities: [],
        gamificationElements: []
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
