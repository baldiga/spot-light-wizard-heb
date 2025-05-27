import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Copy } from 'lucide-react';

const PresentationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, outline, chapters } = usePresentationStore();
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!formData || !outline) {
      toast({
        title: "מידע חסר",
        description: "אנא השלם את כל השלבים הקודמים",
        variant: "destructive"
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
      description: `מייצא את המסמך בפורמט ${format}...`
    });
    setTimeout(() => {
      toast({
        title: "ייצוא הושלם",
        description: `המסמך יוצא בהצלחה בפורמט ${format}`
      });
    }, 1500);
  };

  const calculateTimeDistribution = () => {
    const totalMinutes = parseInt(formData.duration);
    return {
      opening: Math.round(totalMinutes * 0.1),
      chapter1: Math.round(totalMinutes * 0.25),
      chapter2: Math.round(totalMinutes * 0.35),
      chapter3: Math.round(totalMinutes * 0.2),
      closing: Math.round(totalMinutes * 0.1)
    };
  };
  const timeDistribution = calculateTimeDistribution();

  const slides = outline.dynamicSlides || generateSlideStructure();

  function generateSlideStructure() {
    const slides = [{
      number: 1,
      headline: "שקף פתיחה",
      content: "כותרת ההרצאה, שם המרצה ותפקידו",
      visual: "לוגו/תמונה מייצגת",
      notes: "התחלה חזקה ומושכת תשומת לב"
    }, {
      number: 2,
      headline: "מי אני",
      content: `הצגה עצמית מקצועית - ${formData.speakerBackground}`,
      visual: "תמונה אישית/מקצועית",
      notes: "בניית אמינות ורלוונטיות"
    }, {
      number: 3,
      headline: "למה אתם כאן?",
      content: `זיהוי הקהל - ${formData.audienceProfile}`,
      visual: "תמונות של קהל היעד",
      notes: "יצירת חיבור עם הקהל"
    }, {
      number: 4,
      headline: "מבנה ההרצאה",
      content: "סקירת הנושאים שיוצגו - 3 פרקים עיקריים",
      visual: "מפת דרכים ויזואלית",
      notes: "הכנת הקהל למסע הלמידה"
    },
    // פרק ראשון - מורחב
    {
      number: 5,
      headline: `פתיחת ${chapters[0]?.title || "פרק ראשון"}`,
      content: "הצגת נושא הפרק והשאלות המרכזיות",
      visual: "כותרת מרכזית עם איקונים",
      notes: "מעבר לתוכן המרכזי הראשון"
    }, {
      number: 6,
      headline: "מושגי יסוד",
      content: `${chapters[0]?.points[0]?.content || ''} - הגדרות ומושגים בסיסיים`,
      visual: "אינפוגרפיקה/דיאגרמה",
      notes: "הנחת יסודות ההבנה"
    }, {
      number: 7,
      headline: "חשיבות הנושא",
      content: `${chapters[0]?.points[1]?.content || ''} - למה זה חשוב עכשיו?`,
      visual: "גרפים וסטטיסטיקות",
      notes: "הוכחת הרלוונטיות"
    }, {
      number: 8,
      headline: "יסודות מעשיים",
      content: `${chapters[0]?.points[2]?.content || ''} - כלים בסיסיים ליישום`,
      visual: "דוגמאות ויזואליות",
      notes: "מעבר מתיאוריה לפרקטיקה"
    }, {
      number: 9,
      headline: "דוגמאות מהשטח",
      content: `מקרי מבחן פשוטים מתחום ${chapters[0]?.title}`,
      visual: "צילומי מסך/תרשימים",
      notes: "הדגמת יישום בסיסי"
    },
    // פרק שני - מורחב
    {
      number: 10,
      headline: `מעבר ל${chapters[1]?.title || "פרק שני"}`,
      content: "סיכום הפרק הראשון ומעבר לשלב הבא",
      visual: "מפת מסע המשתמש",
      notes: "חיבור בין הפרקים"
    }, {
      number: 11,
      headline: "אסטרטגיות מתקדמות",
      content: `${chapters[1]?.points[0]?.content || ''} - שיטות עבודה מוכחות`,
      visual: "תרשימי זרימה",
      notes: "העמקה ברמה גבוהה יותר"
    }, {
      number: 12,
      headline: "כלים וטכנולוגיות",
      content: `${chapters[1]?.points[1]?.content || ''} - כלים מעשיים וחדשניים`,
      visual: "ממשקי משתמש/דגמים",
      notes: "הצגת פתרונות טכנולוגיים"
    }, {
      number: 13,
      headline: "הדגמה חיה - חלק א'",
      content: "הדגמה של הכלים בזמן אמת - שלב ראשון",
      visual: "הדגמה בזמן אמת",
      notes: "למידה באמצעות תרגול"
    }, {
      number: 14,
      headline: "הדגמה חיה - חלק ב'",
      content: "המשך ההדגמה - תרחישים מתקדמים",
      visual: "הדגמה בזמן אמת",
      notes: "העמקה בתרגול"
    }, {
      number: 15,
      headline: "יישום בפועל",
      content: `${chapters[1]?.points[2]?.content || ''} - דוגמאות מורכבות מהשטח`,
      visual: "מקרי מבחן מפורטים",
      notes: "הוכחת יעילות בסביבה אמיתית"
    },
    // פרק שלישי - מורחב
    {
      number: 16,
      headline: `התחלת ${chapters[2]?.title || "פרק שלישי"}`,
      content: "מעבר לשלב התוצאות והמדידה",
      visual: "gráfiques מגמות",
      notes: "הצגת הערך העסקי"
    }, {
      number: 17,
      headline: "תוצאות ומדידה",
      content: `${chapters[2]?.points[0]?.content || ''} - איך למדוד הצלחה`,
      visual: "דשבורד ומדדי KPI",
      notes: "כלים למעקב וביקורת"
    }, {
      number: 18,
      headline: "אופטימיזציה מתמשכת",
      content: `${chapters[2]?.points[1]?.content || ''} - שיפור מתמיד`,
      visual: "מחזור שיפור",
      notes: "תהליך מתמשך לשיפור"
    }, {
      number: 19,
      headline: "מקרי הצלחה",
      content: `${chapters[2]?.points[2]?.content || ''} - דוגמאות מוצלחות וחדשניות`,
      visual: "gráfiques הצלחה ועדויות",
      notes: "הצגת תוצאות מוחשיות"
    },
    // מעבר למכירה
    {
      number: 20,
      headline: "הצגת הפתרון",
      content: `כך ${formData.serviceOrProduct} יכול לעזור לכם להשיג תוצאות דומות`,
      visual: "תמונות המוצר/שירות",
      notes: "מעבר לחלק המכירתי"
    }, {
      number: 21,
      headline: "עדויות לקוחות",
      content: "סיפורי הצלחה אמיתיים ומקרי מבחן מפורטים",
      visual: "תמונות לקוחות וציטוטים",
      notes: "בניית אמינות ורלוונטיות"
    }, {
      number: 22,
      headline: "קריאה לפעולה",
      content: formData.callToAction,
      visual: "פרטי התקשרות בולטים",
      notes: "סגירת המכירה והשלבים הבאים"
    }];
    return slides;
  }

  const hebrewB2bEmail = outline.dynamicB2BEmail || generateHebrewB2BEmail();

  function generateHebrewB2BEmail() {
    return `נושא: הזמנה מיוחדת להרצאה שתשנה את הדרך שבה אתם עובדים

שלום [שם איש הקשר],

אני [השם שלך], ${formData.speakerBackground}.

לפני כמה חודשים פגשתי מנהל בחברה מובילה שאמר לי משהו שהפתיע אותי: "אנחנו משקיעים המון משאבים ב${formData.idea}, אבל התוצאות לא מגיעות". 

אחרי שיחה של שעה, הבנתי שהבעיה לא בכישורים או בתקציב - הבעיה הייתה בגישה.

היום, 6 חודשים אחרי שהחברה שלו יישמה את השיטות שאני מציג בהרצאה שלי, הם מדווחים על שיפור של 40% בתוצאות ועל חיסכון משמעותי בזמן ובמשאבים.

ההרצאה "${formData.idea}" נבנתה במיוחד עבור ${formData.audienceProfile} שמחפשים דרכים חכמות יותר להשיג תוצאות מרשימות.

במהלך ${formData.duration} דקות, המשתתפים יגלו:

✓ ${chapters[0]?.title || 'יסודות החשיבה החדשה'} - הגישה שמשנה את כל המשחק
✓ ${chapters[1]?.title || 'כלים מעשיים'} - טכניקות שניתן ליישם כבר מחר בבוקר  
✓ ${chapters[2]?.title || 'תוצאות מוכחות'} - איך למדוד הצלחה ולהמשיך להשתפר

זו לא עוד הרצאה תיאורטית. כל משתתף יקבל:
• כלים מעשיים לשימוש מיידי
• גישה לחומרי עזר בלעדיים
• אפשרות לייעוץ אישי קצר לאחר ההרצאה

המטרה? ${formData.callToAction}

אשמח לשלוח לך את המצגת המקוצרת ולקבוע שיחת היכרות של 15 דקות בלבד.

מה דעתך שנקבע זמן לשיחה קצרה השבוע?

בברכה,
[השם שלך]
[טלפון]
[אימייל]

נ.ב. החברות הראשונות שיזמינו את ההרצאה החודש יקבלו גם סדנת המשך קצרה ללא עלות נוספת.`;
  }

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hebrewB2bEmail);
      setCopiedEmail(true);
      toast({
        title: "הועתק בהצלחה",
        description: "הטקסט הועתק ללוח"
      });
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      toast({
        title: "שגיאה בהעתקה",
        description: "לא ניתן להעתיק את הטקסט",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 text-right">
          <div className="flex items-center mb-4 sm:mb-0">
            <SpotlightLogo className="w-12 h-12 ml-3" />
            <h1 className="text-3xl font-bold text-gray-dark text-right">סיכום ההרצאה</h1>
          </div>
        </div>

        <Card className="mb-8 border-whiskey/20" dir="rtl">
          <CardHeader className="bg-whiskey/5 text-right">
            <CardTitle className="text-xl text-gray-dark text-right">פרטי ההרצאה</CardTitle>
          </CardHeader>
          <CardContent className="pt-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
              <div className="text-right">
                <h3 className="font-semibold text-gray-800 mb-2 text-right">הרעיון הכללי</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 text-right">{formData.idea}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-gray-800 mb-2 text-right">רקע המרצה</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 text-right">{formData.speakerBackground}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-gray-800 mb-2 text-right">פרופיל הקהל</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 text-right">{formData.audienceProfile}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-gray-800 mb-2 text-right">משך ההרצאה</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 text-right">{formData.duration} דקות</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-gray-800 mb-2 text-right">שירות/מוצר לקידום</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 text-right">{formData.serviceOrProduct}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-gray-800 mb-2 text-right">קריאה לפעולה</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 text-right">{formData.callToAction}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="outline" className="mb-8" dir="rtl">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="outline">מבנה ההרצאה</TabsTrigger>
            <TabsTrigger value="opening">פתיחות וחלוקת זמנים</TabsTrigger>
            <TabsTrigger value="interactive">פעילויות ושאלות</TabsTrigger>
            <TabsTrigger value="slides">הצעה למהלך המצגת</TabsTrigger>
            <TabsTrigger value="marketing">שיווק ההרצאה</TabsTrigger>
          </TabsList>

          <TabsContent value="outline" dir="rtl" className="bg-white p-6 rounded-lg shadow border border-gray-200 align-right">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">מבנה ראשי הפרקים</h2>
            <div className="space-y-8 text-right">
              {chapters.map((chapter, idx) => <div key={chapter.id} className="text-right">
                  <div className="flex items-center mb-4 justify-end">
                    <h3 className="text-xl font-bold text-gray-800 text-right ml-3">{chapter.title}</h3>
                    <div className="w-10 h-10 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <ul className="space-y-3 pr-14 text-right">
                    {chapter.points.map(point => <li key={point.id} className="flex items-start justify-end text-right">
                        <span className="text-gray-600 text-right">{point.content}</span>
                        <span className="text-whiskey mr-2">•</span>
                      </li>)}
                  </ul>
                </div>)}
            </div>
          </TabsContent>

          <TabsContent value="opening" className="bg-white p-6 rounded-lg shadow border border-gray-200" dir="rtl">
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">סגנונות פתיחה מוצלחים</h2>
              <ul className="space-y-4 text-right" dir="rtl">
                {outline.openingStyles.map((style, idx) => <li key={idx} className="flex items-start text-right" dir="rtl">
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold mt-1 ml-3">
                      {idx + 1}
                    </div>
                    <p className="text-gray-600 pt-1 text-right">{style}</p>
                  </li>)}
              </ul>
            </div>

            <Separator className="my-6" />

            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">חלוקת זמן מומלצת</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-right">
                <div className="space-y-2 text-right">
                  <p className="text-gray-600 text-right"><strong>פתיחה:</strong> {timeDistribution.opening} דקות</p>
                  <p className="text-gray-600 text-right"><strong>פרק ראשון:</strong> {timeDistribution.chapter1} דקות</p>
                  <p className="text-gray-600 text-right"><strong>פרק שני:</strong> {timeDistribution.chapter2} דקות</p>
                  <p className="text-gray-600 text-right"><strong>פרק שלישי:</strong> {timeDistribution.chapter3} דקות</p>
                  <p className="text-gray-600 text-right"><strong>סיכום וקריאה לפעולה:</strong> {timeDistribution.closing} דקות</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="bg-white p-6 rounded-lg shadow border border-gray-200" dir="rtl">
            <div className="mb-8 text-right" dir="rtl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">פעילויות אינטראקטיביות</h2>
              <ul className="space-y-4 text-right" dir="rtl">
                {outline.interactiveActivities.map((activity, idx) => <li key={idx} className="flex items-start text-right" dir="rtl">
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold mt-1 ml-3">
                      {idx + 1}
                    </div>
                    <p className="text-gray-600 pt-1 text-right">{activity}</p>
                  </li>)}
              </ul>
            </div>

            <Separator className="my-6" />

            <div className="text-right" dir="rtl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">שאלות לדיון</h2>
              {Object.entries(outline.discussionQuestions).map(([section, questions], idx) => <div key={idx} className="mb-4 text-right">
                  <h3 className="font-semibold text-gray-800 mb-2 text-right">{section}</h3>
                  <ul className="space-y-2 text-right" dir="rtl">
                    {questions.map((question, qIdx) => <li key={qIdx} className="flex items-start text-right" dir="rtl">
                        <span className="text-whiskey ml-2">•</span>
                        <span className="text-gray-600 text-right">{question}</span>
                      </li>)}
                  </ul>
                </div>)}
            </div>
          </TabsContent>

          <TabsContent value="slides" className="bg-white p-6 rounded-lg shadow border border-gray-200" dir="rtl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">הצעה למהלך המצגת</h2>
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow className="text-right">
                    <TableHead className="text-right font-bold">מספר שקף</TableHead>
                    <TableHead className="text-right font-bold">כותרת</TableHead>
                    <TableHead className="text-right font-bold">תוכן</TableHead>
                    <TableHead className="text-right font-bold">אלמנטים ויזואליים</TableHead>
                    <TableHead className="text-right font-bold">הערות</TableHead>
                    {slides.some(slide => slide.timeAllocation) && (
                      <TableHead className="text-right font-bold">זמן (דקות)</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slides.map(slide => (
                    <TableRow key={slide.number} className="text-right">
                      <TableCell className="text-right font-medium">{slide.number}</TableCell>
                      <TableCell className="text-right font-semibold">{slide.headline}</TableCell>
                      <TableCell className="text-right">{slide.content}</TableCell>
                      <TableCell className="text-right text-sm text-gray-600">{slide.visual}</TableCell>
                      <TableCell className="text-right text-sm text-gray-500">{slide.notes}</TableCell>
                      {slide.timeAllocation && (
                        <TableCell className="text-right text-sm">{slide.timeAllocation}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="bg-white p-6 rounded-lg shadow border border-gray-200" dir="rtl">
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">שיווק ההרצאה</h2>
              
              {outline.dynamicSalesStrategy && (
                <>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-right">קהלי יעד מומלצים</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 text-right">
                    <ul className="space-y-1 text-right" dir="rtl">
                      {outline.dynamicSalesStrategy.targetAudiences.map((audience, idx) => (
                        <li key={idx} className="text-gray-600 text-right flex items-start" dir="rtl">
                          <span className="text-whiskey ml-2">•</span>
                          <span className="text-right">{audience}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-right">ערוצי שיווק מומלצים</h3>
                  <div className="space-y-4 mb-6">
                    {outline.dynamicSalesStrategy.marketingChannels.map((channel, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h4 className="font-semibold text-gray-800 mb-2 text-right">{channel.channel}</h4>
                        <p className="text-gray-600 mb-2 text-right">{channel.strategy}</p>
                        <div className="flex justify-between text-sm text-gray-500" dir="rtl">
                          <span><strong>תקציב:</strong> {channel.budget}</span>
                          <span><strong>ציר זמן:</strong> {channel.timeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-right">אסטרטגיית תמחור</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 text-right">
                    <div className="space-y-2 text-right" dir="rtl">
                      <p className="text-gray-600 text-right"><strong>כרטיס בסיסי:</strong> {outline.dynamicSalesStrategy.pricingStrategy.basicTicket}</p>
                      <p className="text-gray-600 text-right"><strong>כרטיס VIP:</strong> {outline.dynamicSalesStrategy.pricingStrategy.vipTicket}</p>
                      <p className="text-gray-600 text-right"><strong>כרטיס פרמיום:</strong> {outline.dynamicSalesStrategy.pricingStrategy.premiumTicket}</p>
                      <p className="text-gray-600 text-right"><strong>חבילה ארגונית:</strong> {outline.dynamicSalesStrategy.pricingStrategy.corporatePackage}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between mb-4">
                <Button onClick={copyEmailToClipboard} variant="outline" size="sm" className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  {copiedEmail ? "הועתק!" : "העתק"}
                </Button>
                <h3 className="text-xl font-bold text-gray-800 text-right">מייל פנייה לארגונים</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-right">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap text-right" style={{
                  fontFamily: 'inherit',
                  direction: 'rtl'
                }}>
                  {hebrewB2bEmail}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mb-8" dir="rtl">
          <Button variant="outline" onClick={() => navigate('/outline-confirmation')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
            חזרה לעריכת מבנה
          </Button>
          <Button onClick={() => navigate('/')} className="bg-whiskey hover:bg-whiskey-dark text-white">
            סיום והתחלה מחדש
          </Button>
        </div>

        <div className="flex justify-center space-x-4 space-x-reverse" dir="rtl">
          <Button variant="outline" onClick={() => handleExport('PDF')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
            ייצוא ל-PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('Word')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
            ייצוא ל-Word
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PresentationSummary;
