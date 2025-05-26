
import { supabase } from '@/integrations/supabase/client';

// Helper functions to work around TypeScript limitations with new tables
// These use RPC functions to bypass type checking for newly created tables

export const getUserProfile = async (userRegistrationId: string) => {
  const { data, error } = await supabase
    .rpc('get_user_profile', { user_registration_id: userRegistrationId });
  
  if (error) throw error;
  return data;
};

export const getUserPresentations = async (userRegistrationId: string) => {
  const { data, error } = await supabase
    .rpc('get_user_presentations', { user_registration_id: userRegistrationId });
  
  if (error) throw error;
  return data;
};

export const upsertUserProfile = async (userRegistrationId: string, avatarUrl: string, bio?: string) => {
  const { data, error } = await supabase
    .rpc('upsert_user_profile', { 
      user_registration_id: userRegistrationId,
      new_avatar_url: avatarUrl,
      new_bio: bio 
    });
  
  if (error) throw error;
  return data;
};

export const createUserPresentation = async (userRegistrationId: string, title: string, content: any) => {
  const { data, error } = await supabase
    .rpc('create_user_presentation', {
      user_registration_id: userRegistrationId,
      presentation_title: title,
      presentation_content: content
    });
  
  if (error) throw error;
  return data;
};

export const incrementVerificationAttempts = async (email: string) => {
  const { data, error } = await supabase
    .rpc('increment_verification_attempts', { verification_email: email });
  
  if (error) throw error;
  return data;
};
