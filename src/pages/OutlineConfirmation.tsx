
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import ChapterEditor from '@/components/ChapterEditor';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Star } from 'lucide-react';

const OutlineConfirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    formData, 
    chapters, 
    outline,
    isLoading, 
    loadingMessage, 
    error, 
    generateOutlineFromAPI, 
    generateDummyOutline 
  } = usePresentationStore();
  const [apiAttempted, setApiAttempted] = useState(false);

  useEffect(() => {
    if (!formData) {
      toast({
        title: "מידע חסר",
        description: "אנא מלא את טופס פרטי ההרצאה תחילה",
        variant: "destructive",
      });
      navigate('/create');
      return;
    }

    const generateOutline = async () => {
      setApiAttempted(true);
      await generateOutlineFromAPI();
    };

    if (!apiAttempted) {
      generateOutline();
    }
  }, [formData, navigate, toast, generateOutlineFromAPI, apiAttempted]);

  const handleConfirm = () => {
    navigate('/presentation-summary');
  };

  const handleRetry = async () => {
    await generateOutlineFromAPI();
  };

  const handleFallbackToDummy = () => {
    generateDummyOutline();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <SpotlightLogo className="w-16 h-16 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center max-w-2xl">
          {loadingMessage}
        </h2>
        <p className="text-gray-600 mb-6 text-center max-w-lg">
          המערכת שלנו משתמשת בבינה מלאכותית מתקדמת כדי ליצור תוכן מותאם במיוחד עבורך
        </p>
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-whiskey" />
          <span className="text-whiskey font-medium">אנא המתן...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <SpotlightLogo className="w-12 h-12 mr-3" />
          <h1 className="text-3xl font-bold text-gray-dark">זו הולכת להיות הרצאה מדהימה</h1>
        </div>

        {/* Motivational Message */}
        <Card className="mb-6 border-whiskey/20 bg-gradient-to-r from-whiskey/5 to-whiskey/10" dir="rtl">
          <CardContent className="pt-6" dir="rtl">
            <div className="flex items-start gap-3 text-right">
              <Star className="w-6 h-6 text-whiskey flex-shrink-0 mt-1" />
              <div className="text-right">
                <p className="text-gray-700 text-right leading-relaxed">
                  {outline?.motivationalMessage || 
                   'יצרת מבנה הרצאה מקצועי ומותאם אישית! ההרצאה שלך בנויה על עקרונות מוכחים של הצגה יעילה ומכירה טבעית. עכשיו הגיע הזמן לסקור את התוכן ולוודא שהוא משקף בדיוק את החזון שלך. זכור - הרצאה מצוינת מתחילה במבנה מוצק, ואתה כבר עשית את הצעד החשוב ביותר!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>שגיאה ביצירת מבנה ההרצאה</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <div className="mt-4 flex gap-4">
              <Button variant="outline" onClick={handleRetry}>
                נסה שנית
              </Button>
              <Button variant="default" onClick={handleFallbackToDummy}>
                השתמש במבנה לדוגמה
              </Button>
            </div>
          </Alert>
        )}

        <div className="mb-6 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">אנחנו יצרנו עבורך מבנה הרצאה. אנא בדוק ועדכן במידת הצורך:</h2>
          <p className="text-gray-600 mb-2">
            <strong>נושא ההרצאה:</strong> {formData?.idea.substring(0, 100)}...
          </p>
          <p className="text-gray-600">
            <strong>משך ההרצאה:</strong> {formData?.duration} דקות
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {chapters.map((chapter, index) => (
            <ChapterEditor
              key={chapter.id}
              chapter={chapter}
              chapterNumber={index + 1}
            />
          ))}
        </div>

        {/* Sales Process Section */}
        {outline?.salesProcess && outline.salesProcess.length > 0 && (
          <Card className="mb-8 border-whiskey/20" dir="rtl">
            <CardHeader className="bg-whiskey/5 text-right">
              <CardTitle className="text-xl text-gray-dark text-right">מהלך המכירה בהרצאה</CardTitle>
            </CardHeader>
            <CardContent className="pt-6" dir="rtl">
              <div className="space-y-6 text-right">
                {outline.salesProcess
                  .sort((a, b) => a.order - b.order)
                  .map((step, index) => (
                    <div key={step.id} className="text-right">
                      <div className="flex items-center mb-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-sm font-bold ml-3">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 text-right">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 pr-11 text-right">{step.description}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => navigate('/create')}
            className="border-whiskey text-whiskey hover:bg-whiskey/10"
          >
            חזרה לעריכה
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-whiskey hover:bg-whiskey-dark text-white"
          >
            אישור והמשך לסיכום מלא
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutlineConfirmation;
