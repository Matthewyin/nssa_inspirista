'use client';

import type { Note } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Lightbulb, ListChecks } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface BatchNoteCardProps {
  note: Note;
  selected: boolean;
  onSelect: (checked: boolean) => void;
}

export function BatchNoteCard({ note, selected, onSelect }: BatchNoteCardProps) {
  const { t, language, isClient } = useLanguage();

  if (!isClient) {
    // Render a skeleton or basic version on the server
    return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Checkbox checked={selected} onCheckedChange={onSelect} />
            <div className="flex-1">
              <CardTitle className="text-xl">{note.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
        </CardContent>
      </Card>
    );
  }

  const description = note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content;
  const formattedDate = new Date(note.updatedAt).toLocaleDateString(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const category = note.category || 'inspiration';
  const categoryText = category === 'inspiration' ? t('categories.inspiration') : t('categories.checklist');

  return (
    <Card className={`flex flex-col h-full transform transition-all duration-300 ${selected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-lg'}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Checkbox 
            checked={selected} 
            onCheckedChange={onSelect}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{note.title}</CardTitle>
              <Badge variant="outline" className="capitalize shrink-0">
                {category === 'inspiration' ? <Lightbulb className="mr-1.5 h-4 w-4" /> : <ListChecks className="mr-1.5 h-4 w-4" />}
                {categoryText}
              </Badge>
            </div>
            <CardDescription>{`${t('noteCard.updatedOn')} ${formattedDate}`}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
