/**
 * global type definitions
 */

import type { Composer, DefineDateTimeFormat, DefineLocaleMessage } from 'vue-i18n';
import en from '../locales/en.json';

  type langs = 'en' | 'de';
  type MessageSchema = typeof en;
  interface MyComposer extends Composer<
    Record<langs, DefineLocaleMessage>,
    Record<langs, DefineDateTimeFormat>, unknown, string, langs, langs
    > {
     loadingLocale?: string;
    }

export type { langs, MessageSchema, MyComposer as Composer };
