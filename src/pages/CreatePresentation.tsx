import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PresentationFormData } from '@/types/presentation';
import { useToast } from '@/hooks/use-toast';
import { createEmptyPresentationFormData } from '@/utils/helpers';
import { usePresentationStore } from '@/store/presentationStore';
import { useAuth } from '@/hooks/useAuth';
import SpotlightLogo from '@/components/SpotlightLogo';

const CreatePresentation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { setFormData } = usePresentationStore();
  const [formData, setLocalFormData] = useState<PresentationFormData>(createEmptyPresentationFormData());
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const updateFormField = (field: keyof PresentationFormData, value: string) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.idea.trim()) {
        toast({
          title: "שדה חסר",
          description: "אנא הזן את הרעיון הכללי של ההרצאה",
          variant: "destructive"
        });
        return false;
      }
      if (formData.idea.length < 50) {
        toast({
          title: "תיאור קצר מדי",
          description: "אנא הזן לפחות 50 תווים עבור הרעיון הכללי",
          variant: "destructive"
        });
        return false;
      }
      if (!formData.speakerBackground.trim()) {
        toast({
          title: "שדה חסר",
          description: "אנא הזן את הרקע המקצועי שלך",
          variant: "destructive"
        });
        return false;
      }
      if (formData.speakerBackground.length < 50) {
        toast({
          title: "תיאור קצר מדי",
          description: "אנא הזן לפחות 50 תווים עבור הרקע המקצועי",
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.audienceProfile.trim()) {
        toast({
          title: "שדה חסר",
          description: "אנא הזן מידע על פרופיל הקהל",
          variant: "destructive"
        });
        return false;
      }
      if (formData.audienceProfile.length < 50) {
        toast({
          title: "תיאור קצר מדי",
          description: "אנא הזן לפחות 50 תווים עבור פרופיל הקהל",
          variant: "destructive"
        });
        return false;
      }
      if (!formData.duration) {
        toast({
          title: "שדה חסר",
          description: "אנא בחר את משך ההרצאה",
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.serviceOrProduct.trim()) {
        toast({
          title: "שדה חסר",
          description: "אנא הזן את השירות או המוצר שברצונך לקדם",
          variant: "destructive"
        });
        return false;
      }
      if (formData.serviceOrProduct.length < 50) {
        toast({
          title: "תיאור קצר מדי",
          description: "אנא הזן לפחות 50 תווים עבור השירות/מוצר",
          variant: "destructive"
        });
        return false;
      }
      if (!formData.callToAction.trim()) {
        toast({
          title: "שדה חסר",
          description: "אנא הזן את הקריאה לפעולה בסיום ההרצאה",
          variant: "destructive"
        });
        return false;
      }
      if (formData.callToAction.length < 50) {
        toast({
          title: "תיאור קצר מדי",
          description: "אנא הזן לפחות 50 תווים עבור הקריאה לפעולה",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Always save form data to store first
    setFormData(formData);
    
    // Check if user is authenticated
    if (!authLoading && user) {
      // User is authenticated, go directly to processing
      navigate('/processing-outline');
    } else {
      // User is not authenticated, redirect to register
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <SpotlightLogo className="w-12 h-12 mr-3" />
          <h1 className="text-3xl font-bold text-gray-dark">יצירת הרצאה חדשה</h1>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <React.Fragment key={index}>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep > index ? 'bg-whiskey text-white' : currentStep === index + 1 ? 'bg-whiskey-light text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {index + 1}
                </div>
                {index < totalSteps - 1 && <div className={`flex-1 h-1 mx-2 ${currentStep > index + 1 ? 'bg-whiskey' : 'bg-gray-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>
          <div className="text-sm text-gray-500 text-center">
            {currentStep === 1 && 'פרטי ההרצאה והמרצה'}
            {currentStep === 2 && 'פרטי הקהל ומשך ההרצאה'}
            {currentStep === 3 && 'מוצר/שירות וקריאה לפעולה'}
          </div>
        </div>

        <Card className="border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-dark">
              {currentStep === 1 && 'ספר לנו על ההרצאה שלך'}
              {currentStep === 2 && 'ספר לנו על הקהל שלך'}
              {currentStep === 3 && 'ספר לנו על המטרות העסקיות שלך'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="idea">רעיון כללי של ההרצאה (לפחות 50 תווים)</Label>
                  <Textarea
                    id="idea"
                    placeholder="מהו הנושא העיקרי של ההרצאה שלך? מה המסר המרכזי?"
                    rows={4}
                    value={formData.idea}
                    onChange={(e) => updateFormField('idea', e.target.value)}
                    className="resize-none rtl-form"
                  />
                  <div className="text-sm text-gray-500 text-right">
                    {formData.idea.length}/50 תווים מינימום
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speakerBackground">רקע המרצה – ניסיון מקצועי וסגנון (לפחות 50 תווים)</Label>
                  <Textarea
                    id="speakerBackground"
                    placeholder="מה הניסיון שלך בתחום? מהו סגנון ההרצאה המועדף עליך?"
                    rows={4}
                    value={formData.speakerBackground}
                    onChange={(e) => updateFormField('speakerBackground', e.target.value)}
                    className="resize-none rtl-form"
                  />
                  <div className="text-sm text-gray-500 text-right">
                    {formData.speakerBackground.length}/50 תווים מינימום
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="audienceProfile">פרופיל הקהל – גיל, תפקיד, רקע, רמת ידע (לפחות 50 תווים)</Label>
                  <Textarea
                    id="audienceProfile"
                    placeholder="מיהו קהל היעד שלך? מה הגיל, התפקיד, הרקע ורמת הידע שלהם?"
                    rows={4}
                    value={formData.audienceProfile}
                    onChange={(e) => updateFormField('audienceProfile', e.target.value)}
                    className="resize-none rtl-form"
                  />
                  <div className="text-sm text-gray-500 text-right">
                    {formData.audienceProfile.length}/50 תווים מינימום
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>משך הרצאה</Label>
                  <RadioGroup
                    value={formData.duration}
                    onValueChange={(value) => updateFormField('duration', value as "30" | "45" | "60" | "75" | "90" | "120")}
                    className="flex flex-wrap gap-4 justify-end text-right dir-rtl"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Label htmlFor="duration-30">30 דקות</Label>
                      <RadioGroupItem value="30" id="duration-30" />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Label htmlFor="duration-45">45 דקות</Label>
                      <RadioGroupItem value="45" id="duration-45" />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Label htmlFor="duration-60">60 דקות</Label>
                      <RadioGroupItem value="60" id="duration-60" />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Label htmlFor="duration-75">75 דקות</Label>
                      <RadioGroupItem value="75" id="duration-75" />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Label htmlFor="duration-90">90 דקות</Label>
                      <RadioGroupItem value="90" id="duration-90" />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Label htmlFor="duration-120">120 דקות</Label>
                      <RadioGroupItem value="120" id="duration-120" />
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="serviceOrProduct">השירות/מוצר לקידום במהלך ההרצאה (לפחות 50 תווים)</Label>
                  <Textarea
                    id="serviceOrProduct"
                    placeholder="מהו השירות או המוצר שברצונך לקדם במהלך ההרצאה?"
                    rows={3}
                    value={formData.serviceOrProduct}
                    onChange={(e) => updateFormField('serviceOrProduct', e.target.value)}
                    className="resize-none rtl-form"
                  />
                  <div className="text-sm text-gray-500 text-right">
                    {formData.serviceOrProduct.length}/50 תווים מינימום
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callToAction">הנעה לפעולה (CTA) בסיום (לפחות 50 תווים)</Label>
                  <Textarea
                    id="callToAction"
                    placeholder="מהי הפעולה שתרצה שהקהל יבצע בסוף ההרצאה?"
                    rows={3}
                    value={formData.callToAction}
                    onChange={(e) => updateFormField('callToAction', e.target.value)}
                    className="resize-none rtl-form"
                  />
                  <div className="text-sm text-gray-500 text-right">
                    {formData.callToAction.length}/50 תווים מינימום
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-whiskey text-whiskey hover:bg-whiskey/10"
                >
                  הקודם
                </Button>
              ) : (
                <div></div>
              )}
              <Button
                onClick={handleNext}
                className="bg-whiskey hover:bg-whiskey-dark text-white"
              >
                {currentStep < totalSteps ? 'הבא' : 'סיום'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePresentation;
