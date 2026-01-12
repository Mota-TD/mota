/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_CLAUDE_API_KEY: string
  readonly VITE_CLAUDE_MODEL: string
  readonly VITE_CLAUDE_MAX_TOKENS: string
  readonly VITE_CLAUDE_TEMPERATURE: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}