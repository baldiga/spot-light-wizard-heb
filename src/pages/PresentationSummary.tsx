
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

  // Calculate actual time distribution based on duration
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

  // Generate slide-by-slide presentation structure
  const generateSlideStructure = () => {
    const slides = [
      { number: 1, headline: "שקף פתיחה", content: "כותרת ההרצאה, שם המרצה ותפקידו", visual: "לוגו/תמונה מייצגת", notes: "התחלה חזקה ומושכת תשומת לב" },
      { number: 2, headline: "מי אני", content: `הצגה עצמית מקצועית - ${formData.speakerBackground}`, visual: "תמונה אישית/מקצועית", notes: "בניית אמינות ורלוונטיות" },
      { number: 3, headline: "למה אתם כאן?", content: `זיהוי הקהל - ${formData.audienceProfile}`, visual: "תמונות של קהל היעד", notes: "יצירת חיבור עם הקהל" },
      { number: 4, headline: "מבנה ההרצאה", content: "סקירת הנושאים שיוצגו - 3 פרקים עיקריים", visual: "מפת דרכים ויזואלית", notes: "הכנת הקהל למסע הלמידה" },
      { number: 5, headline: chapters[0]?.title || "פרק ראשון", content: `${chapters[0]?.points[0]?.content || ''} - מושגי יסוד ויסודות`, visual: "אינפוגרפיקה/דיאגרמה", notes: "התחלת התוכן המרכזי" },
      { number: 6, headline: "המשך פרק ראשון", content: `${chapters[0]?.points[1]?.content || ''} - העמקה בנושא`, visual: "דוגמאות מעשיות", notes: "חיזוק ההבנה" },
      { number: 7, headline: "דוגמאות מעשיות", content: `דוגמאות קונקרטיות ומקרי מבחן ל${chapters[0]?.title}`, visual: "צילומי מסך/תרשימים", notes: "הפיכת התיאוריה לפרקטיקה" },
      { number: 8, headline: "סיכום פרק ראשון", content: `${chapters[0]?.points[2]?.content || ''} - סיכום נקודות מפתח`, visual: "רשימת סיכום", notes: "עיגון הלמידה" },
      { number: 9, headline: chapters[1]?.title || "פרק שני", content: `${chapters[1]?.points[0]?.content || ''} - אסטרטגיות מתקדמות`, visual: "גרפים/טבלאות", notes: "העמקה בתוכן" },
      { number: 10, headline: "כלים ושיטות", content: `${chapters[1]?.points[1]?.content || ''} - כלים מעשיים`, visual: "צילומי מסך/דגמים", notes: "מעבר לפרקטיקה" },
      { number: 11, headline: "הדגמה חיה", content: `הדגמה חיה של הכלים והשיטות מ${chapters[1]?.title}`, visual: "הדגמה בזמן אמת", notes: "למידה באמצעות תרגול" },
      { number: 12, headline: "יישום בפועל", content: `${chapters[1]?.points[2]?.content || ''} - דוגמאות מהשטח`, visual: "מקרי מבחן", notes: "הוכחת יעילות" },
      { number: 13, headline: chapters[2]?.title || "פרק שלישי", content: `${chapters[2]?.points[0]?.content || ''} - תוצאות ויישום`, visual: "גרפי הצלחה", notes: "הצגת תוצאות" },
      { number: 14, headline: "מדידה ומעקב", content: `${chapters[2]?.points[1]?.content || ''} - איך למדוד הצלחה`, visual: "דשבורד/מדדים", notes: "כלים למעקב" },
      { number: 15, headline: "אופטימיזציה", content: `${chapters[2]?.points[2]?.content || ''} - שיפור מתמיד`, visual: "מחזור שיפור", notes: "תהליך מתמשך" },
      { number: 16, headline: "הצגת הפתרון", content: `כך ${formData.serviceOrProduct} יכול לעזור לכם`, visual: "תמונות המוצר/שירות", notes: "מעבר לחלק המכירתי" },
      { number: 17, headline: "עדויות לקוחות", content: "סיפורי הצלחה ומקרי מבחן", visual: "תמונות/ציטוטים", notes: "בניית אמינות" },
      { number: 18, headline: "קריאה לפעולה", content: formData.callToAction, visual: "פרטי התקשרות בולטים", notes: "סגירת המכירה" }
    ];
    return slides;
  };

  const slides = generateSlideStructure();

  // Generate B2B email template based on user data
  const generateB2BEmail = () => {
    return `נושא: הזמנה מיוחדת להרצאה בנושא ${formData.idea}

שלום [שם איש הקשר],

אני [השם שלך], ${formData.speakerBackground}.

במהלך השנים שעבדתי עם ${formData.audienceProfile}, גיליתי דבר מעניין - רוב הארגונים נתקלים באותם אתגרים כשמדובר ב${formData.idea}. 

לאחרונה פגשתי מנכ"ל של חברה מובילה בתחום [תחום רלוונטי לקהל היעד] שסיפר לי כיצד הצליחו להגדיל את התוצאות שלהם ב-40% תוך 6 חודשים, רק על ידי יישום הגישה שאני מציג בהרצאה שלי.

ההרצאה "${formData.idea}" מיועדת במיוחד עבור ${formData.audienceProfile} ומתמקדת בפתרונות מעשיים שניתן ליישם מיד לאחר ההרצאה.

במהלך ${formData.duration} דקות, המשתתפים ילמדו:
${chapters.map((chapter, idx) => `${idx + 1}. ${chapter.title} - ${chapter.points[0]?.content}`).join('\n')}

ההרצאה כוללת כלים מעשיים, דוגמאות מהשטח ומתודולוגיה מוכחת שכבר עזרה למאות ארגונים להשיג תוצאות מרשימות.

${formData.callToAction}

אשמח לשלוח לך תקציר מפורט של ההרצאה ולקבוע שיחת היכרות קצרה.

בברכה,
[השם שלך]
[פרטי התקשרות]

נ.ב. אם תזמינו את ההרצאה השבוע, אוכל לכלול גם סדנה קצרה ללא עלות נוספת.`;
  };

  const b2bEmail = generateB2BEmail();

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(b2bEmail);
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

          <TabsContent value="outline" className="bg-white p-6 rounded-lg shadow border border-gray-200" dir="rtl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">מבנה ראשי הפרקים</h2>
            <div className="space-y-8 text-right">
              {chapters.map((chapter, idx) => (
                <div key={chapter.id} className="text-right">
                  <div className="flex items-center mb-4 justify-end">
                    <h3 className="text-xl font-bold text-gray-800 text-right ml-3">{chapter.title}</h3>
                    <div className="w-10 h-10 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <ul className="space-y-3 pr-14 text-right">
                    {chapter.points.map(point => (
                      <li key={point.id} className="flex items-start justify-end text-right">
                        <span className="text-gray-600 text-right">{point.content}</span>
                        <span className="text-whiskey mr-2">•</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opening" className="bg-white p-6 rounded-lg shadow border border-gray-200" dir="rtl">
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">סגנונות פתיחה מוצלחים</h2>
              <ul className="space-y-4 text-right pr-4">
                {outline.openingStyles.map((style, idx) => (
                  <li key={idx} className="flex items-start justify-end text-right">
                    <p className="text-gray-600 pt-1 text-right mr-3">{style}</p>
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold mt-1">
                      {idx + 1}
                    </div>
                  </li>
                ))}
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
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">פעילויות אינטראקטיביות</h2>
              <ul className="space-y-4 text-right pr-4">
                {outline.interactiveActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start justify-end text-right">
                    <p className="text-gray-600 pt-1 text-right mr-3">{activity}</p>
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold mt-1">
                      {idx + 1}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">שאלות לדיון</h2>
              {Object.entries(outline.discussionQuestions).map(([section, questions], idx) => (
                <div key={idx} className="mb-4 text-right">
                  <h3 className="font-semibold text-gray-800 mb-2 text-right">{section}</h3>
                  <ul className="space-y-2 pr-4 text-right">
                    {questions.map((question, qIdx) => (
                      <li key={qIdx} className="flex items-start justify-end text-right">
                        <span className="text-gray-600 text-right mr-2">{question}</span>
                        <span className="text-whiskey">•</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slides.map((slide) => (
                    <TableRow key={slide.number} className="text-right">
                      <TableCell className="text-right font-medium">{slide.number}</TableCell>
                      <TableCell className="text-right font-semibold">{slide.headline}</TableCell>
                      <TableCell className="text-right">{slide.content}</TableCell>
                      <TableCell className="text-right text-sm text-gray-600">{slide.visual}</TableCell>
                      <TableCell className="text-right text-sm text-gray-500">{slide.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="bg-white p-6 rounded-lg shadow border border-gray-200" dir="rtl">
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">שיווק לקהל הרחב</h2>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-right">תכנית קידום 4 שבועות</h3>
              <div className="space-y-6 text-right">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-2 text-right">שבוע 1 - הכנה ובניית מודעות</h4>
                  <ul className="space-y-1 text-right pr-4">
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">יצירת דף נחיתה מקצועי עם פרטי ההרצאה</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">הפקת תוכן ויזואלי (פוסטרים, סרטונים קצרים)</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">פתיחת רשימת אימיילים למעוניינים</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">הכנת תוכן לרשתות חברתיות</span>
                      <span className="text-whiskey">•</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-2 text-right">שבוע 2 - השקה ברשתות חברתיות</h4>
                  <ul className="space-y-1 text-right pr-4">
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">פרסום בפלטפורמות רלוונטיות (LinkedIn, Facebook, Instagram)</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">שיתופים עם משפיענים בתחום</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">פרסום בקבוצות מקצועיות רלוונטיות</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">תחילת קמפיין פרסום ממומן</span>
                      <span className="text-whiskey">•</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-2 text-right">שבוע 3 - הרחבת החשיפה</h4>
                  <ul className="space-y-1 text-right pr-4">
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">שליחת הודעות למנויי הרשימה</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">יצירת תוכן חינמי בנושא (מאמרים, סרטונים)</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">פנייה לעיתונות המקומית/מקצועית</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">הוספת מותג VIP עם הטבות מיוחדות</span>
                      <span className="text-whiskey">•</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-2 text-right">שבוע 4 - דחיפה אחרונה</h4>
                  <ul className="space-y-1 text-right pr-4">
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">תזכורות אישיות ודחופות</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">הנחות מיוחדות לרכישה מהירה</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">יצירת תחושת דחיפות (מקומות מוגבלים)</span>
                      <span className="text-whiskey">•</span>
                    </li>
                    <li className="text-gray-600 text-right flex items-start justify-end">
                      <span className="text-right mr-2">אסטרטגיית FOMO (Fear of Missing Out)</span>
                      <span className="text-whiskey">•</span>
                    </li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-4 mt-8 text-right">אסטרטגיית תמחור וכרטיסי VIP</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-right">
                <ul className="space-y-2 text-right pr-4">
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2"><strong>כרטיס רגיל:</strong> מחיר בסיסי להרצאה</span>
                    <span className="text-whiskey">•</span>
                  </li>
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2"><strong>כרטיס VIP:</strong> הרצאה + חומרי עזר + גישה לקהילה סגורה + פגישה אישית קצרה</span>
                    <span className="text-whiskey">•</span>
                  </li>
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2"><strong>כרטיס פרמיום:</strong> כל מה שלמעלה + הקלטת ההרצאה + הנחה על שירותים עתידיים</span>
                    <span className="text-whiskey">•</span>
                  </li>
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2"><strong>Early Bird:</strong> הנחה של 20% לרוכשים בשבועיים הראשונים</span>
                    <span className="text-whiskey">•</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">מכירות לארגונים</h2>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-right">תחומים מומלצים לפנייה</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 text-right">
                <ul className="space-y-1 text-right pr-4">
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2">חברות טכנולוגיה ופיתוח</span>
                    <span className="text-whiskey">•</span>
                  </li>
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2">מוסדות חינוך ומכללות</span>
                    <span className="text-whiskey">•</span>
                  </li>
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2">ארגונים מקצועיים ואיגודים</span>
                    <span className="text-whiskey">•</span>
                  </li>
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2">חברות בתחום השירותים העסקיים</span>
                    <span className="text-whiskey">•</span>
                  </li>
                  <li className="text-gray-600 text-right flex items-start justify-end">
                    <span className="text-right mr-2">עמותות ורשויות מקומיות</span>
                    <span className="text-whiskey">•</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Button
                  onClick={copyEmailToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedEmail ? "הועתק!" : "העתק"}
                </Button>
                <h3 className="text-xl font-bold text-gray-800 text-right">מייל פנייה לארגונים</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-right">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap text-right" style={{fontFamily: 'inherit', direction: 'rtl'}}>
                  {b2bEmail}
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
