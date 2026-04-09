import express from 'express';
import path from 'path';

import analyzeFace from './api/analyze-face';
import chat from './api/chat';
import createPermission from './api/create-permission';
import generateCard from './api/generate-card';
import generateSoulChart from './api/generate-soul-chart';
import kakaoAuth from './api/kakao-auth';
import natalChart from './api/natal-chart';
import testRoute from './api/test';
import verifyPermission from './api/verify-permission';
import vibersAdmin from './api/vibers-admin';
import zodiacFortune from './api/zodiac-fortune';

const app = express();
const PORT = process.env.PORT || 3000;
// server.cjs는 /app/dist/ 안에 있음 → 정적 파일도 /app/dist/
const DIST = __dirname;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const routes: [string, express.RequestHandler][] = [
  ['analyze-face', analyzeFace as any],
  ['chat', chat as any],
  ['create-permission', createPermission as any],
  ['generate-card', generateCard as any],
  ['generate-soul-chart', generateSoulChart as any],
  ['kakao-auth', kakaoAuth as any],
  ['natal-chart', natalChart as any],
  ['test', testRoute as any],
  ['verify-permission', verifyPermission as any],
  ['vibers-admin', vibersAdmin as any],
  ['zodiac-fortune', zodiacFortune as any],
];

for (const [name, handler] of routes) {
  app.all(`/api/${name}`, async (req, res) => {
    try {
      await handler(req as any, res as any);
    } catch (err) {
      console.error(`[/api/${name}]`, err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}

app.use(express.static(DIST));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`lightstar server running on port ${PORT}`);
});
