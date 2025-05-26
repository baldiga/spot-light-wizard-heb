
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

const UserHeader = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_registrations')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const handleAuthAction = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/register');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {user && profile ? (
        <Button
          variant="ghost"
          onClick={handleAuthAction}
          className="flex items-center space-x-2 hover:bg-gray-100"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.first_name} />
            <AvatarFallback>
              {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {profile.first_name} {profile.last_name}
          </span>
        </Button>
      ) : (
        <Button
          onClick={handleAuthAction}
          className="bg-whiskey hover:bg-whiskey-dark text-white"
        >
          התחבר / הירשם
        </Button>
      )}
    </div>
  );
};

export default UserHeader;
