/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly WORDPRESS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
