/// <reference types="vite/client" />
// eslint-disable-next-line unicorn/prevent-abbreviations
interface ImportMetaEnv {
  readonly VITE_TITLE: string;
  readonly VITE_NAME: string;
  readonly VITE_AUTHOR: string;
  readonly VITE_DESCRIPTION: string;
  readonly VITE_VERSION: string;
  readonly VITE_AUTH_CLIENT_ID: string;
  readonly VITE_AUTH_REDIRECT: string;
  readonly VITE_AUTH_CONFIG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
