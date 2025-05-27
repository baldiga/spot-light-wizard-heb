
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
        fourWeekPlan: {
          "שבוע 1": {
            goals: ["מטרה 1", "מטרה 2", "מטרה 3"]
          },
          "שבוע 2": {
            goals: ["מטרה 1", "מטרה 2", "מטרה 3"]
          },
          "שבוע 3": {
            goals: ["מטרה 1", "מטרה 2", "מטרה 3"]
          },
          "שבוע 4": {
            goals: ["מטרה 1", "מטרה 2", "מטרה 3"]
          }
        },
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
        collaborationOpportunities: [
          {
            title: "שיתופי פעולה עם ארגונים",
            description: "יצירת קשרים עם ארגונים רלוונטיים",
            implementation: "פנייה ישירה למנהלים"
          }
        ],
        contentMarketing: [
          {
            title: "יצירת תוכן רלוונטי",
            description: "פיתוח תוכן איכותי למטרות שיווק",
            actionItems: ["כתיבת פוסטים", "יצירת סרטונים", "פרסום מאמרים"]
          }
        ],
        followUpStrategy: {
          description: "מעקב אחר משתתפים",
          metrics: ["שיעור פתיחת מיילים", "מספר הורדות", "שיעור המרה"],
          tools: ["Google Analytics", "מערכת CRM", "כלי אוטומציה"]
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
    console.log('Successfully parsed strategy JSON');
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return {
      fourWeekPlan: {
        "שבוע 1": {
          goals: ["בניית תדמית מותג", "יצירת תוכן בסיסי", "זיהוי קהל יעד"]
        },
        "שבוע 2": {
          goals: ["השקת קמפיין פרסום", "יצירת שיתופי פעולה", "פיתוח קשרי לקוחות"]
        },
        "שבוע 3": {
          goals: ["מדידת ביצועים", "אופטימיזציה של קמפיינים", "הרחבת קהל"]
        },
        "שבוע 4": {
          goals: ["סיכום והערכה", "תכנון לעתיד", "יישום לקחים"]
        }
      },
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
      collaborationOpportunities: [
        {
          title: "שיתופי פעולה",
          description: "יצירת קשרים אסטרטגיים",
          implementation: "פנייה מותאמת אישית"
        }
      ],
      contentMarketing: [
        {
          title: "תוכן איכותי",
          description: "פיתוח תוכן מקצועי",
          actionItems: ["יצירה", "פרסום", "מדידה"]
        }
      ],
      followUpStrategy: {
        description: "מעקב ומדידה",
        metrics: ["מעורבות", "המרות", "ROI"],
        tools: ["Analytics", "CRM", "Automation"]
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
    console.log('Assistant response received for strategy');
    
    return cleanAndParseJSON(content);
  } catch (error) {
    console.error('Assistant API error:', error);
    throw error;
  }
}

async function generateStrategyContent(formData: any, outline: any): Promise<any> {
  const prompt = `
צור אסטרטגיית שיווק ומכירות מקיפה עבור הרצאה בנושא: "${formData.idea}"

החזר JSON תקין בפורמט הבא:

{
  "fourWeekPlan": {
    "שבוע 1": {
      "goals": [
        "מטרה ראשונה לשבוע 1",
        "מטרה שנייה לשבוע 1", 
        "מטרה שלישית לשבוע 1"
      ]
    },
    "שבוע 2": {
      "goals": [
        "מטרה ראשונה לשבוע 2",
        "מטרה שנייה לשבוע 2",
        "מטרה שלישית לשבוע 2"
      ]
    },
    "שבוע 3": {
      "goals": [
        "מטרה ראשונה לשבוע 3",
        "מטרה שנייה לשבוע 3",
        "מטרה שלישית לשבוע 3"
      ]
    },
    "שבוע 4": {
      "goals": [
        "מטרה ראשונה לשבוע 4",
        "מטרה שנייה לשבוע 4",
        "מטרה שלישית לשבוע 4"
      ]
    }
  },
  "targetAudiences": [
    "קהל יעד ראשי",
    "קהל יעד משני"
  ],
  "marketingChannels": [
    {
      "channel": "שם הערוץ",
      "strategy": "אסטרטגיה מפורטת",
      "timeline": "זמן יישום",
      "budget": "תקציב מוערך"
    }
  ],
  "pricingStrategy": {
    "basicTicket": "מחיר רגיל מומלץ",
    "vipTicket": "מחיר VIP מומלץ"
  },
  "collaborationOpportunities": [
    {
      "title": "כותרת השיתוף",
      "description": "תיאור מפורט של ההזדמנות",
      "implementation": "צעדים מעשיים ליישום השיתוף"
    }
  ],
  "contentMarketing": [
    {
      "title": "סוג התוכן",
      "description": "תיאור התוכן והמטרה שלו",
      "actionItems": [
        "פעולה מעשית 1",
        "פעולה מעשית 2",
        "פעולה מעשית 3"
      ]
    }
  ],
  "followUpStrategy": {
    "description": "תיאור כללי של אסטרטגיית המעקב",
    "metrics": [
      "מדד מעקב 1",
      "מדד מעקב 2", 
      "מדד מעקב 3"
    ],
    "tools": [
      "כלי מעקב 1",
      "כלי מעקב 2",
      "כלי מעקב 3"
    ]
  }
}

דרישות חשובות:
1. צור תוכנית 4 שבועות מפורטת עם 3 מטרות ספציפיות לכל שבוע
2. הוסף הסברים מורחבים לשיתופי פעולה עם צעדי יישום ברורים
3. פרט אסטרטגיות תוכן עם פעולות מעשיות
4. כלול מדדי מעקב וכלים ספציפיים למדידת הצלחה
5. התאם הכל לנושא "${formData.idea}" ולקהל "${formData.audienceProfile}"
6. הקפד על תוכן מעשי וישים שהמשתמש יוכל ליישם בקלות
`;

  return await callOpenAIAssistant(prompt);
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
      fourWeekPlan: {},
      targetAudiences: [],
      marketingChannels: [],
      pricingStrategy: {},
      collaborationOpportunities: [],
      contentMarketing: [],
      followUpStrategy: {}
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
