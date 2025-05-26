
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import ChapterEditor from '@/components/ChapterEditor';

const OutlineConfirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, chapters } = usePresentationStore();

  useEffect(() => {
    if (!formData) {
      toast({
        title: "מידע חסר",
        description: "אנא מלא את טופס פרטי ההרצאה תחילה",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    if (chapters.length === 0) {
      toast({
        title: "מבנה ההרצאה לא נוצר",
        description: "חוזרים לעמוד הקודם",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [formData, chapters, navigate, toast]);

  const handleConfirm = () => {
    navigate('/presentation-summary');
  };

  const salesSteps = [
    {
      title: "הצגת הערך הייחודי (USP)",
      description: "הדגש את מה שמבדיל אותך ואת הפתרון שלך מהמתחרים. הסבר למה אתה הכתובת הנכונה לפתור את הבעיה שהקהל מתמודד איתה."
    },
    {
      title: "הסבר מדוע זו ההצעה המושלמת",
      description: "צור קשר בין הבעיה שהקהל חווה לבין הפתרון שאתה מציע. הראה איך המוצר או השירות שלך עונה בדיוק על הצרכים שלהם."
    },
    {
      title: "פירוט תוכן ההצעה",
      description: "הצג בצורה ברורה ומפורטת מה הלקוח יקבל. כלול את כל הרכיבים, השירותים, הבונוסים והערך המוסף שהוא יזכה בהם."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <SpotlightLogo className="w-12 h-12 ml-3" />
          <h1 className="text-3xl font-bold text-gray-dark">אישור מבנה ההרצאה</h1>
        </div>

        <div className="mb-6 bg-white p-6 rounded-lg shadow border border-gray-200 text-right">
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
            <ChapterEditor key={chapter.id} chapter={chapter} chapterNumber={index + 1} />
          ))}
        </div>

        <Card className="mb-8 border-whiskey/20">
          <CardHeader className="bg-whiskey/5">
            <CardTitle className="text-xl text-gray-dark text-right">מהלך מכירה</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-right">
              <p className="text-gray-600 mb-6">שלושת השלבים החיוניים לשלב ההצעה בהרצאה:</p>
              <div className="space-y-4">
                {salesSteps.map((step, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-right">
                    <div className="flex items-center mb-2 justify-start">
                      <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center ml-3 text-lg font-bold">
                        {idx + 1}
                      </div>
                      <h3 className="font-semibold text-gray-800">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 pr-11">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')} 
            className="border-whiskey text-whiskey hover:bg-whiskey/10"
          >
            חזרה לעריכה
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="bg-whiskey hover:bg-whiskey-dark text-white"
          >
            המשך לסיכום המלא
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OutlineConfirmation;
