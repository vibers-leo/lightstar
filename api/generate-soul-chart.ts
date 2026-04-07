import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from './lib/ai-client';

/**
 * 5개 개별 분석 결과를 종합하여 영혼 차트를 생성
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profile, analyses, conversationHistory, mode: requestMode } = req.body;

    // 경로 분기: unified 모드 (대화 기반) vs 개별 분석 종합
    if (requestMode === 'unified' && conversationHistory) {
      return handleUnifiedGeneration(res, profile, conversationHistory);
    }

    // 기존 경로: 5개 개별 분석 종합
    // 입력 검증: 최소 5개 필수 분석 필요
    const requiredModes = ['face', 'zodiac', 'mbti', 'saju', 'blood'];
    const missingModes = requiredModes.filter((m) => !analyses?.[m]);

    if (!profile?.name || missingModes.length > 0) {
      return res.status(400).json({
        error: `필수 분석이 누락되었습니다: ${missingModes.join(', ')}`,
      });
    }

    // 각 분석 결과를 텍스트로 포맷팅
    const analysisTexts = Object.entries(analyses)
      .map(([mode, data]: [string, any]) => {
        const modeName = MODE_NAMES[mode] || mode;
        return `[${modeName} 분석 결과]
headline: "${data.headline}"
traits: ${(data.traits || []).join(', ')}
advice: "${data.advice}"
depthScore: ${data.depthScore || 100}`;
      })
      .join('\n\n');

    // 종합 차트 생성 프롬프트
    const prompt = `
당신은 영혼 차트 마스터입니다.
아래 5가지(또는 그 이상) 분석 결과를 종합하여 이 사람의 영혼 차트를 완성하세요.

**내담자 정보:**
- 이름: ${profile.name}
- 생년월일: ${profile.birthDate || '미입력'}
- MBTI: ${profile.mbti || '미입력'}
- 혈액형: ${profile.bloodType || '미입력'}
- 별자리: ${profile.zodiacSign || '미입력'}

**개별 분석 결과:**
${analysisTexts}

---

위 데이터를 교차 검증하고 종합하여, 다음 JSON을 생성하세요.
각 분석에서 드러난 특성들이 서로 어떻게 연결되는지 깊이 있게 통합하세요.

**응답 형식 (JSON만 출력, 다른 텍스트 없이):**

\`\`\`json
{
  "soulType": "영혼 유형 이름 (4-8글자, 예: 불꽃의 방랑자, 달빛 수호자)",
  "soulDescription": "영혼 유형 상세 설명 (3-5문장, 이 사람의 영혼이 가진 본질을 설명)",
  "dimensions": {
    "intuition": 0-100 사이 정수 (직관력),
    "emotion": 0-100 사이 정수 (감성),
    "logic": 0-100 사이 정수 (논리력),
    "social": 0-100 사이 정수 (사회성),
    "creativity": 0-100 사이 정수 (창의력)
  },
  "coreTraits": ["핵심 성격 특성 5-7개"],
  "hiddenDesire": "이 사람이 진짜로 원하는 것 (1-2문장)",
  "lifeAdvice": "인생 조언 (2-3문장, 도사의 어투)",
  "luckyElements": {
    "color": "행운의 색상",
    "number": 1-99 사이 정수,
    "direction": "행운의 방향",
    "season": "행운의 계절 (봄/여름/가을/겨울)",
    "element": "오행 중 주 원소 (木/火/土/金/水)"
  }
}
\`\`\`

**중요:**
- soulType은 이 사람만의 독특한 영혼 유형명을 만드세요
- dimensions의 각 수치는 개별 분석 결과를 반영하여 결정하세요
- coreTraits는 5개 분석에서 반복적으로 나타나는 패턴을 통합하세요
- hiddenDesire는 여러 분석의 이면을 꿰뚫어 보세요
- lifeAdvice는 도사 페르소나로 깊이 있게 작성하세요
`;

    const text = await generateText({ prompt, maxTokens: 2048 });

    // JSON 파싱
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsedData = JSON.parse(jsonText);

    // SoulChartData 구성
    const soulChart = {
      soulType: parsedData.soulType,
      soulDescription: parsedData.soulDescription,
      dimensions: {
        intuition: clamp(parsedData.dimensions?.intuition || 50),
        emotion: clamp(parsedData.dimensions?.emotion || 50),
        logic: clamp(parsedData.dimensions?.logic || 50),
        social: clamp(parsedData.dimensions?.social || 50),
        creativity: clamp(parsedData.dimensions?.creativity || 50),
      },
      coreTraits: (parsedData.coreTraits || []).slice(0, 7),
      hiddenDesire: parsedData.hiddenDesire || '',
      lifeAdvice: parsedData.lifeAdvice || '',
      luckyElements: {
        color: parsedData.luckyElements?.color || '청록색',
        number: clamp(parsedData.luckyElements?.number || 7, 1, 99),
        direction: parsedData.luckyElements?.direction || '동쪽',
        season: parsedData.luckyElements?.season || '봄',
        element: parsedData.luckyElements?.element || '木',
      },
      createdAt: new Date(),
      includesCouple: !!analyses.couple,
    };

    return res.status(200).json({ soulChart });
  } catch (error: any) {
    console.error('Soul chart generation error:', error);
    return res.status(500).json({
      error: '종합 영혼 차트 생성 중 오류가 발생했습니다',
      details: error.message,
    });
  }
}

/** 숫자를 범위 내로 제한 */
function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

