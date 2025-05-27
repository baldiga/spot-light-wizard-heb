
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PresentationFormData } from '@/types/presentation';
import { useToast } from '@/hooks/use-toast';
import { createEmptyPresentationFormData, validateCharacterCount } from '@/utils/helpers';
import { usePresentationStore } from '@/store/presentationStore';
import SpotlightLogo from '@/components/SpotlightLogo';
import CharacterCountTextarea from '@/components/CharacterCountTextarea';

const CreatePresentation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      const ideaValidation = validateCharacterCount(formData.idea);
      const backgroundValidation = validateCharacterCount(formData.speakerBackground);
      
      if (!ideaValidation.isValid) {
        toast({
          title: "שדה לא תקין",
          description: `הרעיון הכללי חייב להכיל בין ${ideaValidation.min} ל-${ideaValidation.max} תווים`,
          variant: "destructive"
        });
        return false;
      }
      if (!backgroundValidation.isValid) {
        toast({
          title: "שדה לא תקין", 
          description: `הרקע המקצועי חייב להכיל בין ${backgroundValidation.min} ל-${backgroundValidation.max} תווים`,
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 2) {
      const audienceValidation = validateCharacterCount(formData.audienceProfile);
      const objectionsValidation = validateCharacterCount(formData.commonObjections);
      
      if (!audienceValidation.isValid) {
        toast({
          title: "שדה לא תקין",
          description: `פרופיל הקהל חייב להכיל בין ${audienceValidation.min} ל-${audienceValidation.max} תווים`,
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
      if (!objectionsValidation.isValid) {
        toast({
          title: "שדה לא תקין",
          description: `ההתנגדויות והאמונות המגבילות חייבות להכיל בין ${objectionsValidation.min} ל-${objectionsValidation.max} תווים`,
          variant: "destructive"
        });
        return false;
      }
    } else if (currentStep === 3) {
      const serviceValidation = validateCharacterCount(formData.serviceOrProduct);
      const ctaValidation = validateCharacterCount(formData.callToAction);
      
      if (!serviceValidation.isValid) {
        toast({
          title: "שדה לא תקין",
          description: `השירות או המוצר חייב להכיל בין ${serviceValidation.min} ל-${serviceValidation.max} תווים`,
          variant: "destructive"
        });
        return false;
      }
      if (!ctaValidation.isValid) {
        toast({
          title: "שדה לא תקין",
          description: `הקריאה לפעולה חייבת להכיל בין ${ctaValidation.min} ל-${ctaValidation.max} תווים`,
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
    setFormData(formData);
    navigate('/user-registration');
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
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
                  currentStep > index ? 'bg-whiskey text-white' : 
                  currentStep === index + 1 ? 'bg-whiskey-light text-white' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > index + 1 ? 'bg-whiskey' : 'bg-gray-200'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
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
                <CharacterCountTextarea
                  id="idea"
                  label="רעיון כללי של ההרצאה"
                  placeholder="מהו הנושא העיקרי של ההרצאה שלך? מה המסר המרכזי?"
                  value={formData.idea}
                  onChange={(value) => updateFormField('idea', value)}
                />
                <CharacterCountTextarea
                  id="speakerBackground"
                  label="רקע המרצה – ניסיון מקצועי וסגנון"
                  placeholder="מה הניסיון שלך בתחום? מהו סגנון ההרצאה המועדף עליך?"
                  value={formData.speakerBackground}
                  onChange={(value) => updateFormField('speakerBackground', value)}
                />
              </>
            )}

            {currentStep === 2 && (
              <>
                <CharacterCountTextarea
                  id="audienceProfile"
                  label="פרופיל הקהל – גיל, תפקיד, רקע, רמת ידע"
                  placeholder="מיהו קהל היעד שלך? מה הגיל, התפקיד, הרקע ורמת הידע שלהם?"
                  value={formData.audienceProfile}
                  onChange={(value) => updateFormField('audienceProfile', value)}
                />
                <CharacterCountTextarea
                  id="commonObjections"
                  label="התנגדויות נפוצות, מעכבי החלטות ואמונות מגבילות של הקהל"
                  placeholder="הרצאה טובה היא כמו שיחת מכירה, ספר על מה שעלול לגרום לקהל שלך *לא* לרכוש ממך בסיום ההרצאה"
                  value={formData.commonObjections}
                  onChange={(value) => updateFormField('commonObjections', value)}
                />
                <div className="space-y-2">
                  <Label>משך הרצאה</Label>
                  <RadioGroup
                    value={formData.duration}
                    onValueChange={(value) => updateFormField('duration', value as "30" | "45" | "60" | "75" | "90" | "120")}
                    className="grid grid-cols-2 gap-4"
                    dir="rtl"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="30" id="duration-30" />
                      <Label htmlFor="duration-30">30 דקות</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="45" id="duration-45" />
                      <Label htmlFor="duration-45">45 דקות</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="60" id="duration-60" />
                      <Label htmlFor="duration-60">60 דקות</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="75" id="duration-75" />
                      <Label htmlFor="duration-75">75 דקות</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="90" id="duration-90" />
                      <Label htmlFor="duration-90">90 דקות</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="120" id="duration-120" />
                      <Label htmlFor="duration-120">120 דקות</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <CharacterCountTextarea
                  id="serviceOrProduct"
                  label="השירות/מוצר לקידום במהלך ההרצאה"
                  placeholder="מהו השירות או המוצר שברצונך לקדם במהלך ההרצאה?"
                  rows={3}
                  value={formData.serviceOrProduct}
                  onChange={(value) => updateFormField('serviceOrProduct', value)}
                />
                <CharacterCountTextarea
                  id="callToAction"
                  label="הנעה לפעולה (CTA) בסיום"
                  placeholder="מהי הפעולה שתרצה שהקהל יבצע בסוף ההרצאה?"
                  rows={3}
                  value={formData.callToAction}
                  onChange={(value) => updateFormField('callToAction', value)}
                />
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
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  className="border-gray-300 text-gray-500 hover:bg-gray-100"
                >
                  ביטול
                </Button>
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
