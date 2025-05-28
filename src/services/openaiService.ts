
import { PresentationFormData, PresentationOutline } from '@/types/presentation';
import { generateId } from '@/utils/helpers';

/**
 * This service is not used in the browser environment.
 * All OpenAI calls are handled through Supabase Edge Functions.
 * This file is kept for type compatibility but functions throw errors if called.
 */

/**
 * Sanitizes Hebrew text for JSON compatibility
 */
function sanitizeText(text: string): string {
  return text
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\\/g, '\\\\');
}

/**
 * Cleans and validates JSON response with enhanced error handling
 */
function cleanAndParseJSON(response: string): any {
  try {
    console.log('Raw AI response:', response.substring(0, 500) + '...');
    
    // Remove any markdown formatting
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object boundaries
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No JSON object found in response');
    }
    
    cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
    
    // Enhanced JSON cleaning for Hebrew text
    cleanResponse = cleanResponse
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
      .replace(/:\s*'([^']*)'/g, ': "$1"') // Replace single quotes with double quotes
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/\r/g, '') // Remove carriage returns
      .trim();
    
    console.log('Cleaned JSON:', cleanResponse.substring(0, 300) + '...');
    
    // Validate JSON before parsing
    const parsed = JSON.parse(cleanResponse);
    console.log('Successfully parsed JSON');
    
    return parsed;
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Raw response length:', response.length);
    console.error('Response preview:', response.substring(0, 1000));
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * These functions are not used in browser environment - all calls go through Supabase Edge Functions
 */
export async function generatePresentationOutline(formData: PresentationFormData): Promise<PresentationOutline> {
  throw new Error('This function should not be called in browser environment. Use presentationService instead.');
}

export async function generateDynamicSlideStructure(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  throw new Error('This function should not be called in browser environment. Use presentationService instead.');
}

export async function generateDynamicB2BEmail(formData: PresentationFormData, outline: PresentationOutline): Promise<string> {
  throw new Error('This function should not be called in browser environment. Use presentationService instead.');
}

export async function generateDynamicSalesStrategy(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  throw new Error('This function should not be called in browser environment. Use presentationService instead.');
}

export async function generatePresentationTools(formData: PresentationFormData, outline: PresentationOutline): Promise<any> {
  throw new Error('This function should not be called in browser environment. Use presentationService instead.');
}

/**
 * Parses the API response and formats it to match our PresentationOutline interface
 */
function parseApiResponse(response: string): PresentationOutline {
  try {
    const parsedResponse = cleanAndParseJSON(response);
    
    // Add IDs to chapters and points
    const chaptersWithIds = parsedResponse.chapters.map((chapter: any) => ({
      id: generateId(),
      title: chapter.title,
      points: chapter.points.map((point: any) => ({
        id: generateId(),
        content: point.content
      }))
    }));

    // Add IDs to sales process steps if they exist
    const salesProcessWithIds = parsedResponse.salesProcess ? 
      parsedResponse.salesProcess.map((step: any, index: number) => ({
        id: generateId(),
        title: step.title,
        description: step.description,
        order: step.order || index + 1
      })) : [];
    
    return {
      chapters: chaptersWithIds,
      openingStyles: parsedResponse.openingStyles || [],
      timeDistribution: parsedResponse.timeDistribution || "",
      interactiveActivities: parsedResponse.interactiveActivities || [],
      presentationStructure: parsedResponse.presentationStructure || "",
      discussionQuestions: parsedResponse.discussionQuestions || {},
      salesGuide: parsedResponse.salesGuide || "",
      postPresentationPlan: parsedResponse.postPresentationPlan || "",
      motivationalMessage: parsedResponse.motivationalMessage || "",
      salesProcess: salesProcessWithIds
    };
  } catch (error) {
    console.error("Error parsing API response:", error);
    throw new Error("Failed to parse the AI response. Please try again.");
  }
}
