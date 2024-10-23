interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_API_URL_GAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