const MODE_NAMES: Record<string, string> = {
  face: '관상', zodiac: '별자리', mbti: 'MBTI',
  saju: '사주명리', blood: '혈액형', couple: '커플 궁합',
};

/**
 * 통합 상담 대화에서 직접 영혼 차트 생성 (unified 모드)
 */
async function handleUnifiedGeneration(
  res: any,
  profile: any,
  conversationHistory: Array<{ role: string; text: string }>
) {
  const conversationText = conversationHistory
    .map((msg) => `${msg.role === 'user' ? '내담자' : '도사'}: ${msg.text}`)
    .join('\n\n');

  const prompt = `
당신은 영혼 차트 마스터입니다.
아래 **통합 상담 대화**를 분석하여 이 사람의 영혼 차트를 완성하세요.
대화에서 다뤄진 관상, 별자리, MBTI, 사주, 혈액형 분석을 모두 종합하세요.

**내담자 정보:**
- 이름: ${profile?.name || '미상'}
- 생년월일: ${profile?.birthDate || '미입력'}
- MBTI: ${profile?.mbti || '미입력'}
- 혈액형: ${profile?.bloodType || '미입력'}

**통합 상담 대화 전문:**
${conversationText}

---

위 대화를 깊이 분석하여, 다음 JSON을 생성하세요.

**응답 형식 (JSON만 출력, 다른 텍스트 없이):**

\`\`\`json
{
  "soulType": "영혼 유형 이름 (4-8글자, 예: 불꽃의 방랑자, 달빛 수호자)",
  "soulDescription": "영혼 유형 상세 설명 (3-5문장)",
  "dimensions": {
    "intuition": 0-100 (직관력),
    "emotion": 0-100 (감성),
    "logic": 0-100 (논리력),
    "social": 0-100 (사회성),
    "creativity": 0-100 (창의력)
  },
  "coreTraits": ["핵심 성격 특성 5-7개"],
  "hiddenDesire": "이 사람이 진짜로 원하는 것 (1-2문장)",
  "lifeAdvice": "인생 조언 (2-3문장, 도사의 어투)",
  "luckyElements": {
    "color": "행운의 색상",
    "number": 1-99,
    "direction": "행운의 방향",
    "season": "행운의 계절 (봄/여름/가을/겨울)",
    "element": "오행 중 주 원소 (木/火/土/金/水)"
  }
}
\`\`\`
`;

  const text = await generateText({ prompt, maxTokens: 2048 });

  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 응답을 파싱할 수 없습니다');
  }

  const jsonText = jsonMatch[1] || jsonMatch[0];
  const parsedData = JSON.parse(jsonText);

  const soulChart = {
    soulType: parsedData.soulType,
    soulDescription: parsedData.soulDescription,
    dimensions: {
      intuition: clamp(parsedData.dimensions?.intuition || 50),
      emotion: clamp(parsedData.dimensions?.emotion || 50),
      logic: clamp(parsedData.dimensions?.logic || 50),
      social: clamp(parsedData.dimensions?.social || 50),
      creativity: clamp(parsedData.dimensions?.creativity || 50),
    },
    coreTraits: (parsedData.coreTraits || []).slice(0, 7),
    hiddenDesire: parsedData.hiddenDesire || '',
    lifeAdvice: parsedData.lifeAdvice || '',
    luckyElements: {
      color: parsedData.luckyElements?.color || '청록색',
      number: clamp(parsedData.luckyElements?.number || 7, 1, 99),
      direction: parsedData.luckyElements?.direction || '동쪽',
      season: parsedData.luckyElements?.season || '봄',
      element: parsedData.luckyElements?.element || '木',
    },
    createdAt: new Date(),
    includesCouple: false,
  };

  return res.status(200).json({ soulChart });
}
