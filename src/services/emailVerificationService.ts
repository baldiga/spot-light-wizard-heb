
// Simple email verification service for demo purposes
// In production, this would be replaced with a proper backend service

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

export const sendVerificationCode = async (email: string): Promise<string> => {
  const code = generateVerificationCode();
  
  // Store the code locally (in production, this would be handled by backend)
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
  
  // In production, this would send an actual email
  // For demo purposes, we'll show the code in console
  console.log(`Verification code for ${email}: ${code}`);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return code;
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
