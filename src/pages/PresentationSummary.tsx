
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';

const PresentationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, outline, chapters } = usePresentationStore();

  useEffect(() => {
    if (!formData || !outline) {
      toast({
        title: "מידע חסר",
        description: "אנא השלם את כל השלבים הקודמים",
        variant: "destructive",
      });
      navigate('/create');
    }
  }, [formData, outline, navigate, toast]);

  if (!formData || !outline) {
    return null;
  }

  const handleExport = (format: string) => {
    toast({
      title: "ייצוא בתהליך",
      description: `מייצא את המסמך בפורמט ${format}...`,
    });
    
    // Simulating export process
    setTimeout(() => {
      toast({
        title: "ייצוא הושלם",
        description: `המסמך יוצא בהצלחה בפורמט ${format}`,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <SpotlightLogo className="w-12 h-12 mr-3" />
            <h1 className="text-3xl font-bold text-gray-dark">סיכום ההרצאה</h1>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <Button 
              variant="outline" 
              onClick={() => handleExport('PDF')}
              className="border-whiskey text-whiskey hover:bg-whiskey/10"
            >
              ייצוא ל-PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('Word')}
              className="border-whiskey text-whiskey hover:bg-whiskey/10"
            >
              ייצוא ל-Word
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('Markdown')}
              className="border-whiskey text-whiskey hover:bg-whiskey/10"
            >
              ייצוא ל-Markdown
            </Button>
          </div>
        </div>

        <Card className="mb-8 border-whiskey/20">
          <CardHeader className="bg-whiskey/5">
            <CardTitle className="text-xl text-gray-dark">פרטי ההרצאה</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">הרעיון הכללי</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">{formData.idea}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">רקע המרצה</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">{formData.speakerBackground}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">פרופיל הקהל</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">{formData.audienceProfile}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">משך ההרצאה</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">{formData.duration} דקות</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">שירות/מוצר לקידום</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">{formData.serviceOrProduct}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">קריאה לפעולה</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">{formData.callToAction}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="outline" className="mb-8">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="outline">מבנה ההרצאה</TabsTrigger>
            <TabsTrigger value="opening">פתיחות וחלוקת זמנים</TabsTrigger>
            <TabsTrigger value="interactive">פעילויות ושאלות</TabsTrigger>
            <TabsTrigger value="sales">מדריך שיווקי</TabsTrigger>
          </TabsList>

          <TabsContent value="outline" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">מבנה ראשי הפרקים</h2>
            <div className="space-y-8">
              {chapters.map((chapter, idx) => (
                <div key={chapter.id}>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-whiskey text-white flex items-center justify-center mr-3 text-lg font-bold">
                      {idx + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{chapter.title}</h3>
                  </div>
                  <ul className="space-y-3 pr-14">
                    {chapter.points.map((point) => (
                      <li key={point.id} className="flex items-start">
                        <span className="text-whiskey ml-2">•</span>
                        <span className="text-gray-600">{point.content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opening" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">סגנונות פתיחה מוצלחים</h2>
              <ul className="space-y-4">
                {outline.openingStyles.map((style, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center mr-3 text-lg font-bold mt-1">
                      {idx + 1}
                    </div>
                    <p className="text-gray-600 pt-1">{style}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">חלוקת זמן מומלצת</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-600">{outline.timeDistribution}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">פעילויות אינטראקטיביות</h2>
              <ul className="space-y-4">
                {outline.interactiveActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center mr-3 text-lg font-bold mt-1">
                      {idx + 1}
                    </div>
                    <p className="text-gray-600 pt-1">{activity}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">שאלות לדיון</h2>
              {Object.entries(outline.discussionQuestions).map(([section, questions], idx) => (
                <div key={idx} className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{section}</h3>
                  <ul className="space-y-2 pr-4">
                    {questions.map((question, qIdx) => (
                      <li key={qIdx} className="flex items-start">
                        <span className="text-whiskey ml-2">•</span>
                        <span className="text-gray-600">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sales" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">מדריך "איך למכור"</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                <p className="text-gray-600 leading-relaxed">{outline.salesGuide}</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">תכנית פעולה לאחר ההרצאה</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-600 leading-relaxed">{outline.postPresentationPlan}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => navigate('/outline-confirmation')}
            className="border-whiskey text-whiskey hover:bg-whiskey/10"
          >
            חזרה לעריכת מבנה
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="bg-whiskey hover:bg-whiskey-dark text-white"
          >
            סיום והתחלה מחדש
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PresentationSummary;
