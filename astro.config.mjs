// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  fonts: [
      {
          provider: fontProviders.fontsource(),
          name: "Montserrat",
          cssVariable: "--font-normal",
          weights: [400, 700],
      },
      {
          provider: fontProviders.fontsource(),
          name: "OpenDyslexic",
          cssVariable: "--font-dyslexic",
          weights:[400, 700]
      }
],
site: 'https://simonjulia.hu/',
integrations: [sitemap()],
security: {
    csp: {
      // Astro auto-adds hashes for its own inline scripts/styles.
      // Add directives it doesn't manage:
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
});