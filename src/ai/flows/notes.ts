'use server';

import {ai} from '@/ai/genkit';
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
import { getFirestore } from 'firebase-admin/firestore';
import {
    Note,
    GetNotesInput, GetNotesOutput, GetNotesInputSchema, GetNotesOutputSchema,
    GetNoteInput, GetNoteOutput, GetNoteInputSchema, GetNoteOutputSchema,
    CreateNoteInput, CreateNoteOutput, CreateNoteInputSchema, CreateNoteOutputSchema,
    UpdateNoteInput, UpdateNoteOutput, UpdateNoteInputSchema, UpdateNoteOutputSchema,
    DeleteNoteInput, DeleteNoteOutput, DeleteNoteInputSchema, DeleteNoteOutputSchema
} from '@/lib/types';


export async function getNotesFlow(input: GetNotesInput): Promise<GetNotesOutput> {
    const getNotesFlowInternal = ai.defineFlow(
      {
        name: 'getNotesFlow',
        inputSchema: GetNotesInputSchema,
        outputSchema: GetNotesOutputSchema,
      },
      async ({uid, category}) => {
        const db = getFirestore();
        const notesCollection = collection(db, 'notes');
        const q = category
          ? query(notesCollection, where('uid', '==', uid), where('category', '==', category))
          : query(notesCollection, where('uid', '==', uid));
        
        const querySnapshot = await getDocs(q);
        const notes = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as Note[];
        return notes.sort((a, b) => b.updatedAt - a.updatedAt);
      }
    );
    return getNotesFlowInternal(input);
}


export async function getNoteFlow(input: GetNoteInput): Promise<GetNoteOutput> {
    const getNoteFlowInternal = ai.defineFlow(
      {
        name: 'getNoteFlow',
        inputSchema: GetNoteInputSchema,
        outputSchema: GetNoteOutputSchema,
      },
      async ({id, uid}) => {
        const db = getFirestore();
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
    return getNoteFlowInternal(input);
}

export async function createNoteFlow(input: CreateNoteInput): Promise<CreateNoteOutput> {
    const createNoteFlowInternal = ai.defineFlow(
      {
        name: 'createNoteFlow',
        inputSchema: CreateNoteInputSchema,
        outputSchema: CreateNoteOutputSchema,
      },
      async (noteData) => {
        const db = getFirestore();
        const newNoteRef = doc(collection(db, 'notes'));
        await setDoc(newNoteRef, noteData);
        return newNoteRef.id;
      }
    );
    return createNoteFlowInternal(input);
}

export async function updateNoteFlow(input: UpdateNoteInput): Promise<UpdateNoteOutput> {
    const updateNoteFlowInternal = ai.defineFlow(
      {
        name: 'updateNoteFlow',
        inputSchema: UpdateNoteInputSchema,
        outputSchema: UpdateNoteOutputSchema,
      },
      async ({id, uid, data}) => {
        const db = getFirestore();
        const docRef = doc(db, 'notes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().uid === uid) {
          await updateDoc(docRef, data);
        } else {
          throw new Error('Note not found or permission denied');
        }
      }
    );
    return updateNoteFlowInternal(input);
}

export async function deleteNoteFlow(input: DeleteNoteInput): Promise<DeleteNoteOutput> {
    const deleteNoteFlowInternal = ai.defineFlow(
      {
        name: 'deleteNoteFlow',
        inputSchema: DeleteNoteInputSchema,
        outputSchema: DeleteNoteOutputSchema,
      },
      async ({id, uid}) => {
        const db = getFirestore();
        const docRef = doc(db, 'notes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().uid === uid) {
          await deleteDoc(docRef);
        } else {
          throw new Error('Note not found or permission denied');
        }
      }
    );
    return deleteNoteFlowInternal(input);
}
