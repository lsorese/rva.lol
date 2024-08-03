import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';

export default defineConfig({
    output: "server",
    integrations: [mdx(), react()],
    adapter: vercel({
        isr: {
            // A secret random string that you create.
            bypassToken: import.meta.env.ISR,
            // Cache all pages for 2 minutes
            maxAge: 480
        }
    })
})
