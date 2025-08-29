'use server';

/**
 * @fileOverview This file contains all the server actions for the application.
 */

import { ai } from '@/ai/genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const notes = querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore Timestamp to number if it exists
    const createdAt = data.createdAt?._seconds ? data.createdAt.toMillis() : data.createdAt;
    const updatedAt = data.updatedAt?._seconds ? data.updatedAt.toMillis() : data.updatedAt;
    return { id: doc.id, ...data, createdAt, updatedAt } as Note;
  });
  return notes;
}

export async function getNote(input: GetNoteInput): Promise<GetNoteOutput> {
  const db = getFirestore();
  const { id, uid } = input;
  const docRef = db.collection('notes').doc(id);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const data = docSnap.data();
    if (data && data.uid === uid) {
      // Convert Firestore Timestamp to number if it exists
      const createdAt = data.createdAt?._seconds ? data.createdAt.toMillis() : data.createdAt;
      const updatedAt = data.updatedAt?._seconds ? data.updatedAt.toMillis() : data.updatedAt;
      return { id: docSnap.id, ...data, createdAt, updatedAt } as Note;
    }
  }
  return undefined;
}

export async function createNote(input: CreateNoteInput): Promise<CreateNoteOutput> {
  const db = getFirestore();
  const { uid, title, content, tags, category } = input;

  const newNoteData = {
    uid,
    title,
    content,
    tags,
    category,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const newNoteRef = await db.collection('notes').add(newNoteData);
  return newNoteRef.id;
}

export async function updateNote(input: UpdateNoteInput): Promise<UpdateNoteOutput> {
  const db = getFirestore();
  const { id, uid, data } = input;
  const docRef = db.collection('notes').doc(id);
  const docSnap = await docRef.get();

  if (docSnap.exists && docSnap.data()?.uid === uid) {
    await docRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(), // Always update with server timestamp
    });
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
      const genAI = new GoogleGenerativeAI(apiKey);
      // We don't need to actually use the model, just verify we can access it.
      await genAI.getGenerativeModel({ model: "gemini-pro" });
      return { isValid: true };
    }
    return { isValid: false, error: 'Unknown provider.' };
  } catch (e: any) {
    console.error(`API key validation failed for ${provider}:`, e);
    // Provide a more user-friendly error message
    const errorMessage = e.message?.includes('API key not valid')
      ? 'The API key is invalid. Please check your key and try again.'
      : 'Validation failed. Please check your network connection and API key.';
    return { isValid: false, error: errorMessage };
  }
}
