'use client';

import { useState } from 'react';
import { type Note } from '@/lib/types';
import { ChecklistItem } from './checklist-item';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChecklistProps {
  initialNotes: Note[];
  onNotesChange?: () => void;
}

// Sortable wrapper for ChecklistItem
function SortableChecklistItem({ note, onUpdate }: { note: Note; onUpdate?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ChecklistItem
        note={note}
        onUpdate={onUpdate}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function Checklist({ initialNotes, onNotesChange }: ChecklistProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [batchMode, setBatchMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [notes, setNotes] = useState(initialNotes);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort notes by sortOrder, then by createdAt
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return a.sortOrder - b.sortOrder;
    }
    if (a.sortOrder !== undefined) return -1;
    if (b.sortOrder !== undefined) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Filter notes based on completion status
  const filteredNotes = sortedNotes.filter(note => {
    if (filter === 'completed') return note.completed;
    if (filter === 'pending') return !note.completed;
    return true;
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredNotes.findIndex(note => note.id === active.id);
      const newIndex = filteredNotes.findIndex(note => note.id === over.id);

      const newOrder = arrayMove(filteredNotes, oldIndex, newIndex);

      // Update local state immediately for smooth UX
      setNotes(prevNotes => {
        const updatedNotes = [...prevNotes];
        const reorderedFiltered = arrayMove(filteredNotes, oldIndex, newIndex);

        // Update sortOrder for all affected notes
        reorderedFiltered.forEach((note, index) => {
          const noteIndex = updatedNotes.findIndex(n => n.id === note.id);
          if (noteIndex !== -1) {
            updatedNotes[noteIndex] = { ...note, sortOrder: index };
          }
        });

        return updatedNotes;
      });

      // Update in Firebase
      try {
        const batch = writeBatch(db);
        newOrder.forEach((note, index) => {
          const noteRef = doc(db, 'notes', note.id);
          batch.update(noteRef, {
            sortOrder: index,
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();
        onNotesChange?.();
      } catch (error) {
        console.error('Error updating sort order:', error);
        toast({
          title: t('checklist.sort.error.title'),
          description: t('checklist.sort.error.description'),
          variant: 'destructive',
        });
        // Revert local state on error
        setNotes(initialNotes);
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotes(new Set(filteredNotes.map(note => note.id)));
    } else {
      setSelectedNotes(new Set());
    }
  };

  const handleSelectNote = (noteId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotes);
    if (checked) {
      newSelected.add(noteId);
    } else {
      newSelected.delete(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const handleBatchDelete = async () => {
    if (selectedNotes.size === 0) return;

    try {
      const batch = writeBatch(db);
      selectedNotes.forEach(noteId => {
        const noteRef = doc(db, 'notes', noteId);
        batch.delete(noteRef);
      });

      await batch.commit();

      toast({
        title: t('checklist.batch.deleted.title'),
        description: t('checklist.batch.deleted.description', { count: selectedNotes.size }),
      });

      setSelectedNotes(new Set());
      setBatchMode(false);
      onNotesChange?.();
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast({
        title: t('checklist.batch.error.title'),
        description: t('checklist.batch.error.description'),
        variant: 'destructive',
      });
    }
  };

  // Update local notes when initialNotes changes
  useState(() => {
    setNotes(initialNotes);
  });

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {notes.length > 0 ? (
        <>
          {/* Controls */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant={batchMode ? "default" : "outline"}
                  onClick={() => setBatchMode(!batchMode)}
                >
                  {batchMode ? t('checklist.batch.exit') : t('checklist.batch.select')}
                </Button>

                {batchMode && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedNotes.size === filteredNotes.length && filteredNotes.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      {t('checklist.batch.selectAll')} ({selectedNotes.size}/{filteredNotes.length})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {t(`checklist.filter.${filter}`)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter('all')}>
                      {t('checklist.filter.all')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('pending')}>
                      {t('checklist.filter.pending')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('completed')}>
                      {t('checklist.filter.completed')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {batchMode && selectedNotes.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('checklist.batch.delete')} ({selectedNotes.size})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          {filteredNotes.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={filteredNotes.map(note => note.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    batchMode ? (
                      <div key={note.id} className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedNotes.has(note.id)}
                          onCheckedChange={(checked) => handleSelectNote(note.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <SortableChecklistItem note={note} onUpdate={onNotesChange} />
                        </div>
                      </div>
                    ) : (
                      <SortableChecklistItem key={note.id} note={note} onUpdate={onNotesChange} />
                    )
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
              <div className="flex flex-col items-center gap-2 text-center p-8">
                <h3 className="text-lg font-medium">{t(`checklist.filter.empty.${filter}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`checklist.filter.empty.${filter}.description`)}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mt-8">
          <div className="flex flex-col items-center gap-2 text-center p-8">
            <h3 className="text-2xl font-bold tracking-tight">{t('checklist.empty.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('checklist.empty.description')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
