
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentationStore } from '@/store/presentationStore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SpotlightLogo from '@/components/SpotlightLogo';
import { Loader2 } from 'lucide-react';

const ProcessingOutline = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { formData, generateOutlineFromAPI, isLoading } = usePresentationStore();

  useEffect(() => {
    // If not authenticated, redirect to register
    if (!authLoading && !user) {
      navigate('/register');
      return;
    }

    // If no form data, redirect to create
    if (!formData) {
      toast({
        title: "מידע חסר",
        description: "אנא מלא את טופס פרטי ההרצאה תחילה",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // If authenticated and has form data, generate outline
    if (user && formData) {
      const generateOutline = async () => {
        try {
          await generateOutlineFromAPI();
          navigate('/outline-confirmation');
        } catch (error) {
          console.error('Failed to generate outline:', error);
          navigate('/outline-confirmation'); // Still go to confirmation even if API fails
        }
      };
      
      generateOutline();
    }
  }, [user, authLoading, formData, navigate, toast, generateOutlineFromAPI]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dir-rtl">
      <SpotlightLogo className="w-16 h-16 mb-6" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">יוצרים את מבנה ההרצאה...</h2>
      <p className="text-gray-600 mb-6">אנו מעבדים את המידע שהזנת כדי ליצור מבנה מותאם אישית</p>
      <div className="flex items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-whiskey" />
        <span className="text-whiskey font-medium">אנא המתן...</span>
      </div>
    </div>
  );
};

export default ProcessingOutline;
