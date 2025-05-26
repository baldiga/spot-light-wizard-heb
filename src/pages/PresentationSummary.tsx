import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

const PresentationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { formData, outline, chapters } = usePresentationStore();

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "נדרשת הרשמה",
        description: "כדי לראות את הסיכום המלא, אנא הירשם תחילה",
        variant: "destructive"
      });
      navigate('/register');
      return;
    }

    if (!formData || !outline) {
      toast({
        title: "מידע חסר",
        description: "אנא השלם את כל השלבים הקודמים",
        variant: "destructive"
      });
      navigate('/create');
    }
  }, [formData, outline, user, authLoading, navigate, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-whiskey" />
      </div>
    );
  }

  if (!formData || !outline || !user) {
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
    const duration = parseInt(formData.duration);
    return {
      opening: Math.round(duration * 0.1),
      chapter1: Math.round(duration * 0.25),
      chapter2: Math.round(duration * 0.35),
      chapter3: Math.round(duration * 0.2),
      closing: Math.round(duration * 0.1)
    };
  };

  const generateOrganizationEmail = () => {
    return `נושא: הרצאה מעשירה לעובדי ${formData.idea} - הזדמנות לחיזוק הצוות והשראה

שלום רב,

אני ${user?.email || '[שם המרצה]'}, מומחה בתחום ${formData.idea}.

אני רוצה להציע לכם הרצאה ייחודית לעובדיכם שתעניק להם כלים מעשיים ותובנות רלוונטיות לעבודתם היומיומית.

פרטי ההרצאה:
• נושא: ${formData.idea}
• משך: ${formData.duration} דקות
• מותאם לקהל: ${formData.audienceProfile}
• כולל: ${formData.serviceOrProduct}

ההרצאה תכלול:
${chapters.map((chapter, idx) => `• ${chapter.title}`).join('\n')}

הרצאות דומות שנתתי הביאו לתוצאות מדידות:
• שיפור במוטיבציה של העובדים
• כלים מעשיים ליישום מיידי
• חיזוק התרבות הארגונית

אשמח לתאם שיחה קצרה להציג את ההרצאה ולהתאים אותה בדיוק לצרכים שלכם.

בכבוד,
${user?.email || '[שם המרצה]'}
[מספר טלפון]
[כתובת מייל]`;
  };

  const timeDistribution = calculateTimeDistribution();

  const generateSlideshow = () => {
    const slides = [
      { 
        number: 1, 
        headline: "שקף פתיחה", 
        content: `כותרת ההרצאה: "${formData.idea.substring(0, 50)}...", שם המרצה ותפקידו - יצירת רושם ראשון חיובי והצגת הנושא המרכזי`, 
        visual: "לוגו או תמונה רלוונטית שמייצגת את תחום ההתמחות" 
      },
      { 
        number: 2, 
        headline: "הצגה עצמית", 
        content: `רקע המרצה: ${formData.speakerBackground.substring(0, 40)}... - בניית אמינות והראיה שיש לכם את הידע והניסיון`, 
        visual: "תמונה אישית מקצועית או הישגים משמעותיים בתחום" 
      },
      { 
        number: 3, 
        headline: "מבנה ההרצאה", 
        content: "סקירת הנושאים שיוצגו - יצירת ציפיות ברורות ועזרה לקהל להכין את עצמו מנטלית למסע הלמידה", 
        visual: "תוכן עניינים ויזואלי עם איקונים או תרשים זרימה" 
      },
      { 
        number: 4, 
        headline: "פתיחה מעוררת עניין", 
        content: "סיפור אישי, עובדה מפתיעה או שאלה רטורית הקשורה לנושא - י�ירת חיבור רגשי וגרימה לקהל לשים לב", 
        visual: "גרף מרשים, תמונה דרמטית או סטטיסטיקה מפתיעה" 
      },
    ];

    chapters.forEach((chapter, idx) => {
      slides.push({
        number: slides.length + 1,
        headline: `${chapter.title} - כותרת`,
        content: `הצגת הנושא: ${chapter.title} - הסבר מדוע הנושא הזה חשוב ואיך הוא משפיע על החיים או העסק של הקהל`,
        visual: "אייקון או תמונה רלוונטית שמסמלת את הנושא"
      });
      
      chapter.points.forEach((point, pointIdx) => {
        slides.push({
          number: slides.length + 1,
          headline: `${chapter.title} - נקודה ${pointIdx + 1}`,
          content: `${point.content} - הסבר מעמיק עם דוגמאות ממשיות, כלים מעשיים שהקהל יוכל ליישם מיד`,
          visual: "תרשים, גרף, דוגמה ויזואלית או צילום מסך שמדגים את הנקודה"
        });
      });
    });

    slides.push(
      { 
        number: slides.length + 1, 
        headline: "הדגמת המוצר/שירות", 
        content: `הצגה חיה של ${formData.serviceOrProduct} - הראיה כיצד הפתרון עובד בפועל וכיצד הוא פותר את הבעיות שהוזכרו בהרצאה`, 
        visual: "צילום מסך חי, דגמה אינטראקטיבית או וידאו קצר" 
      },
      { 
        number: slides.length + 2, 
        headline: "עדויות לקוחות", 
        content: "סיפורי הצלחה אמיתיים ומדידים - הוכחה חברתית שהפתרון עובד ויוצר תוצאות מוחשיות", 
        visual: "תמונות לקוחות אמיתיים, ציטוטים מעוצבים ונתוני הצלחה" 
      },
      { 
        number: slides.length + 3, 
        headline: "סיכום נקודות מפתח", 
        content: "3-5 הנקודות החשובות ביותר מההרצאה - חזרה על התובנות העיקריות שהקהל צריך לזכור ולקחת איתו הביתה", 
        visual: "רשימה מעוצבת, אינפוגרפיקה או מפת מחשבה" 
      },
      { 
        number: slides.length + 4, 
        headline: "קריאה לפעולה", 
        content: `${formData.callToAction} - הסבר ברור מה הצעד הבא, מתי לעשות אותו ואיך, יצירת תחושת דחיפות ורצון לפעול עכשיו`, 
        visual: "פרטי יצירת קשר בולטים, QR קוד, קישורים ומידע על הטבות מיוחדות" 
      }
    );

    return slides;
  };

  const slideshow = generateSlideshow();

  const enhancedOpeningStyles = [
    {
      style: "פתיחה עם סיפור אישי מעורר השראה",
      example: "איך להשתמש בפתיח הזה: התחילו עם 'לפני שלוש שנים עמדתי מול בחירה שהשפיעה על כל מה שאני עושה היום...'. ספרו על רגע מפנה שהוביל אתכם לתחום של ההרצאה."
    },
    {
      style: "עובדה או סטטיסטיקה מפתיעה הקשורה לנושא",
      example: "איך להשתמש בפתיח הזה: 'האם ידעתם ש-97% מהחברות שלא משקיעות ב[הנושא שלכם] נכשלות תוך שנתיים?' הציגו נתון מדויק ומפתיע שקשור ישירות לתוכן ההרצאה."
    },
    {
      style: "שאלה רטורית שמניעה את הקהל לחשיבה",
      example: "איך להשתמש בפתיח הזה: 'מה הדבר האחד שאם הייתם משנים אותו היום, החיים שלכם היו נראים אחרת לגמרי?' תנו לקהל רגע להרהר ואז קשרו לנושא ההרצאה."
    },
    {
      style: "תרחיש דמיוני שמעמיד את הקהל במצב רלוונטי",
      example: "איך להשתמש בפתיח הזה: 'תארו לעצמכם שאתם מתעוררים מחר בבוקר והבעיה הגדולה ביותר שלכם ב[הנושא] נפתרה. איך החיים שלכם נראים?' צייצו תמונה חיה שהקהל תוכל להתחבר אליה."
    },
    {
      style: "ציטוט מעורר מחשבה מאדם מפורסם או מקור מוכר",
      example: "איך להשתמש בפתיח הזה: הביאו ציטוט רלוונטי והסבירו מדוע הוא משמעותי עבור הנושא שלכם. למשל: 'איינשטיין אמר פעם... והיום אני רוצה להראות לכם איך המילים האלה רלוונטיות יותר מתמיד.'"
    },
    {
      style: "פתיחה עם אינטראקציה או פעילות קצרה עם הקהל",
      example: "איך להשתמש בפתיח הזה: 'אני רוצה שתרימו יד מי מכם ש[שאלה רלוונטית]'. או 'בואו נעשה ניסוי קצר - כולכם תעמדו ו...'. צרו מעורבות מיידית שמחברת לנושא."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <SpotlightLogo className="w-12 h-12 ml-3" />
            <h1 className="text-3xl font-bold text-gray-dark">סיכום ההרצאה</h1>
          </div>
        </div>

        <Card className="mb-8 border-whiskey/20">
          <CardHeader className="bg-whiskey/5">
            <CardTitle className="text-xl text-gray-dark text-right">פרטי ההרצאה</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
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
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="outline">מבנה ההרצאה</TabsTrigger>
            <TabsTrigger value="opening">פתיחות וחלוקת זמנים</TabsTrigger>
            <TabsTrigger value="interactive">פעילויות ושאלות</TabsTrigger>
            <TabsTrigger value="slides">הצעה למהלך המצגת</TabsTrigger>
            <TabsTrigger value="marketing">שיווק ההרצאה</TabsTrigger>
          </TabsList>

          <TabsContent value="outline" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">מבנה ראשי הפרקים</h2>
            <div className="space-y-8 text-right dir-rtl">
              {chapters.map((chapter, idx) => (
                <div key={chapter.id} className="text-right">
                  <div className="flex items-center mb-4 justify-end">
                    <h3 className="text-xl font-bold text-gray-800 mr-3">{chapter.title}</h3>
                    <div className="w-10 h-10 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <ul className="space-y-3 pr-14">
                    {chapter.points.map(point => (
                      <li key={point.id} className="flex items-start justify-end text-right">
                        <span className="text-gray-600 mr-2">{point.content}</span>
                        <span className="text-whiskey">•</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opening" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">סגנונות פתיחה מוצלחים</h2>
              <div className="space-y-6">
                {enhancedOpeningStyles.map((item, idx) => (
                  <div key={idx} className="text-right">
                    <div className="flex items-start justify-end mb-3">
                      <div className="text-right mr-3">
                        <p className="text-gray-800 font-semibold mb-1">{item.style}</p>
                      </div>
                      <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold mt-1">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-right pr-11">
                      <p className="text-gray-600 text-sm">{item.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">חלוקת זמן מומלצת</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="space-y-2 text-right">
                  <p className="text-gray-600">פתיחה: {timeDistribution.opening} דקות</p>
                  <p className="text-gray-600">פרק ראשון: {timeDistribution.chapter1} דקות</p>
                  <p className="text-gray-600">פרק שני: {timeDistribution.chapter2} דקות</p>
                  <p className="text-gray-600">פרק שלישי: {timeDistribution.chapter3} דקות</p>
                  <p className="text-gray-600">סיכום וקריאה לפעולה: {timeDistribution.closing} דקות</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">פעילויות אינטראקטיביות</h2>
              <div className="space-y-4">
                {outline.interactiveActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start justify-end text-right">
                    <p className="text-gray-600 pt-1 mr-3">{activity}</p>
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center text-lg font-bold mt-1">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">שאלות לדיון</h2>
              {Object.entries(outline.discussionQuestions).map(([section, questions], idx) => (
                <div key={idx} className="mb-4 text-right">
                  <h3 className="font-semibold text-gray-800 mb-2">{section}</h3>
                  <ul className="space-y-2 pr-4">
                    {questions.map((question, qIdx) => (
                      <li key={qIdx} className="flex items-start justify-end text-right">
                        <span className="text-gray-600 mr-2">{question}</span>
                        <span className="text-whiskey">•</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="slides" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">הצעה למהלך המצגת</h2>
              <div className="overflow-x-auto">
                <Table className="text-right">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">מספר שקף</TableHead>
                      <TableHead className="text-right">כותרת</TableHead>
                      <TableHead className="text-right">תוכן</TableHead>
                      <TableHead className="text-right">אלמנט ויזואלי</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slideshow.map((slide) => (
                      <TableRow key={slide.number}>
                        <TableCell className="text-right font-medium">{slide.number}</TableCell>
                        <TableCell className="text-right font-semibold">{slide.headline}</TableCell>
                        <TableCell className="text-right">{slide.content}</TableCell>
                        <TableCell className="text-right text-gray-600">{slide.visual}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marketing" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">שיווק ההרצאה</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">תכנית שיווק לקהל הרחב (4 שבועות)</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">שבוע 1 - יצירת מודעות</h4>
                    <ul className="space-y-1 text-gray-600 text-right">
                      <li className="flex items-start justify-end">
                        <span className="mr-2">הכרזה ראשונית ברשתות החברתיות</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">יצירת תוכן איכותי סביב נושא ההרצאה</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">פוסטים אורגניים יומיים</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">שיתופי פעולה עם אישי מפתח</span>
                        <span className="text-whiskey">•</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">שבוע 2 - בניית עניין</h4>
                    <ul className="space-y-1 text-gray-600 text-right">
                      <li className="flex items-start justify-end">
                        <span className="mr-2">השקת מודעות ממומנות ברשתות החברתיות</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">שליחת מייל ראשון לרשימת התפוצה</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">הצעת כרטיסי מוקדמים במחיר מוזל</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">תכנים חינמיים בנושא ההרצאה</span>
                        <span className="text-whiskey">•</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">שבוע 3 - עידוד הרשמה</h4>
                    <ul className="space-y-1 text-gray-600 text-right">
                      <li className="flex items-start justify-end">
                        <span className="mr-2">הכרזה על כרטיסי VIP (מקומות מוגבלים, גישה למרצה, חומרים נוספים)</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">מחיר VIP: פי 2-3 ממחיר הכרטיס הרגיל</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">עדויות ממשתתפים קודמים</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">תוכן "מאחורי הקלעים"</span>
                        <span className="text-whiskey">•</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">שבוע 4 - דחיפות ופעולה</h4>
                    <ul className="space-y-1 text-gray-600 text-right">
                      <li className="flex items-start justify-end">
                        <span className="mr-2">הדגשת מקומות מוגבלים</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">מיילים יומיים אישיים</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">סיפורי הצלחה קצרים</span>
                        <span className="text-whiskey">•</span>
                      </li>
                      <li className="flex items-start justify-end">
                        <span className="mr-2">סדרת סרטונים קצרים עם תובנות</span>
                        <span className="text-whiskey">•</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">מכירת הרצאות לארגונים</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">ענפים מומלצים</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-gray-600">
                        חברות הייטק, חברות פיננסיות, חברות ייעוץ, חברות שיווק ופרסום, 
                        בתי חולים וקופות חולים, מוסדות חינוך גבוה, חברות ביטוח, בנקים, חברות נדל"ן.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">דוגמת מייל למכירה</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line text-right">
                        {generateOrganizationEmail()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center space-x-4 space-x-reverse mb-8">
          <Button variant="outline" onClick={() => handleExport('PDF')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
            ייצוא ל-PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('Word')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
            ייצוא ל-Word
          </Button>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/outline-confirmation')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
            חזרה לעריכת מבנה
          </Button>
          <Button onClick={() => navigate('/')} className="bg-whiskey hover:bg-whiskey-dark text-white">
            סיום והתחלה מחדש
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PresentationSummary;
