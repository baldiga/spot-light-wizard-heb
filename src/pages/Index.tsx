
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import SpotlightLogo from '@/components/SpotlightLogo';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-2xl w-full text-center space-y-8">
        <SpotlightLogo className="w-24 h-24 mx-auto mb-4" />
        
        <h1 className="text-4xl font-bold text-gray-900">
          <span className="text-whiskey">Spotlight</span> - התכונן להרצאה המושלמת
        </h1>
        
        <p className="text-xl text-gray-700 max-w-lg mx-auto">
          כלי שעוזר לך לבנות מבנה מושלם להרצאה שלך, כולל סגנונות פתיחה, פעילויות אינטראקטיביות, ואסטרטגיית שיווק מנצחת
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold mb-3 text-gray-dark">תכנון מובנה</h3>
            <p className="text-gray-600">בנה תכנית הרצאה עם פרקים וסעיפים מאורגנים היטב</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold mb-3 text-gray-dark">תוכן מותאם אישית</h3>
            <p className="text-gray-600">התאמה מדויקת לקהל היעד, לרקע שלך ולמטרות העסקיות</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold mb-3 text-gray-dark">אסטרטגיית שיווק</h3>
            <p className="text-gray-600">הטמעת המוצר/שירות שלך בצורה אורגנית עם קריאה ברורה לפעולה</p>
          </div>
        </div>
        
        <Button 
          className="px-8 py-6 text-lg bg-whiskey hover:bg-whiskey-dark text-white shadow-lg transition-all duration-300"
          onClick={() => navigate('/create')}
        >
          בואו נתחיל
        </Button>
      </div>
    </div>
  );
};

export default Index;
