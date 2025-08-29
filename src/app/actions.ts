'use server';

/**
 * @fileOverview This file contains all the server actions for the application.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { app } from '@/lib/firebase-server';
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
  if (!app) {
    throw new Error('Firebase Admin SDK not initialized. Please check your Firebase configuration.');
  }
  const db = getFirestore(app);
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
  if (!app) {
    throw new Error('Firebase Admin SDK not initialized. Please check your Firebase configuration.');
  }
  const db = getFirestore(app);
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
  if (!app) {
    throw new Error('Firebase Admin SDK not initialized. Please check your Firebase configuration.');
  }
  const db = getFirestore(app);
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
  if (!app) {
    throw new Error('Firebase Admin SDK not initialized. Please check your Firebase configuration.');
  }
  const db = getFirestore(app);
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
  if (!app) {
    throw new Error('Firebase Admin SDK not initialized. Please check your Firebase configuration.');
  }
  const db = getFirestore(app);
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

  if (aiConfig.provider === 'deepseek') {
    // Handle DeepSeek API call directly
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          {
            role: 'user',
            content: `You are an AI assistant designed to refine notes. Please organize, summarize, and categorize the following note content to improve its clarity and structure. Return only the refined note content without any additional formatting or explanation.

Note Content:
${noteContent}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const refinedNote = data.choices?.[0]?.message?.content || noteContent;

    return { refinedNote };
  } else {
    // Use Genkit for Gemini
    const model = googleAI.model(aiConfig.model, { apiKey });

    const { output } = await ai.generate({
      model,
      prompt: `You are an AI assistant designed to refine notes.
Please organize, summarize, and categorize the following note content to improve its clarity and structure.

Note Content:
${noteContent}`,
      output: { schema: RefineNoteOutputSchema },
    });

    return output!;
  }
}

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  const { apiKey, aiConfig, noteContent } = input;

  if (aiConfig.provider === 'deepseek') {
    // Handle DeepSeek API call directly
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          {
            role: 'user',
            content: `Suggest 3-5 relevant tags for the following note content. The tags should reflect the main topics, themes, and keywords present in the note. Return only a JSON array of strings, for example: ["tag1", "tag2", "tag3"]

Note Content:
${noteContent}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';

    try {
      const tags = JSON.parse(content);
      return { tags: Array.isArray(tags) ? tags : [] };
    } catch (e) {
      // Fallback: extract tags from text
      const tagMatches = content.match(/"([^"]+)"/g);
      const tags = tagMatches ? tagMatches.map((match: string) => match.replace(/"/g, '')) : [];
      return { tags };
    }
  } else {
    // Use Genkit for Gemini
    const model = googleAI.model(aiConfig.model, { apiKey });

    const { output } = await ai.generate({
      model,
      prompt: `Suggest 3-5 relevant tags for the following note content. The tags should reflect the main topics, themes, and keywords present in the note.

Note Content:
${noteContent}`,
      output: { schema: SuggestTagsOutputSchema },
    });

    return output!;
  }
}

export async function validateApiKey(input: ValidateApiKeyInput): Promise<ValidateApiKeyOutput> {
  const { provider, apiKey } = input;
  try {
    if (provider === 'gemini') {
      // Use new genkit with a simple validation call
      const model = googleAI.model('gemini-2.5-flash', { apiKey });

      await ai.generate({
        model,
        prompt: 'Hello',
        output: { schema: z.string() },
      });

      // If the above call does not throw, the key is valid.
      return { isValid: true };
    } else if (provider === 'deepseek') {
      // Validate DeepSeek API key
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        return { isValid: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        return { isValid: false, error: errorMessage };
      }
    }
    // Fallback for unknown providers
    return { isValid: false, error: 'Unknown provider.' };
  } catch (e: any) {
    console.error(`API key validation failed for ${provider}:`, e);
    // Provide a more user-friendly error message
    const errorMessage = e.message?.includes('API key not valid') ||
                         e.message?.includes('permission denied') ||
                         e.message?.includes('API_KEY_INVALID') ||
                         e.message?.includes('invalid') ||
                         e.status === 400 || e.status === 401 || e.status === 403
      ? 'The API key is invalid. Please check your key and try again.'
      : `Validation failed: ${e.message || 'Please check your network connection and API key.'}`;
    return { isValid: false, error: errorMessage };
  }
}
