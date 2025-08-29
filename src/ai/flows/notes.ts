
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  updateDoc,
} from 'firebase/firestore';
import {db} from '@/lib/firebase';
import {Note, NoteSchema} from '@/lib/types';

// Define Zod schema for the flows for compile time validation and type safety.

const notesCollection = collection(db, 'notes');

const getNotesFlowInternal = ai.defineFlow(
  {
    name: 'getNotesFlow',
    inputSchema: z.object({
      uid: z.string(),
      category: z.string().optional(),
    }),
    outputSchema: z.array(NoteSchema),
  },
  async ({uid, category}) => {
    if (!db) {
      console.error('Firestore client is not available.');
      return [];
    }
    const q = category
      ? query(notesCollection, where('uid', '==', uid), where('category', '==', category))
      : query(notesCollection, where('uid', '==', uid));
    
    const querySnapshot = await getDocs(q);
    const notes = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as Note[];
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }
);
export async function getNotesFlow(input: z.infer<typeof getNotesFlowInternal.inputSchema>): Promise<z.infer<typeof getNotesFlowInternal.outputSchema>> {
    return getNotesFlowInternal(input);
}


const getNoteFlowInternal = ai.defineFlow(
  {
    name: 'getNoteFlow',
    inputSchema: z.object({
      id: z.string(),
      uid: z.string(),
    }),
    outputSchema: NoteSchema.optional(),
  },
  async ({id, uid}) => {
    if (!db) {
      console.error('Firestore client is not available.');
      return undefined;
    }
    const docRef = doc(db, 'notes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const note = {id: docSnap.id, ...docSnap.data()} as Note;
      if (note.uid === uid) {
        return note;
      }
    }
    return undefined;
  }
);
export async function getNoteFlow(input: z.infer<typeof getNoteFlowInternal.inputSchema>): Promise<z.infer<typeof getNoteFlowInternal.outputSchema>> {
    return getNoteFlowInternal(input);
}

const createNoteFlowInternal = ai.defineFlow(
  {
    name: 'createNoteFlow',
    inputSchema: NoteSchema.omit({id: true}),
    outputSchema: z.string(), // Returns the new note ID
  },
  async (noteData) => {
    if (!db) {
      console.error('Firestore client is not available.');
      throw new Error('Database not initialized');
    }
    const newNoteRef = doc(collection(db, 'notes'));
    await setDoc(newNoteRef, noteData);
    return newNoteRef.id;
  }
);
export async function createNoteFlow(input: z.infer<typeof createNoteFlowInternal.inputSchema>): Promise<z.infer<typeof createNoteFlowInternal.outputSchema>> {
    return createNoteFlowInternal(input);
}

const updateNoteFlowInternal = ai.defineFlow(
  {
    name: 'updateNoteFlow',
    inputSchema: z.object({
      id: z.string(),
      uid: z.string(),
      data: NoteSchema.partial(),
    }),
    outputSchema: z.void(),
  },
  async ({id, uid, data}) => {
    if (!db) {
      console.error('Firestore client is not available.');
      return;
    }
    const docRef = doc(db, 'notes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().uid === uid) {
      await updateDoc(docRef, data);
    } else {
      throw new Error('Note not found or permission denied');
    }
  }
);
export async function updateNoteFlow(input: z.infer<typeof updateNoteFlowInternal.inputSchema>): Promise<z.infer<typeof updateNoteFlowInternal.outputSchema>> {
    return updateNoteFlowInternal(input);
}

const deleteNoteFlowInternal = ai.defineFlow(
  {
    name: 'deleteNoteFlow',
    inputSchema: z.object({
      id: z.string(),
      uid: z.string(),
    }),
    outputSchema: z.void(),
  },
  async ({id, uid}) => {
    if (!db) {
      console.error('Firestore client is not available.');
      return;
    }
    const docRef = doc(db, 'notes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().uid === uid) {
      await deleteDoc(docRef);
    } else {
      throw new Error('Note not found or permission denied');
    }
  }
);
export async function deleteNoteFlow(input: z.infer<typeof deleteNoteFlowInternal.inputSchema>): Promise<z.infer<typeof deleteNoteFlowInternal.outputSchema>> {
    return deleteNoteFlowInternal(input);
}
