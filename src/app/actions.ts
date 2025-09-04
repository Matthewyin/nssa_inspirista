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
            content: `你是一位专业的内容编辑和知识管理专家，擅长将零散的想法整理成结构化、有价值的内容。

## 优化目标
- 提升内容的逻辑性和可读性
- 挖掘深层价值和潜在应用
- 增强实用性和可操作性
- 保持原创思想的核心价值

## 优化策略
1. **结构重组**：按逻辑关系重新组织内容，形成清晰的层次结构
2. **内容扩展**：基于核心观点，补充相关背景、应用场景、实施建议
3. **语言优化**：使用更精准、生动的表达，提升可读性
4. **价值挖掘**：识别并突出内容的独特价值和创新点
5. **实用转化**：将抽象想法转化为具体可行的行动建议

## 输出要求
- 保持原始想法的核心精神和创新性
- 结构清晰，逻辑连贯，层次分明
- 语言简洁有力，避免冗余表达
- 增加实用价值，提供可操作的建议
- 字数适中，既充实又不冗长

请对以下内容进行深度优化：

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
      prompt: `你是一位专业的内容编辑和知识管理专家，擅长将零散的想法整理成结构化、有价值的内容。

## 优化目标
- 提升内容的逻辑性和可读性
- 挖掘深层价值和潜在应用
- 增强实用性和可操作性
- 保持原创思想的核心价值

## 优化策略
1. **结构重组**：按逻辑关系重新组织内容，形成清晰的层次结构
2. **内容扩展**：基于核心观点，补充相关背景、应用场景、实施建议
3. **语言优化**：使用更精准、生动的表达，提升可读性
4. **价值挖掘**：识别并突出内容的独特价值和创新点
5. **实用转化**：将抽象想法转化为具体可行的行动建议

## 输出要求
- 保持原始想法的核心精神和创新性
- 结构清晰，逻辑连贯，层次分明
- 语言简洁有力，避免冗余表达
- 增加实用价值，提供可操作的建议
- 字数适中，既充实又不冗长

请对以下内容进行深度优化：

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
            content: `你是一位专业的知识分类和标签专家，擅长从内容中提取核心概念和关键主题。

## 标签设计原则
1. **准确性**：标签必须准确反映内容的核心主题
2. **实用性**：便于后续检索和知识管理
3. **层次性**：包含不同层次的概念（领域、方法、应用等）
4. **简洁性**：使用简洁明了的词汇，避免冗长表达
5. **一致性**：遵循统一的命名规范

## 标签类型
- **领域标签**：技术领域、学科分类、行业类别
- **方法标签**：学习方法、工作方式、解决方案
- **应用标签**：使用场景、目标人群、实际用途
- **特征标签**：内容特点、难度级别、时间要求

## 分析要求
请深入分析以下内容，识别：
- 核心主题和关键概念
- 涉及的技能和知识领域
- 适用的场景和人群
- 内容的独特价值点

基于分析结果，生成3-5个高质量标签。返回JSON格式：["标签1", "标签2", "标签3"]

内容：
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
      prompt: `你是一位专业的知识分类和标签专家，擅长从内容中提取核心概念和关键主题。

## 标签设计原则
1. **准确性**：标签必须准确反映内容的核心主题
2. **实用性**：便于后续检索和知识管理
3. **层次性**：包含不同层次的概念（领域、方法、应用等）
4. **简洁性**：使用简洁明了的词汇，避免冗长表达
5. **一致性**：遵循统一的命名规范

## 标签类型
- **领域标签**：技术领域、学科分类、行业类别
- **方法标签**：学习方法、工作方式、解决方案
- **应用标签**：使用场景、目标人群、实际用途
- **特征标签**：内容特点、难度级别、时间要求

## 分析要求
请深入分析以下内容，识别：
- 核心主题和关键概念
- 涉及的技能和知识领域
- 适用的场景和人群
- 内容的独特价值点

基于分析结果，生成3-5个高质量标签。

内容：
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
      // Use direct HTTP API call to validate Gemini API key
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          }
        })
      });

      if (response.ok) {
        return { isValid: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        return { isValid: false, error: errorMessage };
      }
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
