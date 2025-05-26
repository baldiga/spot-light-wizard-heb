
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  firstName: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, code }: VerificationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Spotlight <onboarding@resend.dev>",
      to: [email],
      subject: "אימות כתובת המייל שלך - Spotlight",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #D2691E; text-align: center;">ברוכים הבאים ל-Spotlight!</h1>
          <p>שלום ${firstName},</p>
          <p>תודה שנרשמת ל-Spotlight. כדי להשלים את תהליך הרישום, אנא אמת את כתובת המייל שלך.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f4f4f4; border: 2px solid #D2691E; border-radius: 8px; padding: 20px; display: inline-block;">
              <h2 style="margin: 0; color: #D2691E; font-size: 32px; letter-spacing: 4px;">${code}</h2>
            </div>
          </div>
          <p>הזן את הקוד הזה בעמוד האימות כדי להשלים את הרישום.</p>
          <p>הקוד תקף ל-10 דקות בלבד.</p>
          <p>אם לא ביקשת לקבל מייל זה, אנא התעלם ממנו.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            המייל הזה נשלח מ-Spotlight, פלטפורמת יצירת המצגות החכמה.
          </p>
        </div>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
