import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [mdx(), react(), sitemap()],
  adapter: vercel({
    isr: {
      // A secret random string that you create.
      bypassToken: "hailsatanlordofdarkness66666666666666666",
      // Uncache everything every 4 minutes
      maxAge: 240,
      exclude: ["/", "/shows"]
    }
  })
});