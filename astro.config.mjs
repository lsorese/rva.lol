import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    adapter: vercel({
      isr: true,
    })
});
