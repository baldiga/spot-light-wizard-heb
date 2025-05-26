
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogOut, FileText, Calendar, Clock } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
}

interface Presentation {
  id: string;
  title: string;
  topic: string;
  audience: string;
  duration: number;
  created_at: string;
  outline?: {
    chapters?: Array<{
      title?: string;
      duration?: number;
      summary?: string;
      key_points?: string[];
    }>;
  };
}

const Profile = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.email) throw new Error('No user email');
      
      const { data, error } = await supabase
        .from('user_registrations')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.email,
  });

  const { data: presentations, isLoading: presentationsLoading } = useQuery({
    queryKey: ['presentations', user?.id],
    queryFn: async () => {
      // For now, return empty array since we don't have presentations table
      return [] as Presentation[];
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('verified_user_email');
    navigate('/');
  };

  if (!user) {
    navigate('/register');
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-whiskey" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">לא נמצא פרופיל</h2>
          <Button onClick={() => navigate('/register')} className="bg-whiskey hover:bg-whiskey-dark">
            חזרה לרישום
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">הפרופיל שלי</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>התנתק</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">פרטים אישיים</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.first_name} />
                  <AvatarFallback className="text-lg">
                    {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-gray-600 mb-1">{profile.email}</p>
                <p className="text-gray-600 mb-4">{profile.phone}</p>
                <p className="text-sm text-gray-500">
                  חבר מאז: {new Date(profile.created_at).toLocaleDateString('he-IL')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Presentations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>ההרצאות שלי</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {presentationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-whiskey" />
                  </div>
                ) : presentations && presentations.length > 0 ? (
                  <div className="space-y-4">
                    {presentations.map((item) => (
                      <div key={item?.id || 'unknown'} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{item?.title || 'ללא כותרת'}</h3>
                          <span className="text-sm text-gray-500">
                            {item?.created_at ? new Date(item.created_at).toLocaleDateString('he-IL') : 'תאריך לא ידוע'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{item?.topic || 'ללא נושא'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{item?.audience || 'ללא קהל יעד'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{item?.duration || 0} דקות</span>
                          </div>
                        </div>
                        {item?.outline?.chapters && item.outline.chapters.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">פרקים:</p>
                            <div className="space-y-1">
                              {item.outline.chapters.map((chapter, index) => (
                                <div key={index} className="text-sm text-gray-600">
                                  • {chapter?.title || `פרק ${index + 1}`} ({chapter?.duration || 0} דקות)
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">אין הרצאות עדיין</h3>
                    <p className="text-gray-600 mb-4">צור את ההרצאה הראשונה שלך</p>
                    <Button
                      onClick={() => navigate('/create')}
                      className="bg-whiskey hover:bg-whiskey-dark text-white"
                    >
                      צור הרצאה חדשה
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>פעולות מהירות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => navigate('/create')}
                  className="bg-whiskey hover:bg-whiskey-dark text-white"
                >
                  צור הרצאה חדשה
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                >
                  חזרה לעמוד הבית
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
