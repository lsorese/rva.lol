import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    output: "server",
    adapter: vercel({
        isr: {
            // A secret random string that you create.
            bypassToken: import.meta.env.ISR,
            // Cache all pages for 2 minutes
            maxAge: 480
        }
    })
})
