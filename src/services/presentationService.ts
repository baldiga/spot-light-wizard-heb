
import { PresentationFormData, PresentationOutline } from '@/types/presentation';
import { supabase } from '@/integrations/supabase/client';
import { generateId } from '@/utils/helpers';

/**
 * Generates presentation outline using Supabase Edge Function
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  try {
    console.log('Calling Supabase Edge Function for outline generation...');
    console.log('Form data:', {
      idea: formData.idea,
      duration: formData.duration,
      audienceProfile: formData.audienceProfile
    });
    
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
    console.log('Generated outline structure:', Object.keys(data));
    
    return parseApiResponse(data);
  } catch (error) {
    console.error("Error generating presentation outline:", error);
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

    // Add IDs to sales process steps if they exist
    const salesProcessWithIds = response.salesProcess ? 
      response.salesProcess.map((step: any, index: number) => ({
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

    console.log('Successfully parsed outline with', chaptersWithIds.length, 'chapters');
    return parsedOutline;
  } catch (error) {
    console.error("Error parsing API response:", error);
    throw new Error("Failed to parse the AI response. Please try again.");
  }
}
