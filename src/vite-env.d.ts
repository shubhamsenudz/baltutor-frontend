/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Empty in dev (use Vite /api proxy). Set in production for cross-origin API host. */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
