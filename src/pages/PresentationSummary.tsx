import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Loader2, FileText, Users, Target, Mail, DollarSign, MessageSquare } from 'lucide-react';
import { generateDynamicSlideStructure, generateDynamicB2BEmail, generateDynamicSalesStrategy } from '@/services/openaiService';

const PresentationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, chapters, outline } = usePresentationStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>([]);
  const [dynamicEmail, setDynamicEmail] = useState<string>('');
  const [dynamicStrategy, setDynamicStrategy] = useState<any>(null);

  useEffect(() => {
    if (!formData || !outline) {
      toast({
        title: "מידע חסר",
        description: "אנא השלם את תהליך יצירת ההרצאה תחילה",
        variant: "destructive",
      });
      navigate('/create');
      return;
    }

    generateDynamicContent();
  }, [formData, outline, navigate, toast]);

  const generateDynamicContent = async () => {
    if (!formData || !outline) return;
    
    setIsGenerating(true);
    try {
      const [slides, email, strategy] = await Promise.all([
        generateDynamicSlideStructure(formData, outline),
        generateDynamicB2BEmail(formData, outline),
        generateDynamicSalesStrategy(formData, outline)
      ]);
      
      setDynamicSlides(slides);
      setDynamicEmail(email);
      setDynamicStrategy(strategy);
    } catch (error) {
      console.error('Error generating dynamic content:', error);
      toast({
        title: "שגיאה ביצירת תוכן",
        description: "אירעה שגיאה ביצירת התוכן הדינמי",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    navigate('/');
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <SpotlightLogo className="w-16 h-16 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          יוצר תוכן מותאם אישית...
        </h2>
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-whiskey" />
          <span className="text-whiskey font-medium">אנא המתן...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <SpotlightLogo className="w-12 h-12 mr-3" />
          <h1 className="text-3xl font-bold text-gray-dark text-center">סיכום מלא של ההרצאה</h1>
        </div>

        <Tabs defaultValue="overview" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">סקירה כללית</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">מבנה ההרצאה</span>
            </TabsTrigger>
            <TabsTrigger value="slides" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">מבנה שקפים</span>
            </TabsTrigger>
            <TabsTrigger value="sales-process" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">מהלך מכירה</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">דוא"ל B2B</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">אסטרטגיית שיווק</span>
            </TabsTrigger>
          </TabsList>

          {/* Sales Process Tab */}
          <TabsContent value="sales-process" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מהלך המכירה בהרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {outline?.salesProcess && outline.salesProcess.length > 0 ? (
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
                ) : (
                  <p className="text-gray-500 text-center text-right">לא נוצר מהלך מכירה עבור הרצאה זו</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">סקירה כללית של ההרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                <div className="space-y-4 text-right">
                  <p className="text-gray-700 text-right">
                    <strong>נושא ההרצאה:</strong> {formData?.idea}
                  </p>
                  <p className="text-gray-700 text-right">
                    <strong>משך ההרצאה:</strong> {formData?.duration} דקות
                  </p>
                  <p className="text-gray-700 text-right">
                    <strong>קהל יעד:</strong> {formData?.audienceProfile}
                  </p>
                  <p className="text-gray-700 text-right">
                    <strong>מטרת ההרצאה:</strong> {formData?.callToAction}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מבנה ההרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {chapters.length > 0 ? (
                  <div className="space-y-6 text-right">
                    {chapters.map((chapter, index) => (
                      <div key={chapter.id} className="text-right">
                        <h3 className="text-xl font-bold text-gray-800 text-right">
                          פרק {index + 1}: {chapter.title}
                        </h3>
                        <ul className="list-disc pl-5 text-gray-600">
                          {chapter.points.map((point) => (
                            <li key={point.id} className="mr-5">
                              {point.content}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">לא נוצר מבנה הרצאה</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slides Tab */}
          <TabsContent value="slides" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מבנה שקפים מפורט</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {dynamicSlides && dynamicSlides.length > 0 ? (
                  <div className="space-y-4">
                    {dynamicSlides.map((slide, index) => (
                      <div key={index} className="text-right">
                        <h3 className="text-lg font-semibold text-gray-800">שקף {slide.number}: {slide.headline}</h3>
                        <p className="text-gray-600">תוכן: {slide.content}</p>
                        <p className="text-gray-600">ויזואליה: {slide.visual}</p>
                        <p className="text-gray-600">הערות: {slide.notes}</p>
                        <p className="text-gray-600">זמן: {slide.timeAllocation}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">מבנה השקפים טרם נוצר</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">דוא"ל B2B מותאם אישית</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {dynamicEmail ? (
                  <div className="text-right">
                    <p className="text-gray-700 whitespace-pre-line">{dynamicEmail}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">הדוא"ל טרם נוצר</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">אסטרטגיית שיווק ומכירות</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {dynamicStrategy ? (
                  <div className="space-y-4 text-right">
                    <h3 className="text-xl font-semibold text-gray-800">קהלי יעד</h3>
                    <ul className="list-disc pl-5 text-gray-600">
                      {dynamicStrategy.targetAudiences && dynamicStrategy.targetAudiences.map((audience: string, index: number) => (
                        <li key={index} className="mr-5">{audience}</li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800">ערוצי שיווק</h3>
                    {dynamicStrategy.marketingChannels && dynamicStrategy.marketingChannels.map((channel: any, index: number) => (
                      <div key={index} className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-700">{channel.channel}</h4>
                        <p className="text-gray-600">אסטרטגיה: {channel.strategy}</p>
                        <p className="text-gray-600">ציר זמן: {channel.timeline}</p>
                        <p className="text-gray-600">תקציב: {channel.budget}</p>
                      </div>
                    ))}

                    <h3 className="text-xl font-semibold text-gray-800">אסטרטגיית תמחור</h3>
                    <p className="text-gray-600">כרטיס בסיסי: {dynamicStrategy.pricingStrategy?.basicTicket}</p>
                    <p className="text-gray-600">כרטיס VIP: {dynamicStrategy.pricingStrategy?.vipTicket}</p>
                    <p className="text-gray-600">כרטיס פרימיום: {dynamicStrategy.pricingStrategy?.premiumTicket}</p>
                    <p className="text-gray-600">חבילה ארגונית: {dynamicStrategy.pricingStrategy?.corporatePackage}</p>

                    <h3 className="text-xl font-semibold text-gray-800">הזדמנויות לשיתוף פעולה</h3>
                    <ul className="list-disc pl-5 text-gray-600">
                      {dynamicStrategy.collaborationOpportunities && dynamicStrategy.collaborationOpportunities.map((opportunity: string, index: number) => (
                        <li key={index} className="mr-5">{opportunity}</li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800">שיווק תוכן</h3>
                    <ul className="list-disc pl-5 text-gray-600">
                      {dynamicStrategy.contentMarketing && dynamicStrategy.contentMarketing.map((content: string, index: number) => (
                        <li key={index} className="mr-5">{content}</li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800">אסטרטגיית מעקב</h3>
                    <p className="text-gray-600">{dynamicStrategy.followUpStrategy}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">אסטרטגיית השיווק טרם נוצרה</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Only restart button - export buttons removed */}
        <div className="flex justify-center mt-12">
          <Button 
            onClick={handleRestart}
            className="bg-whiskey hover:bg-whiskey-dark text-white px-8 py-3 text-lg"
          >
            סיום והתחלה מחדש
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PresentationSummary;
