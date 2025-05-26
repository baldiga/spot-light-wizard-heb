
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Mock authentication for email-verified users
  useEffect(() => {
    const checkEmailVerification = async () => {
      // This is a simplified auth check - in production you'd want proper Supabase auth
      const email = localStorage.getItem('verified_email');
      if (email && !user) {
        // Create a mock user object for verified emails
        const mockUser = {
          id: email,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {}
        } as User;
        
        setUser(mockUser);
        setLoading(false);
      }
    };

    if (!session && !user) {
      checkEmailVerification();
    }
  }, [session, user]);

  return { user, session, loading };
};
