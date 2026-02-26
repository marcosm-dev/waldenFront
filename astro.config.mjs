// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import node from "@astrojs/node";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://walden-adventures.com",

  // Modo server con prerender por defecto para páginas estáticas
  // Los endpoints API se renderizan en servidor
  output: "server",
  adapter: cloudflare(),

  integrations: [mdx(), sitemap(), react()],

  vite: {
    plugins: [tailwindcss()],
  },
});
