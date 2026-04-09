import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes — lazy import to avoid top-level firebase-admin init crash
const apiRoutes = [
  'analyze-face', 'chat', 'create-permission', 'generate-card',
  'generate-soul-chart', 'kakao-auth', 'natal-chart', 'test',
  'verify-permission', 'vibers-admin', 'zodiac-fortune',
];

for (const route of apiRoutes) {
  app.all(`/api/${route}`, async (req, res) => {
    try {
      const mod = await import(`./api/${route}.js`);
      await mod.default(req, res);
    } catch (err) {
      console.error(`[/api/${route}]`, err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}

// Static files
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`lightstar server running on port ${PORT}`);
});
