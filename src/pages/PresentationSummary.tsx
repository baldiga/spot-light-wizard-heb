
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePresentationStore } from '@/store/presentationStore';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PresentationSummary = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, outline, chapters } = usePresentationStore();

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
    const duration = parseInt(formData.duration);
    return {
      opening: Math.round(duration * 0.1),
      chapter1: Math.round(duration * 0.25),
      chapter2: Math.round(duration * 0.35),
      chapter3: Math.round(duration * 0.2),
      closing: Math.round(duration * 0.1)
    };
  };

  const timeDistribution = calculateTimeDistribution();

  const generateSlideshow = () => {
    const slides = [
      { number: 1, headline: "שקף פתיחה", content: "כותרת ההרצאה, שם המרצה ותפקידו", visual: "לוגו או תמונה רלוונטית" },
      { number: 2, headline: "הצגה עצמית", content: "רקע המרצה, הישגים והתמחות", visual: "תמונה אישית או הישגים" },
      { number: 3, headline: "מבנה ההרצאה", content: "סקירת הנושאים שיוצגו", visual: "תוכן עניינים ויזואלי" },
      { number: 4, headline: "פתיחה מעוררת עניין", content: "סיפור, עובדה מפתיעה או שאלה רטורית", visual: "גרף או תמונה תומכת" },
    ];

    chapters.forEach((chapter, idx) => {
      slides.push({
        number: slides.length + 1,
        headline: `${chapter.title} - כותרת`,
        content: `הצגת הנושא: ${chapter.title}`,
        visual: "אייקון או תמונה רלוונטית"
      });
      
      chapter.points.forEach((point, pointIdx) => {
        slides.push({
          number: slides.length + 1,
          headline: `${chapter.title} - נקודה ${pointIdx + 1}`,
          content: point.content,
          visual: "תרשים, גרף או דוגמה"
        });
      });
    });

    slides.push(
      { number: slides.length + 1, headline: "הדגמת המוצר/שירות", content: "הצגה חיה או תיאור מפורט", visual: "צילום מסך או דגמה" },
      { number: slides.length + 2, headline: "עדויות לקוחות", content: "המלצות והצלחות", visual: "תמונות לקוחות וציטוטים" },
      { number: slides.length + 3, headline: "סיכום נקודות מפתח", content: "3-5 הנקודות החשובות ביותר", visual: "רשימה או אינפוגרפיקה" },
      { number: slides.length + 4, headline: "קריאה לפעולה", content: formData.callToAction, visual: "פרטי יצירת קשר וקישורים" }
    );

    return slides;
  };

  const slideshow = generateSlideshow();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex items-center mb-4 sm:mb-0">
            <SpotlightLogo className="w-12 h-12 ml-3" />
            <h1 className="text-3xl font-bold text-gray-dark">סיכום ההרצאה</h1>
          </div>
          <div className="flex space-x-4 space-x-reverse">
            <Button variant="outline" onClick={() => handleExport('PDF')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
              ייצוא ל-PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport('Word')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
              ייצוא ל-Word
            </Button>
            <Button variant="outline" onClick={() => handleExport('Markdown')} className="border-whiskey text-whiskey hover:bg-whiskey/10">
              ייצוא ל-Markdown
            </Button>
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
            <div className="space-y-8 text-right">
              {chapters.map((chapter, idx) => (
                <div key={chapter.id}>
                  <div className="flex items-center mb-4 justify-start">
                    <div className="w-10 h-10 rounded-full bg-whiskey text-white flex items-center justify-center ml-3 text-lg font-bold">
                      {idx + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{chapter.title}</h3>
                  </div>
                  <ul className="space-y-3 pr-14">
                    {chapter.points.map(point => (
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
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">סגנונות פתיחה מוצלחים</h2>
              <ul className="space-y-4">
                {outline.openingStyles.map((style, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center ml-3 text-lg font-bold mt-1">
                      {idx + 1}
                    </div>
                    <p className="text-gray-600 pt-1">{style}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">חלוקת זמן מומלצת</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="space-y-2">
                  <p className="text-gray-600">פתיחה: {timeDistribution.opening} דקות (10%)</p>
                  <p className="text-gray-600">פרק ראשון: {timeDistribution.chapter1} דקות (25%)</p>
                  <p className="text-gray-600">פרק שני: {timeDistribution.chapter2} דקות (35%)</p>
                  <p className="text-gray-600">פרק שלישי: {timeDistribution.chapter3} דקות (20%)</p>
                  <p className="text-gray-600">סיכום וקריאה לפעולה: {timeDistribution.closing} דקות (10%)</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interactive" className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="mb-8 text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">פעילויות אינטראקטיביות</h2>
              <ul className="space-y-4">
                {outline.interactiveActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="min-w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center ml-3 text-lg font-bold mt-1">
                      {idx + 1}
                    </div>
                    <p className="text-gray-600 pt-1">{activity}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="my-6" />

            <div className="text-right">
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
                    <ul className="space-y-1 text-gray-600">
                      <li>• הכרזה ראשונית ברשתות החברתיות</li>
                      <li>• יצירת תוכן איכותי סביב נושא ההרצאה</li>
                      <li>• פוסטים אורגניים יומיים</li>
                      <li>• שיתופי פעולה עם אישי מפתח</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">שבוע 2 - בניית עניין</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• השקת מודעות ממומנות ברשתות החברתיות</li>
                      <li>• שליחת מייל ראשון לרשימת התפוצה</li>
                      <li>• הצעת כרטיסי מוקדמים במחיר מוזל</li>
                      <li>• תכנים חינמיים בנושא ההרצאה</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">שבוע 3 - עידוד הרשמה</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• הכרזה על כרטיסי VIP (מקומות מוגבלים, גישה למרצה, חומרים נוספים)</li>
                      <li>• מחיר VIP: פי 2-3 ממחיר הכרטיס הרגיל</li>
                      <li>• עדויות ממשתתפים קודמים</li>
                      <li>• תוכן "מאחורי הקלעים"</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">שבוע 4 - דחיפות ופעולה</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• הדגשת מקומות מוגבלים</li>
                      <li>• מיילים יומיים אישיים</li>
                      <li>• סיפורי הצלחה קצרים</li>
                      <li>• סדרת סרטונים קצרים עם תובנות</li>
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
                      <div className="text-gray-600 leading-relaxed">
                        <p className="mb-3">נושא: הזדמנות לחיזוק הצוות שלכם - {formData.idea}</p>
                        <p className="mb-3">שלום [שם איש קשר],</p>
                        <p className="mb-3">
                          ראיתי את הפעילות המרשימה של {"{שם החברה}"} ב{"{תחום רלוונטי}"} והייתי רוצה להציע הרצאה ייחודית 
                          שיכולה לתרום לצוות שלכם.
                        </p>
                        <p className="mb-3">
                          ההרצאה "{formData.idea}" מיועדת ל{formData.audienceProfile} ותעניק לצוות שלכם כלים מעשיים 
                          ב{formData.serviceOrProduct}.
                        </p>
                        <p className="mb-3">רקע שלי: {formData.speakerBackground}</p>
                        <p className="mb-3">
                          ההרצאה נמשכת {formData.duration} דקות ויכולה להתקיים במשרדיכם או באולם אירועים לבחירתכם.
                        </p>
                        <p className="mb-3">
                          אשמח לקבוע פגישה קצרה כדי להציג את התוכנית המלאה ולהבין את הצרכים הספציפיים שלכם.
                        </p>
                        <p>בברכה,<br/>[השם שלך]<br/>[פרטי יצירת קשר]</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
