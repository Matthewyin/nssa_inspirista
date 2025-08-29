'use client';

import { useState } from 'react';
import type { Note } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Edit, Trash2, Calendar } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ChecklistItemProps {
  note: Note;
  onUpdate?: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export function ChecklistItem({ note, onUpdate, isDragging, dragHandleProps }: ChecklistItemProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const noteRef = doc(db, 'notes', note.id);
      await deleteDoc(noteRef);
      
      toast({
        title: t('checklist.item.deleted.title'),
        description: t('checklist.item.deleted.description'),
      });
      
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      toast({
        title: t('checklist.item.error.title'),
        description: t('checklist.item.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(note.updatedAt).toLocaleDateString(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className={`transition-all duration-200 ${isDragging ? 'shadow-lg rotate-1 scale-105' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div
            {...dragHandleProps}
            className="flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-1"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight">
                  {note.title}
                </h3>
                {note.content && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {note.content}
                  </p>
                )}
                
                {/* Tags and Date */}
                <div className="flex items-center gap-2 mt-2">
                  {note.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      +{note.tags.length - 2}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-2">
                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Link href={`/notes/${note.id}`}>
                    <Edit className="h-3 w-3" />
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('checklist.item.delete.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('checklist.item.delete.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('checklist.item.delete.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? t('checklist.item.deleting') : t('checklist.item.delete.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
