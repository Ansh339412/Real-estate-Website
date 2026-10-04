/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
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

export default defineConfig(({ command, mode }) => {
  // Absolute URL of the deployed site (canonical, Open Graph, JSON-LD, sitemap). Override with VITE_SITE_URL. Keep the trailing slash.
  const env = loadEnv(mode, '.', 'VITE_');
  const SITE_URL = (env.VITE_SITE_URL ?? 'https://ansh339412.github.io/Real-estate-Website/').replace(/\/?$/, '/');
  return {
  base: './',
  test: { environment: 'jsdom' },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'inject-csp',
      transformIndexHtml(html) {
        const withUrls = html.replaceAll('__SITE_URL__', SITE_URL);
        if (command !== 'build') return withUrls;
        return withUrls.replace('<head>', `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`);
      },
      // The app uses hash routes (/#/listings), which search engines treat as one page, so the sitemap lists the site root.
      generateBundle() {
        const day = new Date().toISOString().slice(0, 10);
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE_URL}</loc><lastmod>${day}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>\n</urlset>\n` });
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n` });
      },
    },
  ],
};
});
