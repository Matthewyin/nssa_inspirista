
import type { Note } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, ListChecks } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export function NoteCard({ note }: { note: Note }) {
  const { t, language, isClient } = useLanguage();

  if (!isClient) {
    return null; 
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
    <Card className="flex flex-col h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus-within:ring-2 focus-within:ring-ring">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{note.title}</CardTitle>
          <Badge variant="outline" className="capitalize shrink-0">
             {category === 'inspiration' ? <Lightbulb className="mr-1.5 h-4 w-4" /> : <ListChecks className="mr-1.5 h-4 w-4" />}
            {categoryText}
          </Badge>
        </div>
        <CardDescription>{`${t('noteCard.updatedOn')} ${formattedDate}`}</CardDescription>
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
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href={`/notes/${note.id}`} aria-label={`${t('noteCard.aria.edit')} ${note.title}`}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

    