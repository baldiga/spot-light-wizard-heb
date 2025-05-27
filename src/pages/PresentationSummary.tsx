import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import { 
  Loader2, FileText, Users, Target, Mail, DollarSign, MessageSquare, 
  Presentation, Lightbulb, CheckSquare, Zap, HelpCircle, Megaphone 
} from 'lucide-react';
import { generateDynamicSlideStructure, generateDynamicB2BEmail, generateDynamicSalesStrategy, generatePresentationTools } from '@/services/openaiService';

const PresentationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, chapters, outline, presentationTools } = usePresentationStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>([]);
  const [dynamicEmail, setDynamicEmail] = useState<string>('');
  const [dynamicStrategy, setDynamicStrategy] = useState<any>(null);
  const [tools, setTools] = useState<any>(null);

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
      const [slides, email, strategy, presentationTools] = await Promise.all([
        generateDynamicSlideStructure(formData, outline),
        generateDynamicB2BEmail(formData, outline),
        generateDynamicSalesStrategy(formData, outline),
        generatePresentationTools(formData, outline)
      ]);
      
      setDynamicSlides(slides);
      setDynamicEmail(email);
      setDynamicStrategy(strategy);
      setTools(presentationTools);
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
          <TabsList className="grid w-full grid-cols-9 mb-8 text-xs">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">סקירה</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline">מבנה</span>
            </TabsTrigger>
            <TabsTrigger value="slides" className="flex items-center gap-1">
              <Presentation className="w-3 h-3" />
              <span className="hidden sm:inline">שקפים</span>
            </TabsTrigger>
            <TabsTrigger value="sales-process" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">מכירה</span>
            </TabsTrigger>
            <TabsTrigger value="opening-tools" className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              <span className="hidden sm:inline">פתיחות</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">מעורבות</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">דוא"ל</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="hidden sm:inline">שיווק</span>
            </TabsTrigger>
            <TabsTrigger value="toolkit" className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3" />
              <span className="hidden sm:inline">כלים</span>
            </TabsTrigger>
          </TabsList>

          {/* Sales Process Tab */}
          <TabsContent value="sales-process" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מהלך מכירה בהרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {outline?.salesProcess && outline.salesProcess.length > 0 ? (
                  <div className="space-y-6 text-right">
                    {outline.salesProcess
                      .sort((a, b) => a.order - b.order)
                      .map((step, index) => (
                        <div key={step.id} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex items-start justify-end">
                            <div className="text-right flex-1">
                              <h3 className="text-lg font-bold text-gray-800 text-right mb-2">{step.title}</h3>
                              <p className="text-gray-600 text-right">{step.description}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-sm font-bold ml-3 flex-shrink-0">
                              {index + 1}
                            </div>
                          </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-bold text-blue-800 mb-2">פרטי ההרצאה</h3>
                      <p className="text-gray-700"><strong>נושא:</strong> {formData?.idea}</p>
                      <p className="text-gray-700"><strong>משך:</strong> {formData?.duration} דקות</p>
                      <p className="text-gray-700"><strong>קהל יעד:</strong> {formData?.audienceProfile}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-bold text-green-800 mb-2">מטרות ההרצאה</h3>
                      <p className="text-gray-700"><strong>רקע המרצה:</strong> {formData?.speakerBackground}</p>
                      <p className="text-gray-700"><strong>מוצר/שירות:</strong> {formData?.serviceOrProduct}</p>
                      <p className="text-gray-700"><strong>קריאה לפעולה:</strong> {formData?.callToAction}</p>
                    </div>
                  </div>
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
                      <div key={chapter.id} className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-800 text-right mb-3">
                          פרק {index + 1}: {chapter.title}
                        </h3>
                        <ul className="space-y-2">
                          {chapter.points.map((point) => (
                            <li key={point.id} className="flex items-start text-right">
                              <span className="w-2 h-2 bg-whiskey rounded-full mt-2 ml-3 flex-shrink-0"></span>
                              <span className="text-gray-600">{point.content}</span>
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

          {/* Enhanced Slides Tab */}
          <TabsContent value="slides" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מבנה שקפים מפורט</CardTitle>
                <p className="text-gray-600 text-right">סה"כ {dynamicSlides?.length || 0} שקפים</p>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {dynamicSlides && dynamicSlides.length > 0 ? (
                  <div className="space-y-6">
                    {dynamicSlides.map((slide, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-whiskey text-white rounded-full flex items-center justify-center text-sm font-bold ml-3">
                              {slide.number}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{slide.headline}</h3>
                              {slide.section && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{slide.section}</span>}
                            </div>
                          </div>
                          {slide.timeAllocation && (
                            <span className="text-sm text-whiskey font-medium">{slide.timeAllocation}</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">תוכן השקף:</h4>
                            <p className="text-gray-600 text-sm">{slide.content}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">אלמנטים ויזואליים:</h4>
                            <p className="text-gray-600 text-sm">{slide.visual}</p>
                          </div>
                        </div>
                        
                        {slide.notes && (
                          <div className="mt-4 p-3 bg-yellow-50 rounded">
                            <h4 className="font-semibold text-yellow-800 mb-1">הערות למרצה:</h4>
                            <p className="text-yellow-700 text-sm">{slide.notes}</p>
                          </div>
                        )}
                        
                        {slide.engagementTip && (
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <h4 className="font-semibold text-blue-800 mb-1">טיפ למעורבות:</h4>
                            <p className="text-blue-700 text-sm">{slide.engagementTip}</p>
                          </div>
                        )}
                        
                        {slide.transitionPhrase && (
                          <div className="mt-3 p-3 bg-green-50 rounded">
                            <h4 className="font-semibold text-green-800 mb-1">משפט מעבר:</h4>
                            <p className="text-green-700 text-sm">{slide.transitionPhrase}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">מבנה השקפים טרם נוצר</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opening Tools Tab */}
          <TabsContent value="opening-tools" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">הצעות לפתיחת ההרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {tools?.openingSuggestions ? (
                  <div className="space-y-6">
                    {tools.openingSuggestions.map((opening: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{opening.type}</h3>
                        <div className="bg-gray-50 p-4 rounded mb-3">
                          <h4 className="font-semibold mb-2">סקריפט:</h4>
                          <p className="text-gray-700 whitespace-pre-line">{opening.script}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                          <h4 className="font-semibold text-blue-800 mb-1">טיפים לביצוע:</h4>
                          <p className="text-blue-700">{opening.tips}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {outline?.openingStyles?.map((style, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-white">
                        <p className="text-gray-700">{style}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">כלים למעורבות הקהל</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                <div className="space-y-6">
                  {/* Chapter Questions */}
                  {tools?.chapterQuestions && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">שאלות לפי פרקים</h3>
                      {Object.entries(tools.chapterQuestions).map(([chapter, questions]: [string, any]) => (
                        <div key={chapter} className="mb-6 border rounded-lg p-4 bg-white">
                          <h4 className="font-semibold text-gray-800 mb-3">{chapter}</h4>
                          {questions.map((q: any, idx: number) => (
                            <div key={idx} className="mb-4 p-3 bg-gray-50 rounded">
                              <p className="font-medium text-gray-800 mb-2">{q.question}</p>
                              <p className="text-sm text-gray-600 mb-2"><strong>מטרה:</strong> {q.purpose}</p>
                              <p className="text-sm text-gray-600 mb-2"><strong>תשובות צפויות:</strong> {q.expectedAnswers?.join(', ')}</p>
                              <p className="text-sm text-gray-600"><strong>המשך:</strong> {q.followUp}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Activities */}
                  {tools?.interactiveActivities && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">פעילויות אינטראקטיביות</h3>
                      {tools.interactiveActivities.map((activity: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-white mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">{activity.activity}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p><strong>מתי:</strong> {activity.timing}</p>
                            <p><strong>משך:</strong> {activity.duration}</p>
                          </div>
                          <p className="mt-2 text-gray-700"><strong>הוראות:</strong> {activity.instructions}</p>
                          <p className="mt-2 text-gray-600"><strong>חומרים:</strong> {activity.materials}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keep existing Email and Marketing tabs the same */}
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

          {/* New Toolkit Tab */}
          <TabsContent value="toolkit" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">ארגז כלים למרצה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                <div className="space-y-6">
                  {/* Transition Phrases */}
                  {tools?.transitionPhrases && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">משפטי מעבר</h3>
                      {tools.transitionPhrases.map((transition: any, index: number) => (
                        <div key={index} className="p-3 border rounded bg-white mb-2">
                          <p className="font-medium">{transition.from} ← {transition.to}</p>
                          <p className="text-gray-600 italic">"{transition.phrase}"</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Engagement Techniques */}
                  {tools?.engagementTechniques && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">טכניקות מעורבות</h3>
                      {tools.engagementTechniques.map((technique: any, index: number) => (
                        <div key={index} className="border rounded p-4 bg-white mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2">{technique.technique}</h4>
                          <p className="text-sm text-gray-600 mb-2"><strong>מתי:</strong> {technique.when}</p>
                          <p className="text-sm text-gray-600 mb-2"><strong>איך:</strong> {technique.howTo}</p>
                          <p className="text-sm text-gray-600"><strong>יעילות:</strong> {technique.benefits}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Troubleshooting */}
                  {tools?.troubleshooting && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">פתרון בעיות</h3>
                      {tools.troubleshooting.map((issue: any, index: number) => (
                        <div key={index} className="border rounded p-4 bg-red-50 mb-4">
                          <h4 className="font-semibold text-red-800 mb-2">{issue.problem}</h4>
                          <p className="text-sm text-red-700 mb-2"><strong>פתרון:</strong> {issue.solution}</p>
                          <p className="text-sm text-red-600"><strong>מניעה:</strong> {issue.prevention}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Only restart button */}
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
