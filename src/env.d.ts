// Променливи от .env (вж. .env.example). PUBLIC_ се вграждат в страницата при build.
interface ImportMetaEnv {
  readonly PUBLIC_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
