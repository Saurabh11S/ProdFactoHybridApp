/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
<<<<<<< HEAD
  readonly VITE_WHATSAPP_NUMBER?: string;
=======
>>>>>>> 5f5c8b06feb0902b4f528e0151338f5ac63be3c9
  readonly PROD?: boolean;
  readonly DEV?: boolean;
  readonly MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}










