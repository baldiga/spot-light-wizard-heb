
import { supabase } from '@/integrations/supabase/client';
import { PresentationFormData, PresentationOutline, MarketingContent, MarketingVisuals, EnhancedStrategy } from '@/types/presentation';

export const generatePresentationOutline = async (formData: PresentationFormData): Promise<PresentationOutline> => {
  console.log('Calling generate-outline function...');
  
  const { data, error } = await supabase.functions.invoke('generate-outline', {
    body: { formData }
  });

  if (error) {
    console.error('Supabase function error:', error);
    throw new Error(`Failed to generate outline: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from outline generation');
  }

  console.log('Outline generated successfully');
  return data;
};

export const generateMarketingContent = async (formData: PresentationFormData): Promise<MarketingContent> => {
  console.log('Calling generate-marketing-content function...');
  
  const { data, error } = await supabase.functions.invoke('generate-marketing-content', {
    body: { formData }
  });

  if (error) {
    console.error('Marketing content generation error:', error);
    throw new Error(`Failed to generate marketing content: ${error.message}`);
  }

  if (!data) {
    throw new Error('No marketing content data returned');
  }

  console.log('Marketing content generated successfully');
  return data;
};

export const generateMarketingVisuals = async (formData: PresentationFormData): Promise<MarketingVisuals> => {
  console.log('Calling generate-marketing-visuals function...');
  
  const { data, error } = await supabase.functions.invoke('generate-marketing-visuals', {
    body: { formData }
  });

  if (error) {
    console.error('Marketing visuals generation error:', error);
    throw new Error(`Failed to generate marketing visuals: ${error.message}`);
  }

  if (!data) {
    throw new Error('No marketing visuals data returned');
  }

  console.log('Marketing visuals generated successfully');
  return data;
};

export const generateSalesStrategy = async (formData: PresentationFormData, outline: PresentationOutline): Promise<EnhancedStrategy> => {
  console.log('Calling generate-strategy function...');
  
  const { data, error } = await supabase.functions.invoke('generate-strategy', {
    body: { formData, outline }
  });

  if (error) {
    console.error('Strategy generation error:', error);
    throw new Error(`Failed to generate strategy: ${error.message}`);
  }

  if (!data) {
    throw new Error('No strategy data returned');
  }

  console.log('Strategy generated successfully');
  return data;
};
