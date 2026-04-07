import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateText(opts: { prompt: string; systemPrompt?: string; maxTokens?: number }): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    ...(opts.systemPrompt ? { systemInstruction: opts.systemPrompt } : {}),
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 2048,
      temperature: 0.8,
      // @ts-ignore
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  const result = await model.generateContent(opts.prompt);
  return result.response.text();
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (limit.count >= 10) return false;
  limit.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (!checkRateLimit(ip)) return res.status(429).json({ error: '잠시 후 다시 시도해주세요.' });

  const { sign, signName, element, ruling, birthDate, birthTime, birthCity, lat, lng, type } = req.body;

  if (!sign || !signName || !type) {
    return res.status(400).json({ error: '필수 정보가 없습니다.' });
  }

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  let prompt = '';

  const locationStr = birthCity
    ? `태어난 도시: ${birthCity}${lat && lng ? ` (위도 ${lat.toFixed(4)}, 경도 ${lng.toFixed(4)})` : ''}`
    : '';

  if (type === 'today') {
    prompt = `오늘(${today})의 ${signName}(${sign}, ${element}, 수호행성: ${ruling}) 별자리 운세를 알려줘.
${locationStr}
${birthTime ? `태어난 시간: ${birthTime}` : ''}

아래 형식으로 **반드시** 답해줘. 마크다운 없이 순수 텍스트로만:

[오늘의 한 줄 운세]
(한 문장, 15~20자, 오늘의 핵심 에너지를 담아)

[오늘의 전체 운세]
(6~8문장. 오늘 하루의 전반적인 에너지 흐름, 대인관계, 주의할 점, 기회로 삼을 수 있는 순간까지 구체적으로 서술. 실질적인 조언을 자연스럽게 녹여줘.)

[오늘의 행운 키워드]
키워드1, 키워드2, 키워드3

[행운의 숫자]
숫자 하나

[행운의 색]
색깔 하나`;
  } else if (type === 'love') {
    prompt = `오늘(${today})의 ${signName} 별자리 연애운을 알려줘.
솔직하고 구체적으로, 3-4문장으로. 마크다운 없이 순수 텍스트로만.`;
  } else if (type === 'money') {
    prompt = `오늘(${today})의 ${signName} 별자리 재물운을 알려줘.
솔직하고 구체적으로, 3-4문장으로. 마크다운 없이 순수 텍스트로만.`;
  } else if (type === 'career') {
    prompt = `오늘(${today})의 ${signName} 별자리 사업운/직업운을 알려줘.
솔직하고 구체적으로, 3-4문장으로. 마크다운 없이 순수 텍스트로만.`;
  } else {
    return res.status(400).json({ error: '잘못된 type입니다.' });
  }

  try {
    const result = await generateText({
      prompt,
      systemPrompt: `당신은 별자리 운세 전문가입니다. 오늘 날짜(${today})에 맞는 정확하고 구체적인 운세를 제공합니다. 너무 일반적이지 않게, 오늘 하루에 집중한 실질적인 조언을 해주세요.`,
      maxTokens: 1200,
    });

    return res.status(200).json({ result });
  } catch (err: any) {
    console.error('zodiac-fortune error:', err);
    return res.status(500).json({ error: err?.message || String(err) || '운세를 불러오는 중 오류가 발생했습니다.' });
  }
}
