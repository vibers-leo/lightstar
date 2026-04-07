import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from './lib/ai-client';

/**
 * 대화 히스토리를 분석하여 결과 카드 데이터 생성
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mode, profile, conversationHistory, depthScore } = req.body;

    // 입력 검증
    if (!mode || !profile?.name || !conversationHistory || conversationHistory.length === 0) {
      return res.status(400).json({ error: '필수 데이터가 누락되었습니다' });
    }

    // 대화 내용 요약
    const conversationText = conversationHistory
      .map((msg: any) => `${msg.role === 'user' ? '내담자' : '도사'}: ${msg.text}`)
      .join('\n\n');

    // 카드 데이터 생성 프롬프트
    const prompt = `
당신은 지금까지의 상담 내용을 바탕으로 **영혼 차트 결과 카드**를 만들어야 합니다.

**내담자 정보:**
- 이름: ${profile.name}
- 생년월일: ${profile.birthDate || '미입력'}
- 별자리: ${profile.zodiacSign || '미입력'}
- MBTI: ${profile.mbti || '미입력'}
- 혈액형: ${profile.bloodType || '미입력'}

**상담 모드:** ${mode.toUpperCase()}

**대화 내용:**
${conversationText}

**심도 점수:** ${depthScore}/100

---

위 상담 내용을 바탕으로, 내담자의 영혼을 한 장의 카드로 요약해주세요.

**응답 형식 (JSON만 출력, 다른 텍스트 없이):**

\`\`\`json
{
  "headline": "한 줄 헤드라인 (예: 불꽃의 그릇을 가진 사람, 물의 흐름을 읽는 자)",
  "traits": [
    "성격 특성 1 (예: 직관력이 뛰어남)",
    "성격 특성 2 (예: 감정이 풍부함)",
    "성격 특성 3",
    "성격 특성 4",
    "성격 특성 5"
  ],
  "advice": "핵심 조언 1-2문장 (예: 지금은 내면의 소리에 귀 기울일 때입니다. 급하게 결정하지 마세요.)",
  "luckyItems": {
    "color": "행운의 색 (예: 청록색)",
    "number": 행운의 숫자 (1~99 정수),
    "direction": "행운의 방향 (예: 동쪽)"
  }
}
\`\`\`

**중요:**
- JSON 형식을 정확히 지켜주세요
- headline은 15자 이내로 간결하게
- traits는 정확히 5개
- advice는 100자 이내
- 도사 페르소나를 유지하되, 카드에 어울리는 고급스러운 표현 사용
`;

    const text = await generateText({ prompt, maxTokens: 1024 });

    // JSON 파싱
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsedData = JSON.parse(jsonText);

    // CardData 구성
    const cardData = {
      userName: profile.name,
      mode,
      zodiacSign: profile.zodiacSign,
      headline: parsedData.headline,
      traits: parsedData.traits,
      advice: parsedData.advice,
      luckyItems: parsedData.luckyItems,
      depthScore,
      createdAt: new Date(),
    };

    return res.status(200).json({ cardData });
  } catch (error: any) {
    console.error('Card generation error:', error);
    return res.status(500).json({
      error: '카드 생성 중 오류가 발생했습니다',
      details: error.message,
    });
  }
}
