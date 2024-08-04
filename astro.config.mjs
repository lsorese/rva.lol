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
            bypassToken: "hailsatanlordofdarkness66666666666666666",
            // Uncache everything every 4 minutes
            maxAge: 240
        }
    })
})
