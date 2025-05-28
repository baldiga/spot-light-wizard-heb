
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summaryData: any;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ open, onOpenChange, summaryData }) => {
  const [email, setEmail] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "אימייל לא תקין",
        description: "אנא הזן כתובת אימייל תקינה",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-summary', {
        body: {
          recipientEmail: email,
          summaryData: summaryData
        }
      });

      if (error) {
        console.error('Error exporting summary:', error);
        throw new Error('Failed to export summary');
      }

      if (data?.success) {
        toast({
          title: "הייצוא הושלם",
          description: `סיכום ההרצאה נשלח בהצלחה לכתובת ${email}`,
        });
        onOpenChange(false);
        setEmail('');
      } else {
        throw new Error(data?.error || 'Failed to export summary');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "שגיאה בייצוא",
        description: "אירעה שגיאה בשליחת הסיכום. נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">ייצוא סיכום ההרצאה לאימייל</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="export-email">כתובת אימייל לשליחה</Label>
            <Input
              id="export-email"
              type="email"
              placeholder="הזן כתובת אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rtl-form"
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              הסיכום יכלול את כל הפרקים: סקירה, מבנה, שקפים, מכירה, פתיחות, מעורבות ושיווק.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-row-reverse gap-2">
          <Button
            onClick={handleExport}
            disabled={!email || isExporting}
            className="bg-whiskey hover:bg-whiskey-dark text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                שלח לאימייל
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
