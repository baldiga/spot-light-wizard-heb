
import { supabase } from '@/integrations/supabase/client';

// Helper functions to work around TypeScript limitations with new tables
// These use direct table queries since RPC functions don't exist yet

export const getUserProfile = async (userRegistrationId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles' as any)
      .select('*')
      .eq('user_id', userRegistrationId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getUserPresentations = async (userRegistrationId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_presentations' as any)
      .select('*')
      .eq('user_id', userRegistrationId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user presentations:', error);
    return [];
  }
};

export const upsertUserProfile = async (userRegistrationId: string, avatarUrl: string, bio?: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles' as any)
      .upsert({ 
        user_id: userRegistrationId,
        avatar_url: avatarUrl,
        bio: bio 
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting user profile:', error);
    throw error;
  }
};

export const createUserPresentation = async (userRegistrationId: string, title: string, content: any) => {
  try {
    const { data, error } = await supabase
      .from('user_presentations' as any)
      .insert({
        user_id: userRegistrationId,
        title: title,
        content: content
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user presentation:', error);
    throw error;
  }
};

export const incrementVerificationAttempts = async (email: string) => {
  try {
    // Check current attempts
    const { data: existing, error: fetchError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    if (existing && existing.length > 0) {
      // Update existing record
      const { data, error } = await supabase
        .from('email_verifications')
        .update({ 
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        })
        .eq('id', existing[0].id);
      
      if (error) throw error;
      return data;
    } else {
      // Create new record
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const { data, error } = await supabase
        .from('email_verifications')
        .insert({
          email: email,
          code: verificationCode,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        });
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error incrementing verification attempts:', error);
    throw error;
  }
};
