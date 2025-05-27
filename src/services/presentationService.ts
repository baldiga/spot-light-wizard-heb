
import { PresentationFormData, PresentationOutline } from '@/types/presentation';
import { supabase } from '@/integrations/supabase/client';
import { generateId } from '@/utils/helpers';

/**
 * Generates presentation outline using Supabase Edge Function
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  try {
    console.log('Calling Supabase Edge Function for outline generation...');
    
    const { data, error } = await supabase.functions.invoke('generate-presentation', {
      body: {
        type: 'outline',
        formData: formData
      }
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
    
    const { data, error } = await supabase.functions.invoke('generate-presentation', {
      body: {
        type: 'slides',
        formData: formData,
        outline: outline
      }
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
 * Generates B2B email using Supabase Edge Function
 */
export async function generateB2BEmail(formData: PresentationFormData, outline: any): Promise<string> {
  try {
    console.log('Generating B2B email...');
    
    const { data, error } = await supabase.functions.invoke('generate-presentation', {
      body: {
        type: 'email',
        formData: formData,
        outline: outline
      }
    });

    if (error) {
      throw new Error(`Failed to generate email: ${error.message}`);
    }

    return data || '';
  } catch (error) {
    console.error("Error generating B2B email:", error);
    throw error;
  }
}

/**
 * Generates sales strategy using Supabase Edge Function
 */
export async function generateSalesStrategy(formData: PresentationFormData, outline: any): Promise<any> {
  try {
    console.log('Generating sales strategy...');
    
    const { data, error } = await supabase.functions.invoke('generate-presentation', {
      body: {
        type: 'strategy',
        formData: formData,
        outline: outline
      }
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
 * Generates presentation tools using Supabase Edge Function
 */
export async function generatePresentationTools(formData: PresentationFormData, outline: any): Promise<any> {
  try {
    console.log('Generating presentation tools...');
    
    const { data, error } = await supabase.functions.invoke('generate-presentation', {
      body: {
        type: 'tools',
        formData: formData,
        outline: outline
      }
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
 * Parses the API response and formats it to match our PresentationOutline interface
 */
function parseApiResponse(response: any): PresentationOutline {
  try {
    console.log('Parsing API response:', response);
    
    // Validate response structure
    if (!response.chapters || !Array.isArray(response.chapters)) {
      throw new Error('Invalid response: missing or invalid chapters array');
    }

    // Add IDs to chapters and points
    const chaptersWithIds = response.chapters.map((chapter: any) => {
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
