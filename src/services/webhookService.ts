
import { PresentationFormData, UserRegistrationData, PresentationOutline } from '@/types/presentation';

interface FlatWebhookPayload {
  // User data
  user_full_name: string;
  user_email: string;
  user_phone: string;
  user_email_consent: boolean;
  user_email_verified: boolean;
  
  // Presentation data
  presentation_idea: string;
  presentation_speaker_background: string;
  presentation_audience_profile: string;
  presentation_duration: string;
  presentation_service_or_product: string;
  presentation_call_to_action: string;
  
  // Outline data
  outline_chapters_count: number;
  outline_chapters_json: string;
  outline_opening_styles: string;
  outline_time_distribution: string;
  outline_interactive_activities: string;
  outline_presentation_structure: string;
  outline_sales_guide: string;
  outline_post_presentation_plan: string;
  
  // Metadata
  timestamp: string;
  source: string;
}

export const sendToZapierWebhook = async (data: {
  presentationData: PresentationFormData;
  userRegistration: UserRegistrationData;
  outline: PresentationOutline;
}): Promise<void> => {
  const webhookUrl = 'https://hooks.zapier.com/hooks/catch/8626026/2j89gqh/';
  
  // Flatten the data structure for better Zapier compatibility
  const payload: FlatWebhookPayload = {
    // User data
    user_full_name: data.userRegistration.fullName,
    user_email: data.userRegistration.email,
    user_phone: data.userRegistration.phone,
    user_email_consent: data.userRegistration.emailConsent,
    user_email_verified: data.userRegistration.emailVerified,
    
    // Presentation data
    presentation_idea: data.presentationData.idea,
    presentation_speaker_background: data.presentationData.speakerBackground,
    presentation_audience_profile: data.presentationData.audienceProfile,
    presentation_duration: data.presentationData.duration,
    presentation_service_or_product: data.presentationData.serviceOrProduct,
    presentation_call_to_action: data.presentationData.callToAction,
    
    // Outline data
    outline_chapters_count: data.outline.chapters.length,
    outline_chapters_json: JSON.stringify(data.outline.chapters),
    outline_opening_styles: data.outline.openingStyles.join(' | '),
    outline_time_distribution: data.outline.timeDistribution,
    outline_interactive_activities: data.outline.interactiveActivities.join(' | '),
    outline_presentation_structure: data.outline.presentationStructure,
    outline_sales_guide: data.outline.salesGuide,
    outline_post_presentation_plan: data.outline.postPresentationPlan,
    
    // Metadata
    timestamp: new Date().toISOString(),
    source: 'SpotlightApp'
  };

  try {
    console.log('Sending data to Zapier webhook:', {
      url: webhookUrl,
      payload: payload
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SpotlightApp/1.0',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    console.log('Zapier webhook response status:', response.status);
    console.log('Zapier webhook response ok:', response.ok);

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Zapier webhook error response:', responseText);
      throw new Error(`Webhook failed with status ${response.status}: ${responseText}`);
    }

    const responseData = await response.text();
    console.log('Zapier webhook success response:', responseData);
    console.log('Data sent to Zapier webhook successfully');

  } catch (error) {
    console.error('Failed to send data to Zapier webhook:', error);
    
    // Try alternative format if the first attempt fails
    try {
      console.log('Trying alternative format...');
      
      // Convert to form data format
      const formData = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const alternativeResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SpotlightApp/1.0'
        },
        body: formData,
      });

      if (alternativeResponse.ok) {
        console.log('Alternative format succeeded');
        return;
      }
    } catch (alternativeError) {
      console.error('Alternative format also failed:', alternativeError);
    }
    
    throw error;
  }
};
