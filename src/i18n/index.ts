import en from "./en";
import hu from "./hu";
import type { Translation } from "./types";

export const languages: Record<string, Translation> = {
  en,
  hu
};

export function getLang(lang: string) {
  return languages[lang] ?? languages.en;
}