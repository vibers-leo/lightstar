import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'lightstar',
  brand: {
    displayName: '오늘의 별자리',
    primaryColor: '#7C3AED',
    icon: 'https://lightstar-seven.vercel.app/favicon.ico',
  },
  web: {
    host: 'localhost',
    port: 3400,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
  webViewProps: { type: 'partner' },
});
