
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateMarketingImage(formData: any): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Create a comprehensive prompt for the marketing image
  const imagePrompt = `Create a professional marketing image for a lecture about "${formData.idea}". 
  The image should be modern, clean, and professional. 
  Target audience: ${formData.audienceProfile}. 
  Speaker background: ${formData.speakerBackground}.
  
  IMPORTANT: Leave a large empty space in the center (about 40% of the image) where text can be added later. 
  The empty space should be a clean, readable background color.
  
  Style: Professional, modern, engaging, suitable for social media promotion.
  Colors: Use colors that convey trust and professionalism.
  Elements: Include subtle visual elements related to the topic without overwhelming the central text space.
  Format: Landscape orientation, suitable for social media posts.`;

  console.log('Generating marketing image with DALL-E-3...');
  
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('DALL-E API error:', errorText);
    throw new Error(`DALL-E API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Image generated successfully');
  
  return data.data[0].url;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    
    console.log('Generating marketing visual for topic:', formData.idea);

    const imageUrl = await generateMarketingImage(formData);

    const result = {
      marketingImage: {
        imageUrl: imageUrl,
        downloadNote: "הורד את התמונה וערוך אותה ב-Canva להוספת טקסט ופרטי ההרצאה",
        canvaLink: "https://canva.com",
        instructions: "התמונה עוצבה עם מקום ריק במרכז להוספת טקסט. השתמש ב-Canva להוספת כותרת ההרצאה, תאריך, שעה ופרטי הרשמה."
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-marketing-visuals function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      marketingImage: {
        imageUrl: null,
        downloadNote: "לא ניתן היה ליצור תמונה כרגע",
        canvaLink: "https://canva.com",
        instructions: "נסה שוב מאוחר יותר או צור תמונה ידנית ב-Canva"
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
