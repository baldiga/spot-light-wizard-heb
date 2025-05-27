
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CharacterCountTextareaProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  className?: string;
}

const CharacterCountTextarea: React.FC<CharacterCountTextareaProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  minLength = 50,
  maxLength = 1000,
  className
}) => {
  const isValid = value.length >= minLength && value.length <= maxLength;
  const isOverMin = value.length >= minLength;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "resize-none rtl-form",
          !isValid && value.length > 0 && "border-red-500",
          className
        )}
      />
      <div className="flex justify-between items-center text-sm">
        <div className={cn(
          "text-right",
          isOverMin ? "text-green-600" : "text-red-500"
        )}>
          {value.length < minLength && `נדרשים לפחות ${minLength} תווים`}
          {value.length >= minLength && value.length <= maxLength && "אורך טקסט תקין"}
          {value.length > maxLength && "טקסט ארוך מדי"}
        </div>
        <div className={cn(
          "text-left font-mono",
          value.length > maxLength ? "text-red-500" : 
          value.length < minLength ? "text-red-500" : "text-gray-500"
        )}>
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  );
};

export default CharacterCountTextarea;
