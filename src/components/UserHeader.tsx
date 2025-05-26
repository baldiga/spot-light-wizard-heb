
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/utils/supabaseHelpers';
import { User, LogOut } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  bio: string | null;
}

interface UserRegistration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const UserHeader = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRegistration, setUserRegistration] = useState<UserRegistration | null>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user registration data
      const { data: regData, error: regError } = await supabase
        .from('user_registrations')
        .select('*')
        .eq('email', user.email)
        .single();

      if (regError) throw regError;
      setUserRegistration(regData);

      // Load user profile data
      const profileData = await getUserProfile(regData.id);
      if (profileData && Array.isArray(profileData) && profileData.length > 0) {
        const profile = profileData[0];
        if (profile && typeof profile === 'object' && 'user_id' in profile) {
          setUserProfile(profile as UserProfile);
        }
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('verified_email');
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Button
        onClick={() => navigate('/register')}
        className="bg-whiskey hover:bg-whiskey-dark text-white"
        size="sm"
      >
        <User className="w-4 h-4 ml-1" />
        הירשם / התחבר
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-3 space-x-reverse">
      <div className="flex items-center space-x-2 space-x-reverse">
        <Avatar className="w-8 h-8">
          <AvatarImage src={userProfile?.avatar_url || ''} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">
            {userRegistration?.first_name} {userRegistration?.last_name}
          </p>
        </div>
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="border-gray-300 text-gray-600 hover:bg-gray-50"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default UserHeader;
