import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes — require() 방식으로 동적 로드 (CJS 번들)
const apiRoutes = [
  'analyze-face', 'chat', 'create-permission', 'generate-card',
  'generate-soul-chart', 'kakao-auth', 'natal-chart', 'test',
  'verify-permission', 'vibers-admin', 'zodiac-fortune',
];

for (const route of apiRoutes) {
  app.all(`/api/${route}`, async (req, res) => {
    try {
      // esbuild CJS 번들에서는 require가 동작함
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require(`./api/${route}`);
      await (mod.default || mod)(req, res);
    } catch (err) {
      console.error(`[/api/${route}]`, err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}

// Static files
app.use(express.static(DIST));
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`lightstar server running on port ${PORT}`);
});
