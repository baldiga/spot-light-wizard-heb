
import { supabase } from "@/integrations/supabase/client";

interface VerificationCode {
  email: string;
  code: string;
  timestamp: number;
}

const VERIFICATION_CODES_KEY = 'email_verification_codes';
const CODE_EXPIRY_MINUTES = 10;

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationCode = async (email: string): Promise<{ success: boolean; code?: string; rateLimited?: boolean; remainingTime?: number }> => {
  try {
    // Call the Supabase edge function to send the verification email
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email }
    });

    if (error) {
      console.error('Error calling edge function:', error);
      throw new Error('Failed to send verification email');
    }

    // Check if rate limited
    if (data.rateLimited) {
      return {
        success: false,
        rateLimited: true,
        remainingTime: data.remainingTime
      };
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to send verification email');
    }

    // Store the code locally for verification (in production, this would be handled server-side)
    const code = data.code;
    const codes: VerificationCode[] = JSON.parse(localStorage.getItem(VERIFICATION_CODES_KEY) || '[]');
    const newCode: VerificationCode = {
      email,
      code,
      timestamp: Date.now()
    };
    
    // Remove old codes for this email
    const filteredCodes = codes.filter(c => c.email !== email);
    filteredCodes.push(newCode);
    
    localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(filteredCodes));
    
    console.log(`Verification code sent to ${email} via Resend`);
    
    return { success: true, code };
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

export const verifyCode = (email: string, inputCode: string): boolean => {
  const codes: VerificationCode[] = JSON.parse(localStorage.getItem(VERIFICATION_CODES_KEY) || '[]');
  const now = Date.now();
  
  const validCode = codes.find(c => 
    c.email === email && 
    c.code === inputCode && 
    (now - c.timestamp) < (CODE_EXPIRY_MINUTES * 60 * 1000)
  );
  
  if (validCode) {
    // Remove the used code
    const filteredCodes = codes.filter(c => !(c.email === email && c.code === inputCode));
    localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(filteredCodes));
    return true;
  }
  
  return false;
};
