
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import { 
  Loader2, FileText, Users, Target, Mail, DollarSign, MessageSquare, 
  Presentation, Lightbulb, CheckSquare, Zap, HelpCircle, Megaphone 
} from 'lucide-react';
import { 
  generateSlideStructure, 
  generateB2BEmail, 
  generateSalesStrategy, 
  generatePresentationTools,
  generateEngagementContent
} from '@/services/presentationService';

interface LoadingStage {
  name: string;
  message: string;
  progress: number;
}

const loadingStages: LoadingStage[] = [
  { name: 'outline', message: 'יצירת מבנה ההרצאה הושלמה...', progress: 15 },
  { name: 'slides', message: 'יוצר מבנה שקפים מפורט...', progress: 30 },
  { name: 'engagement', message: 'יוצר תוכן מעורבות אינטראקטיבי...', progress: 45 },
  { name: 'email', message: 'כותב דוא"ל שיווק B2B...', progress: 60 },
  { name: 'strategy', message: 'מפתח אסטרטגיית שיווק ומכירות...', progress: 80 },
  { name: 'tools', message: 'יוצר ארגז כלים למרצה...', progress: 100 }
];

const PresentationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, chapters, outline } = usePresentationStore();
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>([]);
  const [dynamicEmail, setDynamicEmail] = useState<string>('');
  const [dynamicStrategy, setDynamicStrategy] = useState<any>(null);
  const [tools, setTools] = useState<any>(null);
  const [engagementData, setEngagementData] = useState<any>(null);

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

    generateAllContent();
  }, [formData, outline, navigate, toast]);

  const generateAllContent = async () => {
    if (!formData || !outline) return;
    
    try {
      // Stage 1: Outline already completed
      setCurrentStage(0);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Stage 2: Generate slides
      setCurrentStage(1);
      const slides = await generateSlideStructure(formData, outline);
      setDynamicSlides(slides);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 3: Generate engagement content
      setCurrentStage(2);
      const engagement = await generateEngagementContent(formData, outline);
      setEngagementData(engagement);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 4: Generate email
      setCurrentStage(3);
      const email = await generateB2BEmail(formData, outline);
      setDynamicEmail(email);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 5: Generate strategy
      setCurrentStage(4);
      const strategy = await generateSalesStrategy(formData, outline);
      setDynamicStrategy(strategy);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 6: Generate tools
      setCurrentStage(5);
      const presentationTools = await generatePresentationTools(formData, outline);
      setTools(presentationTools);
      
      // Complete loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "שגיאה ביצירת תוכן",
        description: "אירעה שגיאה ביצירת התוכן הדינמי",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    navigate('/');
  };

  if (isGenerating) {
    const stage = loadingStages[currentStage];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <SpotlightLogo className="w-16 h-16 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          יוצר תוכן מותאם אישית...
        </h2>
        <div className="w-80 mb-6">
          <Progress value={stage.progress} className="h-3" />
          <p className="text-center mt-2 text-gray-600">{stage.progress}% הושלם</p>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-whiskey" />
          <span className="text-whiskey font-medium">{stage.message}</span>
        </div>
        <div className="text-center text-gray-500 text-sm">
          <p>יוצר תוכן מותאם אישית עבור: {formData?.idea}</p>
          <p className="mt-1">אנא המתן, התהליך יכול לקחת מספר דקות...</p>
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
                <CardTitle className="text-2xl text-gray-dark text-right">מבנה ההרצאה (4 פרקים)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {chapters.length > 0 ? (
                  <div className="space-y-6 text-right">
                    {chapters.slice(0, 4).map((chapter, index) => (
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

          {/* Slides Tab */}
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

          {/* Sales Process Tab */}
          <TabsContent value="sales-process" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מהלך מכירה בהרצאה (10 שלבים)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {outline?.salesProcess && outline.salesProcess.length > 0 ? (
                  <div className="space-y-6 text-right">
                    {outline.salesProcess
                      .sort((a, b) => a.order - b.order)
                      .slice(0, 10)
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

          {/* Opening Tools Tab */}
          <TabsContent value="opening-tools" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">רעיונות לפתיחת ההרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {outline?.openingStyles && outline.openingStyles.length > 0 ? (
                  <div className="space-y-4 text-right">
                    {outline.openingStyles.map((style, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-end">
                          <div className="text-right flex-1">
                            <p className="text-gray-700">{style}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-sm font-bold ml-3 flex-shrink-0">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">לא נוצרו רעיונות לפתיחה</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">כלי מעורבות אינטראקטיביים</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {engagementData ? (
                  <div className="space-y-6 text-right">
                    {engagementData.interactiveActivities && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">פעילויות אינטראקטיביות</h3>
                        <div className="space-y-3">
                          {engagementData.interactiveActivities.map((activity, index) => (
                            <div key={index} className="p-4 bg-blue-50 rounded-lg">
                              <p className="text-gray-700">{activity}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {engagementData.discussionQuestions && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">שאלות לדיון</h3>
                        {Object.entries(engagementData.discussionQuestions).map(([chapter, questions]) => (
                          <div key={chapter} className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">{chapter}</h4>
                            <div className="space-y-2">
                              {questions.map((question, index) => (
                                <div key={index} className="p-3 bg-green-50 rounded">
                                  <p className="text-gray-700">{question}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {engagementData.engagementMetrics && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">כלים נוספים למעורבות</h3>
                        {engagementData.engagementMetrics.pollQuestions && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">שאלות סקר</h4>
                            <div className="space-y-2">
                              {engagementData.engagementMetrics.pollQuestions.map((poll, index) => (
                                <div key={index} className="p-3 bg-yellow-50 rounded">
                                  <p className="text-gray-700">{poll}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">תוכן מעורבות טרם נוצר</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">דוא"ל שיווק B2B</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {dynamicEmail ? (
                  <div className="bg-white border rounded-lg p-6 text-right">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {dynamicEmail}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">דוא"ל השיווק טרם נוצר</p>
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
                  <div className="space-y-6 text-right">
                    {dynamicStrategy.targetAudiences && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">קהלי יעד</h3>
                        <div className="space-y-3">
                          {dynamicStrategy.targetAudiences.map((audience, index) => (
                            <div key={index} className="p-4 bg-blue-50 rounded-lg">
                              <p className="text-gray-700">{audience}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dynamicStrategy.marketingChannels && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">ערוצי שיווק</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dynamicStrategy.marketingChannels.map((channel, index) => (
                            <div key={index} className="p-4 bg-green-50 rounded-lg">
                              <h4 className="font-semibold text-green-800 mb-2">{channel.channel}</h4>
                              <p className="text-gray-700 text-sm mb-2">{channel.strategy}</p>
                              <p className="text-gray-600 text-xs"><strong>לוח זמנים:</strong> {channel.timeline}</p>
                              <p className="text-gray-600 text-xs"><strong>תקציב:</strong> {channel.budget}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {dynamicStrategy.pricingStrategy && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">אסטרטגיית תמחור</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(dynamicStrategy.pricingStrategy).map(([key, value]) => (
                            <div key={key} className="p-4 bg-yellow-50 rounded-lg">
                              <p className="text-gray-700">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">אסטרטגיית השיווק טרם נוצרה</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Toolkit Tab */}
          <TabsContent value="toolkit" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">ארגז כלים למרצה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {tools ? (
                  <div className="space-y-6 text-right">
                    {tools.openingSuggestions && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">הצעות לפתיחה</h3>
                        <div className="space-y-4">
                          {tools.openingSuggestions.map((suggestion, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                              <h4 className="font-semibold text-gray-800 mb-2">{suggestion.type}</h4>
                              <p className="text-gray-700 mb-3">{suggestion.script}</p>
                              <div className="p-3 bg-blue-50 rounded">
                                <p className="text-blue-800 text-sm"><strong>טיפים:</strong> {suggestion.tips}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {tools.interactiveActivities && (
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">פעילויות אינטראקטיביות</h3>
                        <div className="space-y-4">
                          {tools.interactiveActivities.map((activity, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                              <h4 className="font-semibold text-gray-800 mb-2">{activity.activity}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <p><strong>זמן:</strong> {activity.timing}</p>
                                <p><strong>משך:</strong> {activity.duration}</p>
                                <p><strong>חומרים:</strong> {activity.materials}</p>
                              </div>
                              <p className="text-gray-700 mt-3">{activity.instructions}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {tools.troubleshooting && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">פתרון בעיות</h3>
                        <div className="space-y-4">
                          {tools.troubleshooting.map((tip, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                              <h4 className="font-semibold text-red-800 mb-2">בעיה: {tip.problem}</h4>
                              <p className="text-gray-700 mb-2"><strong>פתרון:</strong> {tip.solution}</p>
                              <p className="text-green-700"><strong>מניעה:</strong> {tip.prevention}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center text-right">ארגז הכלים טרם נוצר</p>
                )}
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
