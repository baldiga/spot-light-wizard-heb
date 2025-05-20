
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Chapter } from '@/types/presentation';
import { usePresentationStore } from '@/store/presentationStore';

interface ChapterEditorProps {
  chapter: Chapter;
  chapterNumber: number;
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({ chapter, chapterNumber }) => {
  const { updateChapter, updatePoint } = usePresentationStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(chapter.title);

  const handleTitleSave = () => {
    updateChapter(chapter.id, editingTitle);
    setIsEditing(false);
  };

  const handlePointChange = (pointId: string, content: string) => {
    updatePoint(chapter.id, pointId, content);
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-whiskey text-white flex items-center justify-center mr-3">
              {chapterNumber}
            </div>
            {isEditing ? (
              <div className="flex items-center">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="text-lg font-medium text-gray-700 ml-2"
                  onBlur={handleTitleSave}
                  autoFocus
                />
                <button 
                  onClick={handleTitleSave}
                  className="text-whiskey hover:text-whiskey-dark transition-colors"
                >
                  שמור
                </button>
              </div>
            ) : (
              <CardTitle 
                className="text-lg font-medium text-gray-700 cursor-pointer hover:text-whiskey"
                onClick={() => setIsEditing(true)}
              >
                {chapter.title}
              </CardTitle>
            )}
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-sm text-gray-500 hover:text-whiskey"
            >
              ערוך
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chapter.points.map((point, index) => (
            <div key={point.id} className="flex items-start">
              <div className="min-w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm mr-3 mt-1">
                {index + 1}
              </div>
              <Input
                value={point.content}
                onChange={(e) => handlePointChange(point.id, e.target.value)}
                className="text-gray-600"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterEditor;
