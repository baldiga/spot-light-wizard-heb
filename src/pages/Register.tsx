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
  const [mode, setMode] = useState<'register' | 'login' | 'verify'>('register');
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    termsConsent: false,
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingAuthData, setPendingAuthData] = useState<any>(null);

  // Check if user is already authenticated and handle redirection
  useEffect(() => {
    if (!authLoading && user) {
      // Check if there's a post-auth destination
      const postAuthDestination = sessionStorage.getItem('post_auth_destination');
      if (postAuthDestination) {
        sessionStorage.removeItem('post_auth_destination');
        navigate(postAuthDestination);
      } else {
        navigate('/presentation-summary');
      }
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

      // Store registration data for after verification
      setPendingAuthData({
        type: 'register',
        ...formData
      });

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user exists in our database first
      const { data: existingUser } = await supabase
        .from('user_registrations')
        .select('email, first_name')
        .eq('email', loginData.email)
        .single();

      if (!existingUser) {
        toast({
          title: "שגיאה",
          description: "כתובת המייל לא נמצאה במערכת",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Try to sign in with Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        // If password is wrong or user doesn't exist in auth, send verification code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await supabase
          .from('email_verifications')
          .insert({
            email: loginData.email,
            code: code,
            expires_at: expiresAt.toISOString(),
          });

        await supabase.functions.invoke('send-verification-email', {
          body: {
            email: loginData.email,
            firstName: existingUser.first_name,
            code: code,
          },
        });

        setPendingAuthData({
          type: 'login',
          email: loginData.email,
          password: loginData.password
        });

        setMode('verify');
        toast({
          title: "קוד אימות נשלח",
          description: "בדוק את תיבת המייל שלך וזין את קוד האימות",
        });
      } else {
        // Login successful
        toast({
          title: "התחברות הושלמה בהצלחה!",
          description: "ברוכים השבים ל-Spotlight",
        });

        // Navigate to post-auth destination
        const postAuthDestination = sessionStorage.getItem('post_auth_destination');
        if (postAuthDestination) {
          sessionStorage.removeItem('post_auth_destination');
          navigate(postAuthDestination);
        } else {
          navigate('/presentation-summary');
        }
      }

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "שגיאה בהתחברות",
        description: "אירעה שגיאה בתהליך ההתחברות. נסה שנית.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailToVerify = pendingAuthData?.email || formData.email;

    try {
      // Verify the code
      const { data: verification, error: verificationError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', emailToVerify)
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
          description: "קוד האימות פג תוקף. נסה להתחבר שנית.",
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

      if (pendingAuthData?.type === 'register') {
        // Create Supabase auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: pendingAuthData.email,
          password: pendingAuthData.password,
          options: {
            data: {
              first_name: pendingAuthData.firstName,
              last_name: pendingAuthData.lastName,
            }
          }
        });

        if (authError) throw authError;

        // Store user registration data
        const { error: registrationError } = await supabase
          .from('user_registrations')
          .insert({
            first_name: pendingAuthData.firstName,
            last_name: pendingAuthData.lastName,
            phone: pendingAuthData.phone,
            email: pendingAuthData.email,
            newsletter_consent: false,
            terms_consent: pendingAuthData.termsConsent,
            verified: true,
          });

        if (registrationError) throw registrationError;

        toast({
          title: "רישום הושלם בהצלחה!",
          description: "ברוכים הבאים ל-Spotlight",
        });

      } else {
        // Login existing user - create Supabase auth user if doesn't exist
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: pendingAuthData.email,
          password: pendingAuthData.password,
        });

        if (signInError) {
          // If sign in fails, try to sign up (migrate existing user to auth)
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: pendingAuthData.email,
            password: pendingAuthData.password,
          });

          if (signUpError) throw signUpError;
        }

        toast({
          title: "התחברות הושלמה בהצלחה!",
          description: "ברוכים השבים ל-Spotlight",
        });
      }

      // Navigate to post-auth destination
      const postAuthDestination = sessionStorage.getItem('post_auth_destination');
      if (postAuthDestination) {
        sessionStorage.removeItem('post_auth_destination');
        navigate(postAuthDestination);
      } else {
        navigate('/presentation-summary');
      }

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
      const emailToSend = pendingAuthData?.email || formData.email;
      const nameToSend = pendingAuthData?.firstName || 'משתמש';

      await supabase
        .from('email_verifications')
        .insert({
          email: emailToSend,
          code: code,
          expires_at: expiresAt.toISOString(),
        });

      await supabase.functions.invoke('send-verification-email', {
        body: {
          email: emailToSend,
          firstName: nameToSend,
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
            {mode === 'register' && step === 'register' && 'הרשמה ל-Spotlight'}
            {mode === 'login' && 'התחברות ל-Spotlight'}
            {(mode === 'verify' || step === 'verify') && 'אימות כתובת מייל'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'register' && step === 'register' && 'צור חשבון חדש כדי לראות את הסיכום המלא של ההרצאה'}
            {mode === 'login' && 'התחבר לחשבון הקיים שלך'}
            {(mode === 'verify' || step === 'verify') && 'הזן את קוד האימות שנשלח לכתובת המייל שלך'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {mode === 'register' && step === 'register' && 'פרטים אישיים'}
              {mode === 'login' && 'פרטי התחברות'}
              {(mode === 'verify' || step === 'verify') && 'קוד אימות'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === 'register' && step === 'register' ? (
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
                      maxLength={500}
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
                      maxLength={500}
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
                    maxLength={500}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="text-right"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    סיסמה *
                  </label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="text-right"
                    placeholder="לפחות 6 תווים"
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
                    maxLength={500}
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

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode('login')}
                    className="text-whiskey hover:text-whiskey-dark"
                  >
                    כבר יש לך חשבון? התחבר כאן
                  </Button>
                </div>
              </form>
            ) : mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    כתובת מייל *
                  </label>
                  <Input
                    id="loginEmail"
                    type="email"
                    required
                    maxLength={500}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="text-right"
                    placeholder="הזן את כתובת המייל שלך"
                  />
                </div>

                <div>
                  <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    סיסמה *
                  </label>
                  <Input
                    id="loginPassword"
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="text-right"
                    placeholder="הזן את הסיסמה שלך"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-whiskey hover:bg-whiskey-dark text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      מתחבר...
                    </>
                  ) : (
                    'התחבר'
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode('register')}
                    className="text-whiskey hover:text-whiskey-dark"
                  >
                    אין לך חשבון? הירשם כאן
                  </Button>
                </div>
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
                  <p>נשלח קוד אימות לכתובת: {pendingAuthData?.email || formData.email}</p>
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
                    'אמת והמשך'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (mode === 'verify') {
                      setMode('login');
                    } else {
                      setStep('register');
                    }
                    setVerificationCode('');
                    setPendingAuthData(null);
                  }}
                  className="w-full"
                >
                  {mode === 'verify' ? 'חזרה להתחברות' : 'חזרה לטופס הרישום'}
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
