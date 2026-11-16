import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'tts-proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/api/tts', (req, res) => {
          try {
            const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost:3000'}`);
            const text = urlObj.searchParams.get('text') || '';
            const lang = urlObj.searchParams.get('lang') || 'bn';

            if (!text) {
              res.statusCode = 400;
              res.end('Missing text');
              return;
            }

            const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

            const request = https.get(
              targetUrl,
              {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  Accept: '*/*',
                },
              },
              (googleRes) => {
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                res.setHeader('Access-Control-Allow-Origin', '*');
                googleRes.pipe(res);
              }
            );

            request.on('error', (err) => {
              res.statusCode = 500;
              res.end(err.message);
            });
          } catch (e: any) {
            res.statusCode = 500;
            res.end(e?.message || 'Server error');
          }
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: true,
  },
});
