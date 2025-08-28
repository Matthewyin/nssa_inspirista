export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  category: 'inspiration' | 'checklist';
}

// This interface is no longer used as checklist items are now managed as Notes.
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}
