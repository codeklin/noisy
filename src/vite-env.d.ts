/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAYSTACK_PUBLIC_KEY_TEST: string;
  readonly VITE_PAYSTACK_PUBLIC_KEY_LIVE: string;
  readonly VITE_PAYSTACK_MODE: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
