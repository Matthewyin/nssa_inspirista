'use server';

/**
 * @fileOverview This file contains all the server actions for the application.
 */

import { ai } from '@/ai/genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { googleAI } from '@genkit-ai/googleai';
import {
  Note,
  GetNotesInput,
  GetNotesOutput,
  GetNoteInput,
  GetNoteOutput,
  CreateNoteInput,
  CreateNoteOutput,
  UpdateNoteInput,
  UpdateNoteOutput,
  DeleteNoteInput,
  DeleteNoteOutput,
  RefineNoteInput,
  RefineNoteOutput,
  RefineNoteOutputSchema,
  SuggestTagsInput,
  SuggestTagsOutput,
  SuggestTagsOutputSchema,
  ValidateApiKeyInput,
  ValidateApiKeyOutput,
} from '@/lib/types';
import { z } from 'genkit';

// --- Note Database Actions ---

export async function getNotes(input: GetNotesInput): Promise<GetNotesOutput> {
  const db = getFirestore();
  const { uid, category } = input;
  let query: FirebaseFirestore.Query = db
    .collection('notes')
    .where('uid', '==', uid);

  if (category) {
    query = query.where('category', '==', category);
  }

  const querySnapshot = await query.orderBy('updatedAt', 'desc').get();
  const notes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];
  return notes;
}

export async function getNote(input: GetNoteInput): Promise<GetNoteOutput> {
  const db = getFirestore();
  const { id, uid } = input;
  const docRef = db.collection('notes').doc(id);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const note = { id: docSnap.id, ...docSnap.data() } as Note;
    if (note.uid === uid) {
      return note;
    }
  }
  return undefined;
}

export async function createNote(input: CreateNoteInput): Promise<CreateNoteOutput> {
  const db = getFirestore();
  const newNoteRef = await db.collection('notes').add(input);
  return newNoteRef.id;
}

export async function updateNote(input: UpdateNoteInput): Promise<UpdateNoteOutput> {
  const db = getFirestore();
  const { id, uid, data } = input;
  const docRef = db.collection('notes').doc(id);
  const docSnap = await docRef.get();

  if (docSnap.exists && docSnap.data()?.uid === uid) {
    await docRef.update(data);
  } else {
    throw new Error('Note not found or permission denied');
  }
}

export async function deleteNote(input: DeleteNoteInput): Promise<DeleteNoteOutput> {
  const db = getFirestore();
  const { id, uid } = input;
  const docRef = db.collection('notes').doc(id);
  const docSnap = await docRef.get();

  if (docSnap.exists && docSnap.data()?.uid === uid) {
    await docRef.delete();
  } else {
    throw new Error('Note not found or permission denied');
  }
}


// --- AI-powered Actions ---

export async function refineNote(input: RefineNoteInput): Promise<RefineNoteOutput> {
  const { apiKey, aiConfig, noteContent } = input;
  const model = googleAI(aiConfig.model, { apiKey });

  const { output } = await ai.generate({
    prompt: `You are an AI assistant designed to refine notes.
Please organize, summarize, and categorize the following note content to improve its clarity and structure.

Note Content:
${noteContent}`,
    model,
    output: { schema: RefineNoteOutputSchema },
  });
  return output!;
}

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  const { apiKey, aiConfig, noteContent } = input;
  const model = googleAI(aiConfig.model, { apiKey });

  const { output } = await ai.generate({
    prompt: `Suggest 3-5 relevant tags for the following note content. The tags should reflect the main topics, themes, and keywords present in the note.

Note Content:
${noteContent}`,
    model,
    output: { schema: SuggestTagsOutputSchema },
  });
  return output!;
}

export async function validateApiKey(input: ValidateApiKeyInput): Promise<ValidateApiKeyOutput> {
  const { provider, apiKey } = input;
  try {
    if (provider === 'gemini') {
      const model = googleAI('gemini-1.5-flash', { apiKey });
      const { output } = await ai.generate({
        model,
        prompt: 'test',
        output: { schema: z.string() },
      });
      // Simple check if output exists and is a string
      if (typeof output === 'string') {
        return { isValid: true };
      }
    }
    return { isValid: false, error: 'Unknown error occurred.' };
  } catch (e: any) {
    console.error(`API key validation failed for ${provider}:`, e);
    return { isValid: false, error: e.message || 'Validation failed.' };
  }
}
