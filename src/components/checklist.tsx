'use client';

import { useState, useEffect } from 'react';
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
function SortableChecklistItem({ note, onUpdate }: {
  note: Note;
  onUpdate?: () => void;
}) {
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

  const handleUpdate = () => {
    // For completion status changes, we want to refetch
    // For sort operations, we don't call onUpdate to avoid refetch
    onUpdate?.();
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ChecklistItem
        note={note}
        onUpdate={handleUpdate}
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

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedFiltered = arrayMove(filteredNotes, oldIndex, newIndex);

      // Update local state immediately for smooth UX
      setNotes(prevNotes => {
        const updatedNotes = [...prevNotes];

        // Update sortOrder for all reordered notes
        reorderedFiltered.forEach((note, index) => {
          const noteIndex = updatedNotes.findIndex(n => n.id === note.id);
          if (noteIndex !== -1) {
            updatedNotes[noteIndex] = {
              ...updatedNotes[noteIndex],
              sortOrder: index * 10 // Use increments of 10 to allow future insertions
            };
          }
        });

        return updatedNotes;
      });

      // Update in Firebase (don't call onNotesChange to avoid refetch)
      try {
        const batch = writeBatch(db);
        reorderedFiltered.forEach((note, index) => {
          const noteRef = doc(db, 'notes', note.id);
          batch.update(noteRef, {
            sortOrder: index * 10,
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();

        toast({
          title: t('checklist.sort.success.title'),
          description: t('checklist.sort.success.description'),
        });
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

  // Update local notes when initialNotes changes, but preserve local sorting
  useEffect(() => {
    // Only update if the number of notes changed (added/deleted)
    // or if this is the initial load
    if (notes.length === 0 || notes.length !== initialNotes.length) {
      setNotes(initialNotes);
    } else {
      // Merge updates while preserving local sortOrder changes
      setNotes(prevNotes => {
        const updatedNotes = [...prevNotes];

        // Update existing notes with new data (except sortOrder)
        initialNotes.forEach(newNote => {
          const existingIndex = updatedNotes.findIndex(n => n.id === newNote.id);
          if (existingIndex !== -1) {
            // Preserve the local sortOrder if it exists
            const localSortOrder = updatedNotes[existingIndex].sortOrder;
            updatedNotes[existingIndex] = {
              ...newNote,
              sortOrder: localSortOrder !== undefined ? localSortOrder : newNote.sortOrder
            };
          } else {
            // New note, add it
            updatedNotes.push(newNote);
          }
        });

        // Remove notes that no longer exist
        return updatedNotes.filter(note =>
          initialNotes.some(newNote => newNote.id === note.id)
        );
      });
    }
  }, [initialNotes, notes.length]);

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
