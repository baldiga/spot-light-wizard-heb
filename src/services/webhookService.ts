
import { PresentationFormData, UserRegistrationData, PresentationOutline } from '@/types/presentation';

interface WebhookPayload {
  presentationData: PresentationFormData;
  userRegistration: UserRegistrationData;
  outline: PresentationOutline;
  timestamp: string;
}

export const sendToZapierWebhook = async (data: Omit<WebhookPayload, 'timestamp'>): Promise<void> => {
  const webhookUrl = 'https://hooks.zapier.com/hooks/catch/8626026/2j89gqh/';
  
  const payload: WebhookPayload = {
    ...data,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(payload),
    });

    console.log('Data sent to Zapier webhook successfully');
  } catch (error) {
    console.error('Failed to send data to Zapier webhook:', error);
    throw error;
  }
};
