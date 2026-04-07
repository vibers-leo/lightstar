import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasAIKey, analyzeImage } from './lib/ai-client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    const { imageBase64 } = req.body;

    // 입력 검증
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: '이미지 데이터가 필요합니다.' });
    }

    // Base64 크기 제한 (5MB)
    if (imageBase64.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: '이미지 크기가 너무 큽니다 (최대 5MB).' });
    }

    // Gemini Vision API 호출 (얼굴 검증 + 전문 관상 분석)
    const prompt = `
당신은 동양 관상학(面相學) 전문가입니다. 아래 두 단계를 순서대로 수행하세요.

## 1단계: 사람 얼굴 검증
이 사진에 사람의 얼굴이 명확하게 보이는지 판단하세요.
- 사람이 아닌 것(동물, 풍경, 물건, 캐릭터, 그림, 음식 등)이면 실패입니다.
- 얼굴이 너무 작거나 가려져서 관상 분석이 불가능하면 실패입니다.
- AI가 생성한 이미지여도 사람 얼굴 형태가 보이면 통과입니다.

## 2단계: 전문 관상 분석 (1단계 통과 시에만)

### 삼정(三停) 분석
사진에서 보이는 대로만 판단하세요.
- 상정(上停, 이마~눈썹): 넓이, 윤기, 주름 유무 → 초년운/지적 능력
- 중정(中停, 눈썹~코끝): 비율, 균형 → 중년운/사회적 성취
- 하정(下停, 코끝~턱): 풍만함, 균형 → 말년운/생활력

### 오관(五官) 분석
1. 눈(감찰관): 크기, 모양(봉안/용안/원형안/세장안), 눈매(올라감/내려감/수평), 광채
2. 코(심판관): 높이, 콧대 직선도, 코끝 모양(둥근/뾰족/넓은), 콧방울
3. 입(출납관): 크기, 입술 두께(윗입술/아랫입술), 입꼬리 방향
4. 귀(채청관): 크기, 귓볼 두께, 귀 위치(눈썹 위/아래)
5. 눈썹(보수관): 굵기, 길이, 모양(일자/아치/각진), 간격

### 얼굴형 분류
(둥근형/계란형/각진형/역삼각형/긴형/마름모형) 중 해당 유형

### 인상 종합
사진에서 느껴지는 전반적 인상을 1줄로 서술 (예: "눈에 광채가 있고 코가 반듯하여 결단력과 리더십이 돋보이는 상")

## 응답 형식 (반드시 JSON만 출력)

1단계 실패 시:
{
  "isHumanFace": false,
  "reason": "사진에서 감지된 내용"
}

1단계 통과 시:
{
  "isHumanFace": true,
  "faceShape": "얼굴형 유형",
  "samjeong": {
    "upper": "상정 특징 (넓음/보통/좁음, 특이사항)",
    "middle": "중정 특징 (길이/균형, 특이사항)",
    "lower": "하정 특징 (풍만함/보통/빈약, 특이사항)"
  },
  "eyes": "크기 + 모양 + 눈매 + 광채 (예: 크고 또렷한 봉안, 눈매가 올라가며 광채가 있음)",
  "eyebrows": "굵기 + 모양 + 길이 (예: 짙고 일자형, 눈보다 길게 뻗음)",
  "nose": "높이 + 콧대 + 코끝 + 콧방울 (예: 콧대가 반듯하고 코끝이 둥글며 콧방울이 적당함)",
  "mouth": "크기 + 입술두께 + 입꼬리 (예: 중간 크기, 아랫입술이 두텁고 입꼬리가 올라감)",
  "ears": "크기 + 귓볼 (예: 중간 크기, 귓볼이 두툼함)",
  "chin": "형태 + 특징 (예: 둥글고 살이 적당히 있음)",
  "forehead": "넓이 + 윤기 (예: 넓고 둥글며 윤기가 있음)",
  "impression": "종합 인상 1줄 서술"
}
`;

    if (!hasAIKey()) {
      return res.status(500).json({ error: 'AI 서비스가 현재 사용 불가합니다.' });
    }

    const text = await analyzeImage({
      prompt,
      imageBase64,
      mimeType: 'image/jpeg',
    });

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // 얼굴 검증 실패
    if (!parsed.isHumanFace) {
      return res.status(400).json({
        error: `이 사진에서는 사람의 얼굴이 보이지 않는구나. ${parsed.reason ? `(${parsed.reason})` : ''} 본인의 얼굴이 잘 보이는 정면 사진을 올려주게.`,
      });
    }

    // 검증 통과 → 관상 데이터만 추출
    const { isHumanFace, ...features } = parsed;

    return res.status(200).json({ features });
  } catch (error: any) {
    console.error('Vision API Error:', error);

    if (error.message?.includes('SAFETY')) {
      return res.status(400).json({
        error: '사진에서 부적절한 내용이 감지되었구나. 다른 사진을 시도해보게.',
      });
    }

    return res.status(500).json({
      error: '관상을 보는데 기가 막혔구나... 다시 시도해보게.',
    });
  }
}
