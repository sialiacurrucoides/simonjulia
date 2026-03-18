// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

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
});
