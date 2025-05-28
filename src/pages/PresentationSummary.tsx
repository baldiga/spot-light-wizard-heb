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
import { Loader2, FileText, Users, Target, DollarSign, Presentation, Lightbulb, Zap, Home, Mail } from 'lucide-react';
import { generateSlideStructure, generateSalesStrategy, generateEngagementContent, generateSocialMediaContent, generateEmailImageContent, generateMarketingPlanContent } from '@/services/presentationService';

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
    name: 'email-image',
    message: 'יוצר אימייל שיווקי ותמונה קידומית...',
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
  const [emailImageContent, setEmailImageContent] = useState<any>(null);
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

      // Stage 6: Generate email and image content
      setCurrentStage(5);
      console.log('🎯 Starting email/image generation...');
      const emailImage = await generateEmailImageContent(formData, outline);
      console.log('🎯 Email/image response:', emailImage);
      setEmailImageContent(emailImage);
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
      emailImageContent,
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
          <TabsList className="grid w-full grid-cols-11 mb-8 text-xs">
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
            <TabsTrigger value="engagement" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">מעורבות</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="hidden sm:inline">שיווק</span>
            </TabsTrigger>
            <TabsTrigger value="social-media" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline">רשתות</span>
            </TabsTrigger>
            <TabsTrigger value="email-marketing" className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="hidden sm:inline">אימייל</span>
            </TabsTrigger>
            <TabsTrigger value="marketing-calendar" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">לוח</span>
            </TabsTrigger>
          </TabsList>

          {/* New Main Tab */}
          <TabsContent value="main" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardContent className="pt-6" dir="rtl">
                <div className="text-center space-y-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">ההרצאה שלך מוכנה!</h1>
                  
                  <h2 className="text-2xl text-gray-700 mb-8">שימו לב
כל התכנים כאן נוצרו ע"י סוכן מאומן
ועם זאת אני מזמין אתכם ואתכן להשתמש במידע הזה
כבסיס להצלחה שלכם, להתאים אותה לאופי והאישיות שלכם
וכמובן, להשתמש בזה כדלק ולהוציא את ההרצאה לפועל</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-xl font-semibold mb-3 text-gray-dark">צריכים עזרה מקצועית?</h3>
                      <p className="text-gray-600">השתמשו בכפתור הירוק בתחתית הדף ליצירת הקשר הישיר איתי דרך הוואטצאפ</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-xl font-semibold mb-3 text-gray-dark">זה הדליק בכם ניצוץ
ורוצים שזה יהפוך לאש?!</h3>
                      <p className="text-gray-600">מכירה על הבמה זה לא רק ההרצאה הכי טובה אלא מכלול של חווית לקוח והצעה נכונה.
