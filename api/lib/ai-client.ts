/**
 * AI 클라이언트 (Groq 우선, Gemini 폴백)
 * - GROQ_API_KEY 있으면 Groq 사용 (무료)
 * - 없거나 실패 시 GEMINI_API_KEY로 Gemini 폴백
 */
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// === Groq (우선) ===
const groqKey = process.env.GROQ_API_KEY;
const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_VISION_MODEL = 'llama-3.2-90b-vision-preview';

// === Gemini (폴백) ===
const geminiKey = process.env.GEMINI_API_KEY;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
const GEMINI_MODEL = 'gemini-2.0-flash';

/** AI 키가 하나라도 있는지 */
export function hasAIKey(): boolean {
  return !!(groqKey || geminiKey);
}

/** 현재 사용 중인 AI 제공자 */
export function getProvider(): 'groq' | 'gemini' | 'none' {
  if (groq) return 'groq';
  if (genAI) return 'gemini';
  return 'none';
}

// ============================================================
// 텍스트 전용 대화 (멀티턴)
// ============================================================
interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  text: string;
}

export async function chatWithHistory(opts: {
  systemPrompt: string;
  history: ChatMessage[];
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const { systemPrompt, history, userMessage, maxTokens } = opts;

  if (groq) {
    try {
      return await groqChatWithHistory(opts);
    } catch (error) {
      console.warn('[AI] Groq 채팅 실패, Gemini 폴백:', error);
      if (genAI) return await geminiChatWithHistory(opts);
      throw error;
    }
  }

  if (genAI) return await geminiChatWithHistory(opts);
  throw new Error('AI API 키가 설정되지 않았습니다.');
}

async function groqChatWithHistory(opts: {
  systemPrompt: string;
  history: ChatMessage[];
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: opts.systemPrompt },
  ];

  for (const msg of opts.history) {
    messages.push({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.text,
    });
  }

  messages.push({ role: 'user', content: opts.userMessage });

  const completion = await groq!.chat.completions.create({
    messages,
    model: GROQ_MODEL,
    temperature: 0.8,
    max_tokens: opts.maxTokens ?? 2048,
  });

  return completion.choices[0]?.message?.content || '';
}

async function geminiChatWithHistory(opts: {
  systemPrompt: string;
  history: ChatMessage[];
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const model = genAI!.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: opts.systemPrompt,
  });

  const formattedHistory = opts.history.map((msg) => ({
    role: msg.role === 'model' ? 'model' as const : 'user' as const,
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({ history: formattedHistory });
  const result = await chat.sendMessage(opts.userMessage);
  return result.response.text();
}

// ============================================================
// 이미지 포함 대화 (관상 첫 턴)
// ============================================================
export async function chatWithImage(opts: {
  systemPrompt: string;
  userMessage: string;
  imageBase64: string;
  mimeType?: string;
}): Promise<string> {
  const { systemPrompt, userMessage, imageBase64, mimeType = 'image/jpeg' } = opts;
  const imageData = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  if (groq) {
    try {
      return await groqChatWithImage(systemPrompt, userMessage, imageData, mimeType);
    } catch (error) {
      console.warn('[AI] Groq Vision 실패, Gemini 폴백:', error);
      if (genAI) return await geminiChatWithImage(systemPrompt, userMessage, imageData, mimeType);
      throw error;
    }
  }

  if (genAI) return await geminiChatWithImage(systemPrompt, userMessage, imageData, mimeType);
  throw new Error('AI API 키가 설정되지 않았습니다.');
}

async function groqChatWithImage(
  systemPrompt: string, userMessage: string, imageData: string, mimeType: string
): Promise<string> {
  const completion = await groq!.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: userMessage },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageData}` } },
        ],
      },
    ],
    model: GROQ_VISION_MODEL,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || '';
}

async function geminiChatWithImage(
  systemPrompt: string, userMessage: string, imageData: string, mimeType: string
): Promise<string> {
  const model = genAI!.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent([
    userMessage,
    { inlineData: { data: imageData, mimeType } },
  ]);
  return result.response.text();
}

// ============================================================
// 단순 텍스트 생성 (JSON 응답용)
// ============================================================
export async function generateText(opts: {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  if (groq) {
    try {
      return await groqGenerateText(opts);
    } catch (error) {
      console.warn('[AI] Groq 생성 실패, Gemini 폴백:', error);
      if (genAI) return await geminiGenerateText(opts);
      throw error;
    }
  }

  if (genAI) return await geminiGenerateText(opts);
  throw new Error('AI API 키가 설정되지 않았습니다.');
}

async function groqGenerateText(opts: {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const messages: Groq.Chat.ChatCompletionMessageParam[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt });
  }
  messages.push({ role: 'user', content: opts.prompt });

  const completion = await groq!.chat.completions.create({
    messages,
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: opts.maxTokens ?? 1024,
    ...(opts.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  });

  return completion.choices[0]?.message?.content || '';
}

async function geminiGenerateText(opts: {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const model = genAI!.getGenerativeModel({
    model: GEMINI_MODEL,
    ...(opts.systemPrompt ? { systemInstruction: opts.systemPrompt } : {}),
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 1024,
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(opts.prompt);
  return result.response.text();
}

// ============================================================
// Vision 분석 (관상 분석 전용)
// ============================================================
export async function analyzeImage(opts: {
  prompt: string;
  imageBase64: string;
  mimeType?: string;
}): Promise<string> {
  const { prompt, imageBase64, mimeType = 'image/jpeg' } = opts;
  const imageData = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  if (groq) {
    try {
      return await groqAnalyzeImage(prompt, imageData, mimeType);
    } catch (error) {
      console.warn('[AI] Groq Vision 분석 실패, Gemini 폴백:', error);
      if (genAI) return await geminiAnalyzeImage(prompt, imageData, mimeType);
      throw error;
    }
  }

  if (genAI) return await geminiAnalyzeImage(prompt, imageData, mimeType);
  throw new Error('AI API 키가 설정되지 않았습니다.');
}

async function groqAnalyzeImage(prompt: string, imageData: string, mimeType: string): Promise<string> {
  const completion = await groq!.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageData}` } },
        ],
      },
    ],
    model: GROQ_VISION_MODEL,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || '';
}

async function geminiAnalyzeImage(prompt: string, imageData: string, mimeType: string): Promise<string> {
  const model = genAI!.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageData, mimeType } },
  ]);
  return result.response.text();
}
