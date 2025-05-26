
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile, getUserPresentations, upsertUserProfile } from '@/utils/supabaseHelpers';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Loader2, Upload, Download, User, FileText } from 'lucide-react';

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

interface UserPresentation {
  id: string;
  title: string;
  content: any;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRegistration, setUserRegistration] = useState<UserRegistration | null>(null);
  const [presentations, setPresentations] = useState<UserPresentation[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/register');
      return;
    }

    if (user) {
      loadUserData();
      loadPresentations();
    }
  }, [user, authLoading, navigate]);

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

      // Load user profile data using helper function
      const profileData = await getUserProfile(regData.id);
      if (profileData && Array.isArray(profileData) && profileData.length > 0) {
        // Safely check if the data has the expected structure
        const profile = profileData[0];
        if (profile && typeof profile === 'object' && 'user_id' in profile) {
          setUserProfile(profile as UserProfile);
        }
      }

    } catch (error: any) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPresentations = async () => {
    if (!user) return;

    try {
      const { data: regData } = await supabase
        .from('user_registrations')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!regData) return;

      // Load presentations using helper function
      const presentationsData = await getUserPresentations(regData.id);
      if (Array.isArray(presentationsData)) {
        // Filter and validate the data structure
        const validPresentations = presentationsData.filter(
          (item): item is UserPresentation => 
            item !== null && 
            typeof item === 'object' && 
            'id' in item &&
            'title' in item && 
            'content' in item && 
            'created_at' in item
        );
        setPresentations(validPresentations);
      }

    } catch (error: any) {
      console.error('Error loading presentations:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userRegistration) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userRegistration.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures' as any)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures' as any)
        .getPublicUrl(fileName);

      // Update profile using helper function
      await upsertUserProfile(userRegistration.id, publicUrl);

      setUserProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : {
        id: '',
        user_id: userRegistration.id,
        avatar_url: publicUrl,
        bio: null
      });

      toast({
        title: "תמונה הועלתה בהצלחה",
        description: "תמונת הפרופיל שלך עודכנה",
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "שגיאה בהעלאת התמונה",
        description: "לא ניתן לעדכן את תמונת הפרופיל",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const generatePDF = async (presentation: UserPresentation) => {
    // This would integrate with a PDF generation service
    // For now, we'll just show a toast
    toast({
      title: "יצירת PDF",
      description: "התכונה תהיה זמינה בקרוב",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-whiskey" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dir-rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <SpotlightLogo className="w-12 h-12 ml-3" />
          <h1 className="text-3xl font-bold text-gray-dark">הפרופיל שלי</h1>
        </div>

        {/* User Profile Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-right">פרטים אישיים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 space-x-reverse mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userProfile?.avatar_url || ''} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-whiskey text-white p-2 rounded-full cursor-pointer hover:bg-whiskey-dark">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-right">
                <h2 className="text-2xl font-bold text-gray-800">
                  {userRegistration?.first_name} {userRegistration?.last_name}
                </h2>
                <p className="text-gray-600">{userRegistration?.email}</p>
                <p className="text-gray-600">{userRegistration?.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presentations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-right flex items-center">
              <FileText className="w-6 h-6 ml-2" />
              ההרצאות שלי ({presentations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {presentations.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">עדיין לא יצרת הרצאות</p>
                <Button
                  onClick={() => navigate('/create')}
                  className="bg-whiskey hover:bg-whiskey-dark text-white"
                >
                  צור הרצאה ראשונה
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {presentations.map((presentation) => (
                  <div
                    key={presentation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 text-right">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          {presentation.title || 'ללא כותרת'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {typeof presentation.content === 'object' 
                            ? JSON.stringify(presentation.content).substring(0, 100)
                            : String(presentation.content || '').substring(0, 100)}...
                        </p>
                        <p className="text-gray-500 text-xs">
                          נוצר ב: {presentation.created_at ? new Date(presentation.created_at).toLocaleDateString('he-IL') : 'תאריך לא זמין'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generatePDF(presentation)}
                          className="border-whiskey text-whiskey hover:bg-whiskey/10"
                        >
                          <Download className="w-4 h-4 ml-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-whiskey text-whiskey hover:bg-whiskey/10"
          >
            חזרה לעמוד הבית
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
