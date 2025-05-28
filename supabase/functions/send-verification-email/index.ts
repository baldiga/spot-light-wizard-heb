
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
}

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
    const { email }: VerificationRequest = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limiting (exclude amirbaldiga@gmail.com)
    if (email !== 'amirbaldiga@gmail.com') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const { data: recentVerification, error: checkError } = await supabase
        .from('email_verifications')
        .select('last_sent_at')
        .eq('email', email)
        .gte('last_sent_at', twentyFourHoursAgo.toISOString())
        .order('last_sent_at', { ascending: false })
        .limit(1);

      if (checkError) {
        console.error('Error checking rate limit:', checkError);
      } else if (recentVerification && recentVerification.length > 0) {
        const lastSentAt = new Date(recentVerification[0].last_sent_at);
        const nextAllowedTime = new Date(lastSentAt.getTime() + 24 * 60 * 60 * 1000);
        const remainingTime = nextAllowedTime.getTime() - Date.now();
        
        if (remainingTime > 0) {
          return new Response(JSON.stringify({ 
            error: "Rate limit exceeded", 
            rateLimited: true,
            remainingTime: remainingTime,
            nextAllowedTime: nextAllowedTime.toISOString()
          }), {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }
    }

    const code = generateVerificationCode();
    const currentTime = new Date().toISOString();
    
    console.log(`Sending verification code ${code} to ${email}`);

    // Send the verification email using verified domain
    const emailResponse = await resend.emails.send({
      from: "Spotlight <noreply@verify.amirbaldiga.com>",
      to: [email],
      subject: "קוד אימות - Spotlight",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #D97706; text-align: center;">קוד אימות</h1>
          <p style="font-size: 16px; line-height: 1.6;">
            שלום,
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            קיבלת הודעה זו כי ביקשת לאמת את כתובת האימייל שלך במערכת Spotlight.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">קוד האימות שלך:</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #D97706; letter-spacing: 4px;">${code}</p>
            </div>
          </div>
          <p style="font-size: 16px; line-height: 1.6;">
            הזן קוד זה בדף האינטרנט כדי להמשיך. הקוד תקף למשך 10 דקות.
          </p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            אם לא ביקשת קוד זה, אנא התעלם מהודעה זו.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      throw new Error("Failed to send email");
    }

    console.log("Verification email sent successfully:", emailResponse);

    // Store the verification record with last_sent_at timestamp
    const { error: insertError } = await supabase
      .from('email_verifications')
      .insert({
        email: email,
        code: code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        last_sent_at: currentTime,
        used: false
      });

    if (insertError) {
      console.error('Error storing verification code:', insertError);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Verification code sent successfully",
      // In production, don't return the code - this is for demo purposes
      code: code 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
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
