import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { incrementVerificationAttempts } from '@/utils/supabaseHelpers';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Loader2, Shield, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  termsConsent: boolean;
  newsletterConsent: boolean;
}

interface VerificationData {
  email: string;
  code: string;
  expires_at: string;
  created_at: string;
}

// Add webhook function
const sendWebhook = async (userData: any) => {
  try {
    const webhookUrl = 'https://hook.eu2.make.com/your-webhook-url'; // Replace with actual URL
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      console.error('Webhook failed:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
};

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [currentStep, setCurrentStep] = useState<'form' | 'verification' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Login specific state
  const [loginEmail, setLoginEmail] = useState('');

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    termsConsent: false,
    newsletterConsent: false,
  });

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const checkRateLimit = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data && data.length >= 3) {
        const recentAttempts = data.filter(attempt => {
          const attemptTime = new Date(attempt.created_at).getTime();
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          return attemptTime > oneHourAgo;
        });

        if (recentAttempts.length >= 3) {
          const lastAttempt = new Date(recentAttempts[0].created_at).getTime();
          const blockedUntil = lastAttempt + (60 * 60 * 1000);
          const now = Date.now();
          
          if (now < blockedUntil) {
            setIsBlocked(true);
            setTimeRemaining(Math.ceil((blockedUntil - now) / 1000));
            return false;
          }
        }
      }

      await incrementVerificationAttempts(email);
      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const canProceed = await checkRateLimit(loginEmail);
      if (!canProceed) {
        toast({
          title: "נחסמת זמנית",
          description: `יותר מדי ניסיונות. נסה שוב בעוד ${Math.ceil(timeRemaining / 60)} דקות`,
          variant: "destructive"
        });
        return;
      }

      // Check if user exists and is verified
      const { data: existingUser } = await supabase
        .from('user_registrations')
        .select('*')
        .eq('email', loginEmail)
        .single();

      if (!existingUser) {
        toast({
          title: "משתמש לא נמצא",
          description: "האימייל הזה לא רשום במערכת",
          variant: "destructive"
        });
        return;
      }

      if (!existingUser.verified) {
        toast({
          title: "חשבון לא מאומת",
          description: "יש לאמת את החשבון קודם",
          variant: "destructive"
        });
        return;
      }

      // Generate verification code for login
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification code
      const { error: verificationError } = await supabase
        .from('email_verifications')
        .insert([{
          email: loginEmail,
          code: code,
          expires_at: expiresAt.toISOString(),
          used: false
        }]);

      if (verificationError) throw verificationError;

      // Send verification email via Supabase Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          to: loginEmail,
          code: code,
          firstName: existingUser.first_name
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
      }

      setVerificationData({
        email: loginEmail,
        code: code,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

      setCurrentStep('verification');

      toast({
        title: "קוד אימות נשלח",
        description: "בדוק את תיבת המייל שלך",
      });

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "שגיאה בהתחברות",
        description: error.message || "אירעה שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.termsConsent) {
        toast({
          title: "שגיאה",
          description: "יש לאשר את התנאים וההגבלות",
          variant: "destructive"
        });
        return;
      }

      const canProceed = await checkRateLimit(formData.email);
      if (!canProceed) {
        toast({
          title: "נחסמת זמנית",
          description: `יותר מדי ניסיונות. נסה שוב בעוד ${Math.ceil(timeRemaining / 60)} דקות`,
          variant: "destructive"
        });
        return;
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_registrations')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        toast({
          title: "משתמש כבר קיים",
          description: "האימייל הזה כבר רשום במערכת",
          variant: "destructive"
        });
        return;
      }

      // Create user registration
      const { data: newUser, error: userError } = await supabase
        .from('user_registrations')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          terms_consent: formData.termsConsent,
          newsletter_consent: formData.newsletterConsent,
          verified: false
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store verification code
      const { error: verificationError } = await supabase
        .from('email_verifications')
        .insert([{
          email: formData.email,
          code: code,
          expires_at: expiresAt.toISOString(),
          used: false
        }]);

      if (verificationError) throw verificationError;

      // Send verification email via Supabase Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          to: formData.email,
          code: code,
          firstName: formData.firstName
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        toast({
          title: "שגיאה בשליחת האימייל",
          description: "קוד האימות נוצר אך לא נשלח. נסה שוב מאוחר יותר",
          variant: "destructive"
        });
      }

      setVerificationData({
        email: formData.email,
        code: code,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

      setCurrentStep('verification');

      toast({
        title: "קוד אימות נשלח",
        description: "בדוק את תיבת המייל שלך",
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "שגיאה ברישום",
        description: error.message || "אירעה שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verify the code
      const emailToVerify = mode === 'login' ? loginEmail : formData.email;
      const { data: verification, error: verifyError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', emailToVerify)
        .eq('code', verificationCode)
        .eq('used', false)
        .single();

      if (verifyError || !verification) {
        toast({
          title: "קוד שגוי",
          description: "הקוד שהזנת אינו נכון",
          variant: "destructive"
        });
        return;
      }

      // Check if code expired
      if (new Date() > new Date(verification.expires_at)) {
        toast({
          title: "קוד פג תוקף",
          description: "הקוד פג תוקף. בקש קוד חדש",
          variant: "destructive"
        });
        return;
      }

      // Mark code as used
      await supabase
        .from('email_verifications')
        .update({ used: true })
        .eq('id', verification.id);

      if (mode === 'register') {
        // Mark user as verified for registration
        await supabase
          .from('user_registrations')
          .update({ verified: true })
          .eq('email', formData.email);

        // Send webhook notification
        await sendWebhook({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          registrationDate: new Date().toISOString()
        });
      }

      // Store verified email for mock auth
      localStorage.setItem('verified_email', emailToVerify);

      setCurrentStep('success');

      toast({
        title: mode === 'register' ? "רישום הושלם בהצלחה!" : "התחברות הושלמה בהצלחה!",
        description: mode === 'register' ? "ברוך הבא למערכת" : "ברוך השב למערכת",
      });

    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "שגיאה באימות",
        description: error.message || "אירעה שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsLoading(true);
    try {
      const emailToResend = mode === 'login' ? loginEmail : formData.email;
      const canProceed = await checkRateLimit(emailToResend);
      if (!canProceed) {
        toast({
          title: "נחסמת זמנית",
          description: `יותר מדי ניסיונות. נסה שוב בעוד ${Math.ceil(timeRemaining / 60)} דקות`,
          variant: "destructive"
        });
        return;
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await supabase
        .from('email_verifications')
        .insert([{
          email: emailToResend,
          code: code,
          expires_at: expiresAt.toISOString(),
          used: false
        }]);

      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          to: emailToResend,
          code: code,
          firstName: mode === 'login' ? 'משתמש' : formData.firstName
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
      }

      toast({
        title: "קוד חדש נשלח",
        description: "בדוק את תיבת המייל שלך",
      });

    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "שגיאה בשליחה מחדש",
        description: error.message || "אירעה שגיאה לא צפויה",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'register' ? 'רישום הושלם בהצלחה!' : 'התחברות הושלמה בהצלחה!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {mode === 'register' 
                  ? 'ברוך הבא למערכת. כעת תוכל להתחיל ליצור הרצאות מרתקות.'
                  : 'ברוך השב למערכת. תוכל להמשיך לעבוד על ההרצאות שלך.'
                }
              </p>
              <Button 
                onClick={() => navigate('/profile')}
                className="w-full bg-whiskey hover:bg-whiskey-dark text-white"
              >
                המשך לפרופיל
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full mt-2 border-whiskey text-whiskey hover:bg-whiskey/10"
              >
                חזרה לעמוד הבית
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <SpotlightLogo className="w-8 h-8 ml-2" />
              <CardTitle className="text-2xl font-bold text-center">אימות המייל</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isBlocked && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />
                  <div>
                    <p className="text-red-800 font-medium">חשבון זמנית חסום</p>
                    <p className="text-red-600 text-sm">
                      זמן נותר: {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <Label htmlFor="verification-code">קוד אימות (6 ספרות)</Label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="הזן קוד אימות"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  disabled={isLoading || isBlocked}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-whiskey hover:bg-whiskey-dark text-white"
                disabled={isLoading || verificationCode.length !== 6 || isBlocked}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    מאמת...
                  </>
                ) : (
                  'אמת קוד'
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  לא קיבלת קוד? 
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resendCode}
                  disabled={isLoading || isBlocked}
                  className="border-whiskey text-whiskey hover:bg-whiskey/10"
                >
                  שלח קוד חדש
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <SpotlightLogo className="w-8 h-8 ml-2" />
            <CardTitle className="text-2xl font-bold text-center">
              {mode === 'register' ? 'הרשמה למערכת' : 'התחברות למערכת'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isBlocked && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />
                <div>
                  <p className="text-red-800 font-medium">חשבון זמנית חסום</p>
                  <p className="text-red-600 text-sm">
                    יותר מדי ניסיונות. זמן נותר: {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={mode === 'register' ? handleFormSubmit : handleLogin} className="space-y-4">
            {mode === 'register' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">שם פרטי</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                      disabled={isLoading || isBlocked}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">שם משפחה</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                      disabled={isLoading || isBlocked}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">כתובת מייל</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={isLoading || isBlocked}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    disabled={isLoading || isBlocked}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2 space-x-reverse">
                    <Checkbox
                      id="terms"
                      checked={formData.termsConsent}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, termsConsent: checked as boolean})
                      }
                      disabled={isLoading || isBlocked}
                    />
                    <Label htmlFor="terms" className="text-sm leading-5">
                      אני מסכים/ה לתנאים וההגבלות ולמדיניות הפרטיות
                      <span className="text-red-500">*</span>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2 space-x-reverse">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletterConsent}
                      onCheckedChange={(checked) => 
                        setFormData({...formData, newsletterConsent: checked as boolean})
                      }
                      disabled={isLoading || isBlocked}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      אני מעוניין/ת לקבל עדכונים ותכנים בנושא הרצאות
                    </Label>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="login-email">כתובת מייל</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading || isBlocked}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-whiskey hover:bg-whiskey-dark text-white"
              disabled={isLoading || (mode === 'register' && !formData.termsConsent) || isBlocked}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {mode === 'register' ? 'רושם...' : 'מתחבר...'}
                </>
              ) : (
                mode === 'register' ? 'הרשם למערכת' : 'התחבר למערכת'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="border-whiskey text-whiskey hover:bg-whiskey/10"
                disabled={isLoading}
              >
                חזרה לעמוד הבית
              </Button>
            </div>

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              {mode === 'register' ? (
                <p className="text-sm text-gray-600">
                  כבר יש לך חשבון?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-whiskey hover:underline font-medium"
                    disabled={isLoading}
                  >
                    התחבר
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  אין לך חשבון?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-whiskey hover:underline font-medium"
                    disabled={isLoading}
                  >
                    הירשם
                  </button>
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
