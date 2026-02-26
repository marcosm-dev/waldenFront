/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/cloudflare" />

// Variables de entorno de Cloudflare Workers (vars + secrets en wrangler.jsonc)
// Accesibles en runtime via: locals.runtime.env.VARIABLE
interface CloudflareEnv {
  STRAPI_URL: string;
  STRAPI_ACCESS_TOKEN: string;
  BASIC_AUTH_ENABLED: string;
  BASIC_AUTH_USER: string;
  BASIC_AUTH_PASS: string;
  GITHUB_REPO: string;
  // Secrets (wrangler secret put):
  REVALIDATE_SECRET: string;
  GITHUB_TOKEN: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<CloudflareEnv>;

declare namespace App {
  interface Locals extends Runtime {}
}
