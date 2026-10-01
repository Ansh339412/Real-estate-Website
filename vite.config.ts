/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages cannot send security headers, so the production build embeds a strict CSP <meta> tag.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "worker-src 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

export default defineConfig(({ command }) => ({
  base: './',
  test: { environment: 'jsdom' },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-csp',
      transformIndexHtml(html) {
        if (command !== 'build') return html;
        return html.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`);
      },
    },
  ],
}));
