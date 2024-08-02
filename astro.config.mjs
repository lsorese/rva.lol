import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    output: "server",
    adapter: vercel({
        isr: {
            // A secret random string that you create.
            bypassToken: import.meta.env.ISR,
            // Paths that will always be served fresh.
            exclude: [ "/index.astro", "showcases.astro", "/showcases"]
        }
    })
})