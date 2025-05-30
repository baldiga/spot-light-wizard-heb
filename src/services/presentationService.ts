import { PresentationFormData, PresentationOutline } from '@/types/presentation';
import { supabase } from '@/integrations/supabase/client';
import { generateId } from '@/utils/helpers';

/**
 * Generates presentation outline using Supabase Edge Function
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  try {
    console.log('Calling Supabase Edge Function for outline generation...');
    
    const { data, error } = await supabase.functions.invoke('generate-outline', {
      body: { formData: formData }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to generate outline: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from outline generation');
    }

    console.log('Successfully generated outline via Edge Function');
    return parseApiResponse(data);
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw error;
  }
}

/**
 * Generates slide structure using Supabase Edge Function
 */
export async function generateSlideStructure(formData: PresentationFormData, outline: any): Promise<any[]> {
  try {
    console.log('Generating slide structure...');
    
    const { data, error } = await supabase.functions.invoke('generate-slides', {
      body: { formData: formData, outline: outline }
    });

    if (error) {
      throw new Error(`Failed to generate slides: ${error.message}`);
    }

    return data.slides || [];
  } catch (error) {
    console.error("Error generating slide structure:", error);
    throw error;
  }
}

/**
 * Generates sales strategy using Supabase Edge Function
 */
export async function generateSalesStrategy(formData: PresentationFormData, outline: any): Promise<any> {
  try {
    console.log('Generating sales strategy...');
    
    const { data, error } = await supabase.functions.invoke('generate-strategy', {
      body: { formData: formData, outline: outline }
    });

    if (error) {
      throw new Error(`Failed to generate strategy: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error generating sales strategy:", error);
    throw error;
  }
}

/**
 * Generates engagement content using Supabase Edge Function
 */
export async function generateEngagementContent(formData: PresentationFormData, outline: any): Promise<any> {
  try {
    console.log('Generating engagement content...');
    
    const { data, error } = await supabase.functions.invoke('generate-engagement', {
      body: { formData: formData, outline: outline }
    });

    if (error) {
      throw new Error(`Failed to generate engagement: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error generating engagement content:", error);
    throw error;
  }
}

/**
 * Generates email content using Supabase Edge Function
 */
export async function generateEmailContent(formData: PresentationFormData, outline: any): Promise<any> {
  try {
    console.log('Generating email content...');
    
    const { data, error } = await supabase.functions.invoke('generate-email-image', {
      body: { formData: formData, outline: outline }
    });

    if (error) {
      throw new Error(`Failed to generate email content: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error generating email content:", error);
    throw error;
  }
}

/**
 * Generates presentation tools using Supabase Edge Function
 */
export async function generatePresentationTools(formData: PresentationFormData, outline: any): Promise<any> {
  try {
    console.log('Generating presentation tools...');
    
    const { data, error } = await supabase.functions.invoke('generate-tools', {
      body: { formData: formData, outline: outline }
    });

    if (error) {
      throw new Error(`Failed to generate tools: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error generating presentation tools:", error);
    throw error;
  }
}

/**
 * Generates social media content using Supabase Edge Function
 */
export async function generateSocialMediaContent(formData: PresentationFormData, outline: any): Promise<any> {
  try {
    console.log('Generating social media content...');
    
    const { data, error } = await supabase.functions.invoke('generate-social-media', {
      body: { formData: formData, outline: outline }
    });

    if (error) {
      throw new Error(`Failed to generate social media content: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error generating social media content:", error);
    throw error;
  }
}

/**
 * Generates marketing plan using Supabase Edge Function
 */
export async function generateMarketingPlanContent(formData: PresentationFormData, outline: any): Promise<any> {
  try {
    console.log('Generating marketing plan...');
    
    const { data, error } = await supabase.functions.invoke('generate-marketing-plan', {
      body: { formData: formData, outline: outline }
    });

    if (error) {
      throw new Error(`Failed to generate marketing plan: ${error.message}`);
    }

    return data || null;
  } catch (error) {
    console.error("Error generating marketing plan:", error);
    throw error;
  }
}

/**
 * Parses the API response and formats it to match our PresentationOutline interface
 */
function parseApiResponse(response: any): PresentationOutline {
  try {
    console.log('Parsing API response:', response);
    
    // Validate response structure
    if (!response.chapters || !Array.isArray(response.chapters)) {
      throw new Error('Invalid response: missing or invalid chapters array');
    }

    // Ensure exactly 4 chapters
    const chapters = response.chapters.slice(0, 4);
    
    // Add IDs to chapters and points
    const chaptersWithIds = chapters.map((chapter: any) => {
      if (!chapter.title || !chapter.points || !Array.isArray(chapter.points)) {
        throw new Error('Invalid chapter structure');
      }
      
      return {
        id: generateId(),
        title: chapter.title,
        points: chapter.points.map((point: any) => ({
          id: generateId(),
          content: point.content || point
        }))
      };
    });

    // Add IDs to sales process steps and ensure exactly 10 steps
    const salesProcessWithIds = response.salesProcess ? 
      response.salesProcess.slice(0, 10).map((step: any, index: number) => ({
        id: generateId(),
        title: step.title,
        description: step.description,
        order: step.order || index + 1
      })) : [];
    
    const parsedOutline = {
      chapters: chaptersWithIds,
      openingStyles: response.openingStyles || [],
      timeDistribution: response.timeDistribution || "",
      interactiveActivities: response.interactiveActivities || [],
      presentationStructure: response.presentationStructure || "",
      discussionQuestions: response.discussionQuestions || {},
      salesGuide: response.salesGuide || "",
      postPresentationPlan: response.postPresentationPlan || "",
      motivationalMessage: response.motivationalMessage || "",
      salesProcess: salesProcessWithIds
    };

    console.log('Successfully parsed outline with', chaptersWithIds.length, 'chapters and', salesProcessWithIds.length, 'sales steps');
    return parsedOutline;
  } catch (error) {
    console.error("Error parsing API response:", error);
    throw new Error("Failed to parse the AI response. Please try again.");
  }
}
