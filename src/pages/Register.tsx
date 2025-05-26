
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    termsConsent: false,
  });
  const [verificationCode, setVerificationCode] = useState('');

  // Check if user is already authenticated and redirect to summary
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/presentation-summary');
    }
  }, [user, authLoading, navigate]);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsConsent) {
      toast({
        title: "שגיאה",
        description: "יש לאשר את תנאי השימוש",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('user_registrations')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        toast({
          title: "שגיאה",
          description: "כתובת המייל כבר רשומה במערכת",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Generate verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Store verification code
      const { error: verificationError } = await supabase
        .from('email_verifications')
        .insert({
          email: formData.email,
          code: code,
          expires_at: expiresAt.toISOString(),
        });

      if (verificationError) throw verificationError;

      // Send verification email
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: formData.email,
          firstName: formData.firstName,
          code: code,
        },
      });

      if (emailError) throw emailError;

      setStep('verify');
      toast({
        title: "קוד אימות נשלח",
        description: "בדוק את תיבת המייל שלך וזין את קוד האימות",
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "שגיאה ברישום",
        description: "אירעה שגיאה בתהליך הרישום. נסה שנית.",
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
      const { data: verification, error: verificationError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', formData.email)
        .eq('code', verificationCode)
        .eq('used', false)
        .single();

      if (verificationError || !verification) {
        toast({
          title: "קוד שגוי",
          description: "קוד האימות שהוזן אינו תקין",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Check if code is expired
      if (new Date(verification.expires_at) < new Date()) {
        toast({
          title: "קוד פג תוקף",
          description: "קוד האימות פג תוקף. נסה לרשום שנית.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Mark verification as used
      await supabase
        .from('email_verifications')
        .update({ used: true })
        .eq('id', verification.id);

      // Create user registration
      const { error: registrationError } = await supabase
        .from('user_registrations')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          newsletter_consent: false,
          terms_consent: formData.termsConsent,
          verified: true,
        });

      if (registrationError) throw registrationError;

      toast({
        title: "רישום הושלם בהצלחה!",
        description: "ברוכים הבאים ל-Spotlight",
      });

      navigate('/presentation-summary');

    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "שגיאה באימות",
        description: "אירעה שגיאה בתהליך האימות. נסה שנית.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    setIsLoading(true);
    
    try {
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await supabase
        .from('email_verifications')
        .insert({
          email: formData.email,
          code: code,
          expires_at: expiresAt.toISOString(),
        });

      await supabase.functions.invoke('send-verification-email', {
        body: {
          email: formData.email,
          firstName: formData.firstName,
          code: code,
        },
      });

      toast({
        title: "קוד חדש נשלח",
        description: "קוד אימות חדש נשלח לכתובת המייל שלך",
      });

    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח קוד חדש. נסה שנית.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-whiskey" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <SpotlightLogo className="mx-auto h-12 w-12" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {step === 'register' ? 'הרשמה ל-Spotlight' : 'אימות כתובת מייל'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'register' 
              ? 'צור חשבון חדש כדי לראות את הסיכום המלא של ההרצאה'
              : 'הזן את קוד האימות שנשלח לכתובת המייל שלך'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === 'register' ? 'פרטים אישיים' : 'קוד אימות'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      שם פרטי *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="text-right"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      שם משפחה *
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="text-right"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    כתובת מייל *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-right"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    מספר טלפון *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-right"
                    placeholder="050-1234567"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="terms"
                      checked={formData.termsConsent}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, termsConsent: checked as boolean })
                      }
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      אני מסכים ל<a href="https://amirbaldiga.com/תקנון-אתר" target="_blank" rel="noopener noreferrer" className="text-whiskey hover:text-whiskey-dark underline">תנאי השימוש ומדיניות הפרטיות</a> *
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-whiskey hover:bg-whiskey-dark text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      נרשם...
                    </>
                  ) : (
                    'הרשם'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerification} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    קוד אימות (6 ספרות)
                  </label>
                  <Input
                    id="code"
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-lg font-mono letter-spacing-2"
                    placeholder="123456"
                  />
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>נשלח קוד אימות לכתובת: {formData.email}</p>
                  <button
                    type="button"
                    onClick={resendCode}
                    disabled={isLoading}
                    className="text-whiskey hover:text-whiskey-dark underline mt-2"
                  >
                    שלח קוד חדש
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-whiskey hover:bg-whiskey-dark text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      מאמת...
                    </>
                  ) : (
                    'אמת ושלם רישום'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('register')}
                  className="w-full"
                >
                  חזרה לטופס הרישום
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate('/')}
            className="text-whiskey hover:text-whiskey-dark"
          >
            חזרה לעמוד הבית
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