אל תפסיקו להשחיז</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                      <h3 className="text-xl font-semibold mb-3 text-gray-dark">יש לכם כבר תקופה חלום להוציא לדרך כנס עסקי גדול משלכם?</h3>
                      <p className="text-gray-600">השתמשו בכפתור הירוק ליצירת קשר ישיר איתי דרך הוואטצאפ וקבלו פרטים נוספים על תוכנית חיית כנסים בליווי אישי ויחד ניצור לך כנס עסקי שמכניס 6-7 ספרות בערב אחד!</p>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <Button onClick={navigateToOverview} className="bg-whiskey hover:bg-whiskey-dark text-white px-8 py-3 text-lg">עברו לסיכום המלא</Button>
                  </div>
                </div>
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
                <CardTitle className="text-2xl text-gray-dark text-right">מבנה ההרצאה (4 פרקים)</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {chapters.length > 0 ? <div className="space-y-6 text-right">
                    {chapters.slice(0, 4).map((chapter, index) => <div key={chapter.id} className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="text-xl font-bold text-gray-800 text-right mb-3">
                          פרק {index + 1}: {chapter.title}
                        </h3>
                        <ul className="space-y-2">
                          {chapter.points.map(point => <li key={point.id} className="flex items-start text-right">
                              <span className="w-2 h-2 bg-whiskey rounded-full mt-2 ml-3 flex-shrink-0"></span>
                              <span className="text-gray-600">{point.content}</span>
                            </li>)}
                        </ul>
                      </div>)}
                  </div> : <p className="text-gray-500 text-center text-right">לא נוצר מבנה הרצאה</p>}
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
                {dynamicSlides && dynamicSlides.length > 0 ? <div className="space-y-6">
                    {dynamicSlides.map((slide, index) => <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-whiskey text-white rounded-full flex items-center justify-center text-sm font-bold ml-3">
                              {slide?.number || index + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{slide?.headline || `שקף ${index + 1}`}</h3>
                              {slide?.section && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{slide.section}</span>}
                            </div>
                          </div>
                          {slide?.timeAllocation && <span className="text-sm text-whiskey font-medium">{slide.timeAllocation}</span>}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">תוכן השקף:</h4>
                            <p className="text-gray-600 text-sm">{slide?.content || 'תוכן השקף'}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">אלמנטים ויזואליים:</h4>
                            <p className="text-gray-600 text-sm">{slide?.visual || 'תיאור ויזואלי'}</p>
                          </div>
                        </div>
                        
                        {slide?.notes && <div className="mt-4 p-3 bg-yellow-50 rounded">
                            <h4 className="font-semibold text-yellow-800 mb-1">הערות למרצה:</h4>
                            <p className="text-yellow-700 text-sm">{slide.notes}</p>
                          </div>}
                        
                        {slide?.engagementTip && <div className="mt-3 p-3 bg-blue-50 rounded">
                            <h4 className="font-semibold text-blue-800 mb-1">טיפ למעורבות:</h4>
                            <p className="text-blue-700 text-sm">{slide.engagementTip}</p>
                          </div>}
                        
                        {slide?.transitionPhrase && <div className="mt-3 p-3 bg-green-50 rounded">
                            <h4 className="font-semibold text-green-800 mb-1">משפט מעבר:</h4>
                            <p className="text-green-700 text-sm">{slide.transitionPhrase}</p>
                          </div>}
                      </div>)}
                  </div> : <div className="text-center py-8">
                    <p className="text-gray-500 text-right">מבנה השקפים בתהליך יצירה...</p>
                    <p className="text-gray-400 text-sm text-right mt-2">אנא המתן, התוכן נטען</p>
                  </div>}
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
                {outline?.salesProcess && outline.salesProcess.length > 0 ? <div className="space-y-6 text-right">
                    {outline.salesProcess.sort((a, b) => a.order - b.order).slice(0, 10).map((step, index) => <div key={step.id} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex items-start justify-end">
                            <div className="text-right flex-1">
                              <h3 className="text-lg font-bold text-gray-800 text-right mb-2">{step.title}</h3>
                              <p className="text-gray-600 text-right">{step.description}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-sm font-bold ml-3 flex-shrink-0">
                              {index + 1}
                            </div>
                          </div>
                        </div>)}
                  </div> : <p className="text-gray-500 text-center text-right">לא נוצר מהלך מכירה עבור הרצאה זו</p>}
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
                {outline?.openingStyles && Array.isArray(outline.openingStyles) && outline.openingStyles.length > 0 ? <div className="space-y-4 text-right">
                    {outline.openingStyles.map((style, index) => <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-end">
                          <div className="text-right flex-1">
                            <p className="text-gray-700">{typeof style === 'string' ? style : JSON.stringify(style)}</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-sm font-bold ml-3 flex-shrink-0">
                            {index + 1}
                          </div>
                        </div>
                      </div>)}
                  </div> : <p className="text-gray-500 text-center text-right">לא נוצרו רעיונות לפתיחה</p>}
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
                {engagementData ? <div className="space-y-6 text-right">
                    {engagementData.interactiveActivities && Array.isArray(engagementData.interactiveActivities) && engagementData.interactiveActivities.length > 0 && <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">פעילויות אינטראקטיביות</h3>
                        <div className="space-y-3">
                          {engagementData.interactiveActivities.map((activity: any, index: number) => <div key={index} className="p-4 bg-blue-50 rounded-lg">
                              <p className="text-gray-700">{typeof activity === 'string' ? activity : JSON.stringify(activity)}</p>
                            </div>)}
                        </div>
                      </div>}

                    {engagementData.discussionQuestions && typeof engagementData.discussionQuestions === 'object' && Object.keys(engagementData.discussionQuestions).length > 0 && <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">שאלות לדיון</h3>
                        {Object.entries(engagementData.discussionQuestions).map(([chapter, questions]) => <div key={chapter} className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-2">{chapter}</h4>
                            <div className="space-y-2">
                              {Array.isArray(questions) && questions.map((question: any, index: number) => <div key={index} className="p-3 bg-green-50 rounded">
                                  <p className="text-gray-700">{typeof question === 'string' ? question : JSON.stringify(question)}</p>
                                </div>)}
                            </div>
                          </div>)}
                      </div>}

                    {engagementData.engagementMetrics && <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">כלים נוספים למעורבות</h3>
                        {engagementData.engagementMetrics.pollQuestions && Array.isArray(engagementData.engagementMetrics.pollQuestions) && <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2">שאלות סקר</h4>
                            <div className="space-y-2">
                              {engagementData.engagementMetrics.pollQuestions.map((poll: any, index: number) => <div key={index} className="p-3 bg-yellow-50 rounded">
                                  <p className="text-gray-700">{typeof poll === 'string' ? poll : JSON.stringify(poll)}</p>
                                </div>)}
                            </div>
                          </div>}
                      </div>}
                  </div> : <div className="text-center py-8">
                    <p className="text-gray-500 text-right">תוכן מעורבות בתהליך יצירה...</p>
                    <p className="text-gray-400 text-sm text-right mt-2">אנא המתן, התוכן נטען</p>
                  </div>}
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
                {dynamicStrategy ? <div className="space-y-6 text-right">
                    {/* 4 Week Plan Section */}
                    {dynamicStrategy.fourWeekPlan && <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">תוכנית 4 שבועות</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(dynamicStrategy.fourWeekPlan).map(([week, data]: [string, any]) => <div key={week} className="p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-semibold text-blue-800 mb-2">{week}</h4>
                              {data.goals && Array.isArray(data.goals) && <ul className="space-y-1">
                                  {data.goals.map((goal: string, index: number) => <li key={index} className="text-gray-700 text-sm">• {goal}</li>)}
                                </ul>}
                            </div>)}
                        </div>
                      </div>}

                    {dynamicStrategy.targetAudiences && Array.isArray(dynamicStrategy.targetAudiences) && dynamicStrategy.targetAudiences.length > 0 && <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">קהלי יעד</h3>
                        <div className="space-y-3">
                          {dynamicStrategy.targetAudiences.map((audience: string, index: number) => <div key={index} className="p-4 bg-blue-50 rounded-lg">
                              <p className="text-gray-700">{audience}</p>
                            </div>)}
                        </div>
                      </div>}

                    {dynamicStrategy.marketingChannels && Array.isArray(dynamicStrategy.marketingChannels) && dynamicStrategy.marketingChannels.length > 0 && <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">ערוצי שיווק</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dynamicStrategy.marketingChannels.map((channel: any, index: number) => <div key={index} className="p-4 bg-green-50 rounded-lg">
                              <h4 className="font-semibold text-green-800 mb-2">{channel?.channel || `ערוץ ${index + 1}`}</h4>
                              <p className="text-gray-700 text-sm mb-2">{channel?.strategy || ''}</p>
                              <p className="text-gray-600 text-xs"><strong>לוח זמנים:</strong> {channel?.timeline || ''}</p>
                              <p className="text-gray-600 text-xs"><strong>תקציב:</strong> {channel?.budget || ''}</p>
                            </div>)}
                        </div>
                      </div>}

                    {dynamicStrategy.pricingStrategy && typeof dynamicStrategy.pricingStrategy === 'object' && Object.keys(dynamicStrategy.pricingStrategy).length > 0 && <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">אסטרטגיית תמחור</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(dynamicStrategy.pricingStrategy).map(([key, value]) => <div key={key} className="p-4 bg-yellow-50 rounded-lg">
                              <p className="text-gray-700">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                            </div>)}
                        </div>
                      </div>}

                    {/* Enhanced Collaboration Section */}
                    {dynamicStrategy.collaborationOpportunities && <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">הזדמנויות שיתוף פעולה</h3>
                        <div className="space-y-3">
                          {(Array.isArray(dynamicStrategy.collaborationOpportunities) ? dynamicStrategy.collaborationOpportunities : [dynamicStrategy.collaborationOpportunities]).map((opportunity: any, index: number) => <div key={index} className="p-4 bg-purple-50 rounded-lg">
                              {typeof opportunity === 'object' ? <div>
                                  <h4 className="font-semibold text-purple-800 mb-2">{opportunity.title || 'שיתוף פעולה'}</h4>
                                  <p className="text-gray-700 text-sm">{opportunity.description || opportunity}</p>
                                  {opportunity.implementation && <p className="text-gray-600 text-xs mt-2"><strong>יישום:</strong> {opportunity.implementation}</p>}
                                </div> : <p className="text-gray-700">{opportunity}</p>}
                            </div>)}
                        </div>
                      </div>}

                    {/* Enhanced Content Marketing Section */}
                    {dynamicStrategy.contentMarketing && <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">שיווק תוכן</h3>
                        <div className="space-y-3">
                          {(Array.isArray(dynamicStrategy.contentMarketing) ? dynamicStrategy.contentMarketing : [dynamicStrategy.contentMarketing]).map((content: any, index: number) => <div key={index} className="p-4 bg-orange-50 rounded-lg">
                              {typeof content === 'object' ? <div>
                                  <h4 className="font-semibold text-orange-800 mb-2">{content.title || 'תוכן שיווקי'}</h4>
                                  <p className="text-gray-700 text-sm">{content.description || content}</p>
                                  {content.actionItems && Array.isArray(content.actionItems) && <ul className="mt-2 space-y-1">
                                      {content.actionItems.map((item: string, itemIndex: number) => <li key={itemIndex} className="text-gray-600 text-xs">• {item}</li>)}
                                    </ul>}
                                </div> : <p className="text-gray-700">{content}</p>}
                            </div>)}
                        </div>
                      </div>}

                    {/* Enhanced Tracking Section */}
                    {dynamicStrategy.followUpStrategy && <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">אסטרטגיית מעקב ומדידה</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          {typeof dynamicStrategy.followUpStrategy === 'object' ? <div>
                              <p className="text-gray-700 mb-3">{dynamicStrategy.followUpStrategy.description || 'אסטרטגיית מעקב מותאמת'}</p>
                              {dynamicStrategy.followUpStrategy.metrics && Array.isArray(dynamicStrategy.followUpStrategy.metrics) && <div>
                                  <h4 className="font-semibold text-gray-800 mb-2">מדדי מעקב:</h4>
                                  <ul className="space-y-1">
                                    {dynamicStrategy.followUpStrategy.metrics.map((metric: string, index: number) => <li key={index} className="text-gray-600 text-sm">• {metric}</li>)}
                                  </ul>
                                </div>}
                              {dynamicStrategy.followUpStrategy.tools && Array.isArray(dynamicStrategy.followUpStrategy.tools) && <div className="mt-3">
                                  <h4 className="font-semibold text-gray-800 mb-2">כלי מעקב:</h4>
                                  <ul className="space-y-1">
                                    {dynamicStrategy.followUpStrategy.tools.map((tool: string, index: number) => <li key={index} className="text-gray-600 text-sm">• {tool}</li>)}
                                  </ul>
                                </div>}
                            </div> : <p className="text-gray-700">{dynamicStrategy.followUpStrategy}</p>}
                        </div>
                      </div>}
                  </div> : <div className="text-center py-8">
                    <p className="text-gray-500 text-right">אסטרטגיית השיווק בתהליך יצירה...</p>
                    <p className="text-gray-400 text-sm text-right mt-2">אנא המתן, התוכן נטען</p>
                  </div>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Social Media Tab */}
          <TabsContent value="social-media" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">תוכן לרשתות חברתיות</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {socialMediaContent ? (
                  <div className="space-y-6 text-right">
                    {/* Facebook Short Post */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">פוסט פייסבוק קצר</h3>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-700">{socialMediaContent.facebookShortPost}</p>
                      </div>
                    </div>

                    {/* Facebook Story Post */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">פוסט סיפור לפייסבוק/לינקדאין</h3>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">{socialMediaContent.facebookStoryPost}</p>
                      </div>
                    </div>

                    {/* Instagram Stories */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">סדרת סטוריז לאינסטגרם</h3>
                      <div className="space-y-3">
                        {socialMediaContent.instagramStories?.map((story: string, index: number) => (
                          <div key={index} className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold text-purple-800 mb-2">סטורי {index + 1}</h4>
                            <p className="text-gray-700">{story}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TikTok Script */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">סקריפט לטיקטוק</h3>
                      <div className="space-y-3">
                        {socialMediaContent.tiktokScript && Object.entries(socialMediaContent.tiktokScript).map(([key, value]) => (
                          <div key={key} className="p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 mb-2">
                              {key === 'disrupt' && 'פתיחה מושכת תשומת לב'}
                              {key === 'hook' && 'הוק - למה להמשיך לצפות'}
                              {key === 'issue' && 'הבעיה שההרצאה פותרת'}
                              {key === 'credibility' && 'אמינות המרצה'}
                              {key === 'lectureDetails' && 'פרטי ההרצאה'}
                              {key === 'callToAction' && 'קריאה לפעולה'}
                            </h4>
                            <p className="text-gray-700">{value as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-right">תוכן רשתות חברתיות בתהליך יצירה...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Email Marketing Tab */}
          <TabsContent value="email-marketing" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">שיווק באימייל ותמונה קידומית</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {emailImageContent ? (
                  <div className="space-y-6 text-right">
                    {/* Storytelling Email */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">אימייל שיווקי בסגנון סיפור</h3>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">נושא: {emailImageContent.storytellingEmail?.subject}</h4>
                        <div className="text-gray-700 whitespace-pre-line">{emailImageContent.storytellingEmail?.body}</div>
                      </div>
                    </div>

                    {/* Promotional Image */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">תמונה קידומית</h3>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">תיאור התמונה:</h4>
                        <p className="text-gray-700 mb-4">{emailImageContent.promotionalImage?.description}</p>
                        
                        <div className="bg-white p-4 rounded border-2 border-dashed border-orange-300">
                          <p className="text-center text-gray-600 mb-2">💡 {emailImageContent.promotionalImage?.downloadNote}</p>
                          <div className="text-center">
                            <a 
                              href={emailImageContent.promotionalImage?.canvaLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                            >
                              📥 פתח ב-Canva
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-right">תוכן שיווק באימייל בתהליך יצירה...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Marketing Calendar Tab */}
          <TabsContent value="marketing-calendar" className="space-y-6">
            <Card className="border-whiskey/20" dir="rtl">
              <CardHeader className="bg-whiskey/5 text-right">
                <CardTitle className="text-2xl text-gray-dark text-right">לוח שיווק 4 שבועות</CardTitle>
              </CardHeader>
              <CardContent className="pt-6" dir="rtl">
                {marketingPlanContent ? (
                  <div className="space-y-6 text-right">
                    {/* 4 Week Plan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {marketingPlanContent.fourWeekPlan && Object.entries(marketingPlanContent.fourWeekPlan).map(([weekKey, weekData]: [string, any]) => (
                        <div key={weekKey} className="p-4 bg-blue-50 rounded-lg">
                          <h3 className="text-lg font-bold text-blue-800 mb-3">{weekData.title}</h3>
                          
                          <div className="mb-3">
                            <h4 className="font-semibold text-blue-700 mb-2">מטרות:</h4>
                            <ul className="space-y-1">
                              {weekData.goals?.map((goal: string, index: number) => (
                                <li key={index} className="text-gray-700 text-sm">• {goal}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-3">
                            <h4 className="font-semibold text-blue-700 mb-2">פעילויות:</h4>
                            <ul className="space-y-1">
                              {weekData.activities?.map((activity: string, index: number) => (
                                <li key={index} className="text-gray-700 text-sm">• {activity}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-blue-700 mb-2">רעיונות לתוכן:</h4>
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
                        <h3 className="text-xl font-bold text-gray-800 mb-4">שיקולי תקציב</h3>
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
                        <h3 className="text-xl font-bold text-gray-800 mb-4">מדדי מפתח למעקב</h3>
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-right">תוכנית השיווק בתהליך יצירה...</p>
                  </div>
                )}
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
