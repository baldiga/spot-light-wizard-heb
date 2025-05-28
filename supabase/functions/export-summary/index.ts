
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  recipientEmail: string;
  summaryData: {
    formData: any;
    chapters: any[];
    outline: any;
    dynamicSlides: any[];
    dynamicStrategy: any;
    engagementData: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { recipientEmail, summaryData }: ExportRequest = await req.json();

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { formData, chapters, outline, dynamicSlides, dynamicStrategy, engagementData } = summaryData;

    // Create comprehensive HTML email
    const htmlContent = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #D97706; text-align: center; margin-bottom: 30px;">סיכום מלא של ההרצאה</h1>
          
          <!-- Overview Section -->
          <section style="margin-bottom: 40px;">
            <h2 style="color: #374151; border-bottom: 2px solid #D97706; padding-bottom: 10px;">סקירה כללית</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 15px;">
              <p><strong>נושא ההרצאה:</strong> ${formData?.idea || 'לא צוין'}</p>
              <p><strong>משך ההרצאה:</strong> ${formData?.duration || 'לא צוין'} דקות</p>
              <p><strong>קהל יעד:</strong> ${formData?.audienceProfile || 'לא צוין'}</p>
              <p><strong>רקע המרצה:</strong> ${formData?.speakerBackground || 'לא צוין'}</p>
              <p><strong>מוצר/שירות:</strong> ${formData?.serviceOrProduct || 'לא צוין'}</p>
              <p><strong>קריאה לפעולה:</strong> ${formData?.callToAction || 'לא צוין'}</p>
            </div>
          </section>

          <!-- Structure Section -->
          <section style="margin-bottom: 40px;">
            <h2 style="color: #374151; border-bottom: 2px solid #D97706; padding-bottom: 10px;">מבנה ההרצאה (4 פרקים)</h2>
            ${chapters.slice(0, 4).map((chapter, index) => `
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #D97706;">
                <h3 style="color: #1f2937; margin-bottom: 10px;">פרק ${index + 1}: ${chapter.title}</h3>
                <ul style="margin: 0; padding-right: 20px;">
                  ${chapter.points.map(point => `<li style="margin-bottom: 5px;">${point.content}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </section>

          <!-- Slides Section -->
          <section style="margin-bottom: 40px;">
            <h2 style="color: #374151; border-bottom: 2px solid #D97706; padding-bottom: 10px;">מבנה שקפים מפורט</h2>
            <p style="margin-bottom: 15px;"><strong>סה"כ ${dynamicSlides?.length || 0} שקפים</strong></p>
            ${dynamicSlides?.slice(0, 10).map((slide, index) => `
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #D97706;">
                <h4 style="color: #1f2937; margin-bottom: 10px;">שקף ${index + 1}: ${slide?.headline || `שקף ${index + 1}`}</h4>
                <p><strong>תוכן:</strong> ${slide?.content || 'תוכן השקף'}</p>
                <p><strong>ויזואל:</strong> ${slide?.visual || 'תיאור ויזואלי'}</p>
                ${slide?.notes ? `<p><strong>הערות למרצה:</strong> ${slide.notes}</p>` : ''}
                ${slide?.engagementTip ? `<p><strong>טיפ למעורבות:</strong> ${slide.engagementTip}</p>` : ''}
              </div>
            `).join('') || '<p>מבנה השקפים בתהליך יצירה...</p>'}
          </section>

          <!-- Sales Process Section -->
          <section style="margin-bottom: 40px;">
            <h2 style="color: #374151; border-bottom: 2px solid #D97706; padding-bottom: 10px;">מהלך מכירה בהרצאה (10 שלבים)</h2>
            ${outline?.salesProcess?.slice(0, 10).map((step, index) => `
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #D97706;">
                <h4 style="color: #1f2937; margin-bottom: 10px;">שלב ${index + 1}: ${step.title}</h4>
                <p>${step.description}</p>
              </div>
            `).join('') || '<p>לא נוצר מהלך מכירה עבור הרצאה זו</p>'}
          </section>

          <!-- Opening Tools Section -->
          <section style="margin-bottom: 40px;">
            <h2 style="color: #374151; border-bottom: 2px solid #D97706; padding-bottom: 10px;">רעיונות לפתיחת ההרצאה</h2>
            ${outline?.openingStyles?.map((style, index) => `
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; border-right: 4px solid #D97706;">
                <p><strong>רעיון ${index + 1}:</strong> ${typeof style === 'string' ? style : JSON.stringify(style)}</p>
              </div>
            `).join('') || '<p>לא נוצרו רעיונות לפתיחה</p>'}
          </section>

          <!-- Engagement Section -->
          <section style="margin-bottom: 40px;">
            <h2 style="color: #374151; border-bottom: 2px solid #D97706; padding-bottom: 10px;">כלי מעורבות אינטראקטיביים</h2>
            ${engagementData ? `
              ${engagementData.interactiveActivities ? `
                <h3 style="color: #1f2937; margin-bottom: 10px;">פעילויות אינטראקטיביות:</h3>
                ${engagementData.interactiveActivities.map((activity, index) => `
                  <div style="background-color: #dbeafe; padding: 10px; border-radius: 6px; margin: 10px 0;">
                    <p>${typeof activity === 'string' ? activity : JSON.stringify(activity)}</p>
                  </div>
                `).join('')}
              ` : ''}
              
              ${engagementData.discussionQuestions ? `
                <h3 style="color: #1f2937; margin-bottom: 10px;">שאלות לדיון:</h3>
                ${Object.entries(engagementData.discussionQuestions).map(([chapter, questions]) => `
                  <div style="margin-bottom: 15px;">
                    <h4 style="color: #374151;">${chapter}</h4>
                    ${Array.isArray(questions) ? questions.map(question => `
                      <div style="background-color: #dcfce7; padding: 8px; border-radius: 4px; margin: 5px 0;">
                        <p>${typeof question === 'string' ? question : JSON.stringify(question)}</p>
                      </div>
                    `).join('') : ''}
                  </div>
                `).join('')}
              ` : ''}
            ` : '<p>תוכן מעורבות בתהליך יצירה...</p>'}
          </section>

          <!-- Marketing Strategy Section -->
          <section style="margin-bottom: 40px;">
            <h2 style="color: #374151; border-bottom: 2px solid #D97706; padding-bottom: 10px;">אסטרטגיית שיווק ומכירות</h2>
            ${dynamicStrategy ? `
              ${dynamicStrategy.fourWeekPlan ? `
                <h3 style="color: #1f2937; margin-bottom: 10px;">תוכנית 4 שבועות:</h3>
                ${Object.entries(dynamicStrategy.fourWeekPlan).map(([week, data]) => `
                  <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4 style="color: #1e40af;">${week}</h4>
                    ${data.goals ? `<ul>${data.goals.map(goal => `<li>${goal}</li>`).join('')}</ul>` : ''}
                  </div>
                `).join('')}
              ` : ''}
              
              ${dynamicStrategy.targetAudiences ? `
                <h3 style="color: #1f2937; margin-bottom: 10px;">קהלי יעד:</h3>
                ${dynamicStrategy.targetAudiences.map(audience => `
                  <div style="background-color: #dbeafe; padding: 10px; border-radius: 6px; margin: 8px 0;">
                    <p>${audience}</p>
                  </div>
                `).join('')}
              ` : ''}
              
              ${dynamicStrategy.marketingChannels ? `
                <h3 style="color: #1f2937; margin-bottom: 10px;">ערוצי שיווק:</h3>
                ${dynamicStrategy.marketingChannels.map(channel => `
                  <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <h4 style="color: #166534;">${channel?.channel || 'ערוץ שיווק'}</h4>
                    <p><strong>אסטרטגיה:</strong> ${channel?.strategy || ''}</p>
                    <p><strong>לוח זמנים:</strong> ${channel?.timeline || ''}</p>
                    <p><strong>תקציב:</strong> ${channel?.budget || ''}</p>
                  </div>
                `).join('')}
              ` : ''}
            ` : '<p>אסטרטגיית השיווק בתהליך יצירה...</p>'}
          </section>

          <!-- Contact Section -->
          <div style="background-color: #22c55e; padding: 20px; border-radius: 10px; text-align: center; margin-top: 40px;">
            <h3 style="color: white; margin-bottom: 15px;">צריכים עזרה מקצועית?</h3>
            <p style="color: white; margin-bottom: 20px;">לייעוץ ראשוני חינם ושדרוג ההרצאה שלכם</p>
            <a href="https://wa.link/47lii7" target="_blank" style="background-color: white; color: #22c55e; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              יצירת קשר וייעוץ ראשוני חינם
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              הרצאה זו נוצרה באמצעות מערכת Spotlight AI<br>
              תודה שבחרתם בנו לפיתוח ההרצאה שלכם!
            </p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Spotlight <noreply@verify.amirbaldiga.com>",
      to: [recipientEmail],
      subject: `סיכום ההרצאה: ${formData?.idea || 'ההרצאה שלך'}`,
      html: htmlContent,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      throw new Error("Failed to send email");
    }

    console.log("Summary email sent successfully:", emailResponse);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Summary email sent successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in export-summary function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
