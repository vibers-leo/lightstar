# lightstar/toss — 앱인토스 미니앱

별자리 운세 앱인토스 버전. lightstar 풀앱에서 핵심 기능만 이식.

## 앱인토스 개발 가이드

앱인토스 작업 시 항상 참조:

```
@~/.claude/skills/appintoss/SKILL.md
```

주요 포인트:
- appName: 콘솔 등록 후 변경 불가
- 번들 100MB 이하
- 다크 모드 미지원
- 결제(토스페이)는 mTLS 인증서 + 영업일 7~14일 Key 발급 필요

## 기술 스택

- Vite + React + TypeScript
- Tailwind CSS v4
- framer-motion, lucide-react
- @astrodraw/astrochart (네이탈 차트)
- astronomia (행성 계산)
- Vercel Serverless Functions (api/)

## 개발 명령어

```bash
npm run dev        # localhost:3400 (Vite)
npx vercel dev --listen 3401  # API 서버
npm run build
```

## 콘솔

https://apps-in-toss.toss.im/ (bababapet@naver.com)
