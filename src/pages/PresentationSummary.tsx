import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import ExportDialog from '@/components/ExportDialog';
import { Loader2, FileText, Users, Target, DollarSign, Presentation, Lightbulb, Home, Mail } from 'lucide-react';
import { generateSlideStructure, generateSalesStrategy, generateEngagementContent, generateSocialMediaContent, generateEmailContent, generateMarketingPlanContent } from '@/services/presentationService';

interface LoadingStage {
  name: string;
  message: string;
  progress: number;
}

const loadingStages: LoadingStage[] = [
  {
    name: 'outline',
    message: 'יצירת מבנה ההרצאה הושלמה...',
    progress: 15
  },
  {
    name: 'slides',
    message: 'יוצר מבנה שקפים מפורט...',
    progress: 30
  },
  {
    name: 'engagement',
    message: 'יוצר תוכן מעורבות אינטראקטיבי...',
    progress: 45
  },
  {
    name: 'strategy',
    message: 'מפתח אסטרטגיית שיווק ומכירות...',
    progress: 60
  },
  {
    name: 'social-media',
    message: 'יוצר תוכן לרשתות חברתיות...',
    progress: 75
  },
  {
    name: 'email-content',
    message: 'יוצר אימייל שיווקי...',
    progress: 85
  },
  {
    name: 'marketing-plan',
    message: 'יוצר אסטרטגיית שיווק מותאמת... 95% הושלם',
    progress: 100
  }
];

const PresentationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, chapters, outline } = usePresentationStore();
  const [isGenerating, setIsGenerating] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>([]);
  const [dynamicStrategy, setDynamicStrategy] = useState<any>(null);
  const [engagementData, setEngagementData] = useState<any>(null);
  const [socialMediaContent, setSocialMediaContent] = useState<any>(null);
  const [emailContent, setEmailContent] = useState<any>(null);
  const [marketingPlanContent, setMarketingPlanContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("main");
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    if (!formData || !outline) {
      toast({
        title: "מידע חסר",
        description: "אנא השלם את תהליך יצירת ההרצאה תחילה",
        variant: "destructive"
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
      console.log('🎯 Starting slides generation...');
      const slidesResponse: any = await generateSlideStructure(formData, outline);
      console.log('🎯 Slides response:', slidesResponse);

      // Handle slides data with proper typing
      let slidesToSet: any[] = [];
      if (Array.isArray(slidesResponse)) {
        slidesToSet = slidesResponse;
        console.log('✅ Set slides (direct array):', slidesToSet.length, 'slides');
      } else if (slidesResponse && typeof slidesResponse === 'object' && slidesResponse.slides && Array.isArray(slidesResponse.slides)) {
        slidesToSet = slidesResponse.slides;
        console.log('✅ Set slides (from object):', slidesToSet.length, 'slides');
      } else {
        console.warn('⚠️ Unexpected slides format:', slidesResponse);
        slidesToSet = [];
      }
      setDynamicSlides(slidesToSet);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 3: Generate engagement content
      setCurrentStage(2);
      console.log('🎯 Starting engagement generation...');
      const engagement = await generateEngagementContent(formData, outline);
      console.log('🎯 Engagement response:', engagement);
      setEngagementData(engagement);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 4: Generate strategy
      setCurrentStage(3);
      console.log('🎯 Starting strategy generation...');
      const strategy = await generateSalesStrategy(formData, outline);
      console.log('🎯 Strategy response:', strategy);
      setDynamicStrategy(strategy);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 5: Generate social media content
      setCurrentStage(4);
      console.log('🎯 Starting social media generation...');
      const socialMedia = await generateSocialMediaContent(formData, outline);
      console.log('🎯 Social media response:', socialMedia);
      setSocialMediaContent(socialMedia);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 6: Generate email content
      setCurrentStage(5);
      console.log('🎯 Starting email generation...');
      const email = await generateEmailContent(formData, outline);
      console.log('🎯 Email response:', email);
      setEmailContent(email);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 7: Generate marketing plan
      setCurrentStage(6);
      console.log('🎯 Starting marketing plan generation...');
      const marketingPlan = await generateMarketingPlanContent(formData, outline);
      console.log('🎯 Marketing plan response:', marketingPlan);
      setMarketingPlanContent(marketingPlan);

      // Complete loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsGenerating(false);
    } catch (error) {
      console.error('❌ Error generating content:', error);
      toast({
        title: "שגיאה ביצירת תוכן",
        description: "אירעה שגיאה ביצירת התוכן הדינמי",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    navigate('/');
  };

  const navigateToOverview = () => {
    setActiveTab("overview");
  };

  const handleExportClick = () => {
    setShowExportDialog(true);
  };

  const getSummaryData = () => {
    return {
      formData,
      chapters,
      outline,
      dynamicSlides,
      dynamicStrategy,
      engagementData,
      socialMediaContent,
      emailContent,
      marketingPlanContent
    };
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-7 mb-8 text-xs">
            <TabsTrigger value="main" className="flex items-center gap-1">
              <Home className="w-3 h-3" />
              <span className="hidden sm:inline">ראשי</span>
            </TabsTrigger>
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
            <TabsTrigger value="marketing" className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="hidden sm:inline">שיווק</span>
            </TabsTrigger>
          </TabsList>

          {/* Main Tab Content */}
          <TabsContent value="main" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">סקירה כללית של ההרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                <div className="space-y-6 text-right">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">נושא ההרצאה</h3>
                    <p className="text-gray-700">{formData?.idea}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">קהל יעד</h3>
                    <p className="text-gray-700">{formData?.audienceProfile}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">משך ההרצאה</h3>
                    <p className="text-gray-700">{formData?.duration} דקות</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    <Button onClick={() => setActiveTab("overview")} variant="outline" className="h-20">
                      <div className="text-center">
                        <FileText className="w-6 h-6 mx-auto mb-2" />
                        <span>סקירה מפורטת</span>
                      </div>
                    </Button>
                    <Button onClick={() => setActiveTab("slides")} variant="outline" className="h-20">
                      <div className="text-center">
                        <Presentation className="w-6 h-6 mx-auto mb-2" />
                        <span>מבנה שקפים</span>
                      </div>
                    </Button>
                    <Button onClick={() => setActiveTab("sales-process")} variant="outline" className="h-20">
                      <div className="text-center">
                        <Target className="w-6 h-6 mx-auto mb-2" />
                        <span>תהליך מכירה</span>
                      </div>
                    </Button>
                    <Button onClick={() => setActiveTab("marketing")} variant="outline" className="h-20">
                      <div className="text-center">
                        <DollarSign className="w-6 h-6 mx-auto mb-2" />
                        <span>אסטרטגיית שיווק</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מבט כללי על ההרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {outline && (
                  <div className="space-y-6 text-right">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">מבנה ההרצאה</h3>
                      <p className="text-gray-700 mb-4">{outline.presentationStructure}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">חלוקת זמנים</h3>
                      <p className="text-gray-700 mb-4">{outline.timeDistribution}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">הודעה מעודדת</h3>
                      <p className="text-gray-700">{outline.motivationalMessage}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structure Tab Content */}
          <TabsContent value="structure" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מבנה ההרצאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {chapters && chapters.length > 0 && (
                  <div className="space-y-6 text-right">
                    {chapters.map((chapter, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">פרק {index + 1}: {chapter.title}</h3>
                        <ul className="space-y-2">
                          {chapter.points.map((point, pointIndex) => (
                            <li key={pointIndex} className="text-gray-700 mr-4">• {point.content}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slides Tab Content */}
          <TabsContent value="slides" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">מבנה השקפים</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {dynamicSlides && dynamicSlides.length > 0 && (
                  <div className="space-y-6 text-right">
                    {dynamicSlides.map((slide, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">{slide.section}</span>
                          <span className="text-sm font-medium">שקף {slide.number}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{slide.headline}</h3>
                        <p className="text-gray-700 mb-3">{slide.content}</p>
                        {slide.timeAllocation && (
                          <div className="text-sm text-gray-600">
                            <strong>זמן מוקצה:</strong> {slide.timeAllocation}
                          </div>
                        )}
                        {slide.engagementTip && (
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <strong className="text-blue-800">טיפ למעורבות:</strong>
                            <p className="text-blue-700 mt-1">{slide.engagementTip}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Process Tab Content */}
          <TabsContent value="sales-process" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">תהליך המכירה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {outline?.salesProcess && (
                  <div className="space-y-4 text-right">
                    {outline.salesProcess.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4 space-x-reverse">
                        <div className="flex-shrink-0 w-8 h-8 bg-whiskey text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {step.order}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-800">{step.title}</h4>
                          <p className="text-gray-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Opening Tools Tab Content */}
          <TabsContent value="opening-tools" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">כלי פתיחה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {outline?.openingStyles && (
                  <div className="space-y-4 text-right">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">סגנונות פתיחה מוצעים</h3>
                    <div className="grid gap-4">
                      {outline.openingStyles.map((style, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Lightbulb className="w-5 h-5 text-whiskey ml-2" />
                            <span className="font-medium text-gray-800">אפשרות {index + 1}</span>
                          </div>
                          <p className="text-gray-700">{style}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab Content */}
          <TabsContent value="marketing" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">אסטרטגיית שיווק מלאה</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                <div className="space-y-8 text-right">
                  
                  {/* Social Media Content Section */}
                  {socialMediaContent && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">תוכן לרשתות חברתיות</h3>
                      
                      {/* Facebook Short Post */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">פוסט פייסבוק קצר</h4>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-gray-700">{socialMediaContent.facebookShortPost}</p>
                        </div>
                      </div>

                      {/* Facebook Story Post */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">פוסט סיפור לפייסבוק/לינקדאין</h4>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-gray-700 whitespace-pre-line">{socialMediaContent.facebookStoryPost}</p>
                        </div>
                      </div>

                      {/* Instagram Stories */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">סדרת סטוריז לאינסטגרם</h4>
                        <div className="space-y-3">
                          {socialMediaContent.instagramStories?.map((story: string, index: number) => (
                            <div key={index} className="p-4 bg-purple-50 rounded-lg">
                              <h5 className="font-semibold text-purple-800 mb-2">סטורי {index + 1}</h5>
                              <p className="text-gray-700">{story}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* TikTok Script */}
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-gray-700 mb-3">סקריפט לטיקטוק</h4>
                        <div className="space-y-3">
                          {socialMediaContent.tiktokScript && Object.entries(socialMediaContent.tiktokScript).map(([key, value]) => (
                            <div key={key} className="p-4 bg-yellow-50 rounded-lg">
                              <h5 className="font-semibold text-yellow-800 mb-2">
                                {key === 'disrupt' && 'פתיחה מושכת תשומת לב'}
                                {key === 'hook' && 'הוק - למה להמשיך לצפות'}
                                {key === 'issue' && 'הבעיה שההרצאה פותרת'}
                                {key === 'credibility' && 'אמינות המרצה'}
                                {key === 'lectureDetails' && 'פרטי ההרצאה'}
                                {key === 'callToAction' && 'קריאה לפעולה'}
                              </h5>
                              <p className="text-gray-700">{value as string}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Marketing Section */}
                  {emailContent && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">שיווק באימייל</h3>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">נושא: {emailContent.storytellingEmail?.subject}</h4>
                        <div className="text-gray-700 whitespace-pre-line">{emailContent.storytellingEmail?.body}</div>
                      </div>
                    </div>
                  )}

                  {/* 4-Week Marketing Plan Section */}
                  {marketingPlanContent && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">תוכנית שיווק 4 שבועות</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {marketingPlanContent.fourWeekPlan && Object.entries(marketingPlanContent.fourWeekPlan).map(([weekKey, weekData]: [string, any]) => (
                          <div key={weekKey} className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-lg font-bold text-blue-800 mb-3">{weekData.title}</h4>
                            
                            <div className="mb-3">
                              <h5 className="font-semibold text-blue-700 mb-2">מטרות:</h5>
                              <ul className="space-y-1">
                                {weekData.goals?.map((goal: string, index: number) => (
                                  <li key={index} className="text-gray-700 text-sm">• {goal}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="mb-3">
                              <h5 className="font-semibold text-blue-700 mb-2">פעילויות:</h5>
                              <ul className="space-y-1">
                                {weekData.activities?.map((activity: string, index: number) => (
                                  <li key={index} className="text-gray-700 text-sm">• {activity}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="font-semibold text-blue-700 mb-2">רעיונות לתוכן:</h5>
                              <ul className="space-y-1">
                                {weekData.contentIdeas?.map((idea: string, index: number) => (
                                  <li key={index} className="text-gray-700 text-sm">• {idea}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Budget Considerations */}
                      {marketingPlanContent.budgetConsiderations && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">שיקולי תקציב</h4>
                          <div className="space-y-2">
                            {marketingPlanContent.budgetConsiderations.map((consideration: string, index: number) => (
                              <div key={index} className="p-3 bg-yellow-50 rounded">
                                <p className="text-gray-700">• {consideration}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Metrics */}
                      {marketingPlanContent.keyMetrics && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">מדדי מפתח למעקב</h4>
                          <div className="space-y-2">
                            {marketingPlanContent.keyMetrics.map((metric: string, index: number) => (
                              <div key={index} className="p-3 bg-green-50 rounded">
                                <p className="text-gray-700">• {metric}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Existing dynamic strategy content */}
                  {dynamicStrategy && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">אסטרטגיית מכירות מתקדמת</h3>
                      {/* Display Dynamic Strategy Content */}
                      {dynamicStrategy.salesProcess && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-700 mb-3">תהליך מכירה</h4>
                          <ul className="list-decimal pl-6">
                            {dynamicStrategy.salesProcess.map((step: any, index: number) => (
                              <li key={index} className="text-gray-700 mb-2">
                                <span className="font-semibold">{step.step}:</span> {step.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dynamicStrategy.customerEngagement && (
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-700 mb-3">מעורבות לקוחות</h4>
                          <ul className="list-disc pl-6">
                            {dynamicStrategy.customerEngagement.map((engagement: any, index: number) => (
                              <li key={index} className="text-gray-700 mb-2">
                                <span className="font-semibold">{engagement.technique}:</span> {engagement.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dynamicStrategy.closingTechniques && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-3">טכניקות סגירה</h4>
                          <ul className="list-disc pl-6">
                            {dynamicStrategy.closingTechniques.map((technique: any, index: number) => (
                              <li key={index} className="text-gray-700 mb-2">
                                <span className="font-semibold">{technique.technique}:</span> {technique.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Action buttons section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Button onClick={handleRestart} className="bg-whiskey hover:bg-whiskey-dark text-white px-8 py-3 text-lg">סיום ויצירת הרצאה חדשה</Button>
          
          <Button 
            onClick={handleExportClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-lg"
          >
            <Mail className="w-4 h-4 mr-2" />
            ייצוא לאימייל
          </Button>
          
          <div className="text-center">
            <Button onClick={() => window.open('https://wa.link/47lii7', '_blank')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-2xl">יצירת קשר וייעוץ ראשוני חינם</Button>
          </div>
        </div>

        <ExportDialog 
          open={showExportDialog} 
          onOpenChange={setShowExportDialog}
          summaryData={getSummaryData()}
        />
      </div>
    </div>
  );
};

export default PresentationSummary;
