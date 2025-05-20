
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import ChapterEditor from '@/components/ChapterEditor';

const OutlineConfirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, chapters, generateDummyOutline } = usePresentationStore();
  const [isLoading, setIsLoading] = useState(true);

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

    // Simulate API call to generate the outline
    const timeout = setTimeout(() => {
      generateDummyOutline();
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [formData, navigate, toast, generateDummyOutline]);

  const handleConfirm = () => {
    navigate('/presentation-summary');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <SpotlightLogo className="w-16 h-16 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">יוצרים את מבנה ההרצאה...</h2>
        <div className="w-12 h-12 border-4 border-whiskey border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <SpotlightLogo className="w-12 h-12 mr-3" />
          <h1 className="text-3xl font-bold text-gray-dark">אישור מבנה ההרצאה</h1>
        </div>

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
