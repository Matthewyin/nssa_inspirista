'use server';

import {ai} from '@/ai/genkit';
import { getFirestore } from 'firebase-admin/firestore';
import {
    Note,
    GetNotesInput, GetNotesOutput,
    GetNoteInput, GetNoteOutput,
    CreateNoteInput, CreateNoteOutput,
    UpdateNoteInput, UpdateNoteOutput,
    DeleteNoteInput, DeleteNoteOutput
} from '@/lib/types';


export async function getNotesFlow(input: GetNotesInput): Promise<GetNotesOutput> {
    const { uid, category } = input;
    const db = getFirestore();
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('notes').where('uid', '==', uid);

    if (category) {
        query = query.where('category', '==', category);
    }

    const querySnapshot = await query.get();
    const notes = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as Note[];
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getNoteFlow(input: GetNoteInput): Promise<GetNoteOutput> {
    const { id, uid } = input;
    const db = getFirestore();
    const docRef = db.collection('notes').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const note = {id: docSnap.id, ...docSnap.data()} as Note;
        if (note.uid === uid) {
            return note;
        }
    }
    return undefined;
}

export async function createNoteFlow(input: CreateNoteInput): Promise<CreateNoteOutput> {
    const db = getFirestore();
    const newNoteRef = await db.collection('notes').add(input);
    return newNoteRef.id;
}

export async function updateNoteFlow(input: UpdateNoteInput): Promise<UpdateNoteOutput> {
    const { id, uid, data } = input;
    const db = getFirestore();
    const docRef = db.collection('notes').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists && docSnap.data()?.uid === uid) {
        await docRef.update(data);
    } else {
        throw new Error('Note not found or permission denied');
    }
}

export async function deleteNoteFlow(input: DeleteNoteInput): Promise<DeleteNoteOutput> {
    const { id, uid } = input;
    const db = getFirestore();
    const docRef = db.collection('notes').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists && docSnap.data()?.uid === uid) {
        await docRef.delete();
    } else {
        throw new Error('Note not found or permission denied');
    }
}
