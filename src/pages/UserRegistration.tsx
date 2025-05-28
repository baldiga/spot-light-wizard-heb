import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserRegistrationData } from '@/types/presentation';
import { useToast } from '@/hooks/use-toast';
import { usePresentationStore } from '@/store/presentationStore';
import SpotlightLogo from '@/components/SpotlightLogo';
import CountdownTimer from '@/components/CountdownTimer';
import { sendVerificationCode, verifyCode } from '@/services/emailVerificationService';
import { Mail, Check, Loader2, Clock } from 'lucide-react';

const UserRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, setUserRegistration } = usePresentationStore();
  
  const [userData, setUserData] = useState<UserRegistrationData>({
    fullName: '',
    email: '',
    phone: '',
    emailConsent: false,
    emailVerified: false
  });
  
  const [verificationCode, setVerificationCodeInput] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isLimited: boolean; remainingTime: number } | null>(null);

  React.useEffect(() => {
    if (!formData) {
      toast({
        title: "מידע חסר",
        description: "אנא מלא את טופס פרטי ההרצאה תחילה",
        variant: "destructive",
      });
      navigate('/create');
    }
  }, [formData, navigate, toast]);

  const updateField = (field: keyof UserRegistrationData, value: string | boolean) => {
    setUserData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset email verification if email changes
      ...(field === 'email' && { emailVerified: false })
    }));
    
    // Reset verification state if email changes
    if (field === 'email') {
      setIsCodeSent(false);
      setVerificationCodeInput('');
      setRateLimitInfo(null);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!userData.email || !userData.email.includes('@')) {
      toast({
        title: "אימייל לא תקין",
        description: "אנא הזן כתובת אימייל תקינה",
        variant: "destructive",
      });
      return;
    }

    setIsSendingCode(true);
    setRateLimitInfo(null);
    
    try {
      const result = await sendVerificationCode(userData.email);
      
      if (result.rateLimited && result.remainingTime) {
        setRateLimitInfo({
          isLimited: true,
          remainingTime: result.remainingTime
        });
        toast({
          title: "הגבלת שליחה",
          description: "ניתן לשלוח קוד אימות רק פעם אחת ב-24 שעות",
          variant: "destructive",
        });
      } else if (result.success) {
        setIsCodeSent(true);
        toast({
          title: "קוד נשלח",
          description: `קוד אימות נשלח לכתובת ${userData.email}. בדוק את תיבת הדואר שלך (ואת תיקיית הספאם)`,
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה בשליחת קוד",
        description: "אירעה שגיאה בשליחת קוד האימות. נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "קוד חסר",
        description: "אנא הזן את קוד האימות",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = verifyCode(userData.email, verificationCode.trim());
      if (isValid) {
        setUserData(prev => ({ ...prev, emailVerified: true }));
        toast({
          title: "אימייל אומת בהצלחה",
          description: "כתובת האימייל שלך אומתה בהצלחה",
        });
      } else {
        toast({
          title: "קוד שגוי",
          description: "קוד האימות שגוי או פג תוקף. נסה שנית או שלח קוד חדש.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה באימות",
        description: "אירעה שגיאה באימות הקוד. נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCountdownExpire = () => {
    setRateLimitInfo(null);
  };

  const validateForm = () => {
    if (!userData.fullName.trim()) {
      toast({
        title: "שם מלא חסר",
        description: "אנא הזן את השם המלא שלך",
        variant: "destructive",
      });
      return false;
    }
    
    if (!userData.email.trim() || !userData.email.includes('@')) {
      toast({
        title: "אימייל חסר או לא תקין",
        description: "אנא הזן כתובת אימייל תקינה",
        variant: "destructive",
      });
      return false;
    }

    if (!userData.emailVerified) {
      toast({
        title: "אימייל לא אומת",
        description: "אנא אמת את כתובת האימייל שלך לפני המשך",
        variant: "destructive",
      });
      return false;
    }
    
    if (!userData.phone.trim()) {
      toast({
        title: "מספר טלפון חסר",
        description: "אנא הזן את מספר הטלפון שלך",
        variant: "destructive",
      });
      return false;
    }
    
    if (!userData.emailConsent) {
      toast({
        title: "הסכמה חסרה",
        description: "אנא אשר את הסכמתך לקבלת עדכונים באימייל",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setUserRegistration(userData);
      navigate('/outline-confirmation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <SpotlightLogo className="w-12 h-12 mr-3" />
          <h1 className="text-3xl font-bold text-gray-dark">פרטים אישיים</h1>
        </div>

        <Card className="border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-dark">
              כדי ליצור עבורך הרצאה מותאמת אישית, נזדקק לפרטים הבאים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא *</Label>
              <Input
                id="fullName"
                placeholder="הזן את השם המלא שלך"
                value={userData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="rtl-form"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">כתובת אימייל *</Label>
              <Input
                id="email"
                type="email"
                placeholder="הזן את כתובת האימייל שלך"
                value={userData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="rtl-form"
                disabled={userData.emailVerified}
              />
              
              {/* Proactive notification about rate limit */}
              <div className="flex items-center text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                <Clock className="w-4 h-4 mr-2" />
                <span>ניתן לשלוח קוד אימות רק פעם אחת ב-24 שעות לכל כתובת אימייל</span>
              </div>
              
              {userData.emailVerified ? (
                <div className="flex items-center text-green-600 text-sm">
                  <Check className="w-4 h-4 mr-2" />
                  אימייל אומת בהצלחה
                </div>
              ) : (
                <div className="space-y-3">
                  {rateLimitInfo?.isLimited ? (
                    <CountdownTimer 
                      remainingTime={rateLimitInfo.remainingTime}
                      onExpire={handleCountdownExpire}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendVerificationCode}
                        disabled={!userData.email || isSendingCode}
                        className="border-whiskey text-whiskey hover:bg-whiskey/10"
                      >
                        {isSendingCode ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            שולח...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            שלח קוד אימות
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {isCodeSent && (
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">קוד אימות</Label>
                      <div className="flex gap-2">
                        <Input
                          id="verificationCode"
                          placeholder="הזן קוד 6 ספרות"
                          value={verificationCode}
                          onChange={(e) => setVerificationCodeInput(e.target.value)}
                          maxLength={6}
                          className="rtl-form"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={!verificationCode.trim() || isVerifying}
                          className="bg-whiskey hover:bg-whiskey-dark text-white"
                        >
                          {isVerifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'אמת'
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        נשלח קוד אימות לכתובת האימייל שלך. אם לא קיבלת, בדוק את תיקיית הספאם.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">מספר טלפון *</Label>
              <Input
                id="phone"
                placeholder="הזן את מספר הטלפון שלך"
                value={userData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="rtl-form"
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="emailConsent"
                checked={userData.emailConsent}
                onCheckedChange={(checked) => updateField('emailConsent', checked as boolean)}
              />
              <Label htmlFor="emailConsent" className="text-sm">
                אני מסכים/ה לקבל עדכונים, טיפים ומידע רלוונטי באימייל *
              </Label>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>חשוב לדעת:</strong> נשלח לך קוד אימות לאימייל שהזנת. 
                יש לאמת את האימייל לפני שנוכל להמשיך ליצירת ההרצאה.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline"
                onClick={() => navigate('/create')}
                className="border-whiskey text-whiskey hover:bg-whiskey/10"
              >
                חזרה
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-whiskey hover:bg-whiskey-dark text-white"
              >
                המשך ליצירת ההרצאה
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserRegistration;
