import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://rva.lol',
    output: "server",
    integrations: [mdx(), react(), sitemap()],
    adapter: vercel({
      isr: {
        // A secret random string that you create.
        bypassToken: "hailsatanlordofdarkness66666666666666666",
        // Uncache everything else every 4 minutes
        expiration: 240,
        allowQuery: ['*'], // Allow all query parameters
      },
      headers: [
        {
          source: "/", // Apply to homepage
          headers: [
            {
              key: "Cache-Control",
              value: "s-maxage=240, stale-while-revalidate"
            }
          ]
        },
        {
          source: "/shows", // Apply to /shows page
          headers: [
            {
              key: "Cache-Control",
              value: "s-maxage=240, stale-while-revalidate"
            }
          ]
        }
      ]
    })
  });