import locales from 'virtual:locales';
import { nextTick } from 'vue';
import type { DefineDateTimeFormat } from 'vue-i18n';
import type { langs, Composer } from './typings/vue-i18n';

const SUPPORTED_LOCALES = Object.keys(locales) as Array<langs>,
  dateTimeFormat : DefineDateTimeFormat = {
    dateTime: {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    },
    shortTime: {
      hour: 'numeric',
      minute: '2-digit'
    },
    shortDate: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    },
    longDate: {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  },
  numberFormat = {
    short: {
      maximumFractionDigits: 2
    }
  };

async function loadLocaleMessages(composer: Composer, locale: langs): Promise<void> {
  // load locale messages with dynamic import
  const messages = await locales[locale]();
  console.debug(`setting sourceLocale ${locale}`);
  // set locale and locale message
  composer.mergeLocaleMessage(locale, messages);

  return nextTick();
}

async function setLocale(composer: Composer, locale = composer.locale.value) {
  locale = typeof locales[locale as langs] === 'function' ? locale : 'en';
  composer.loadingLocale = locale;
  // load locale messages
  await Promise.all([
    loadLocaleMessages(composer, locale)
  ]);
  if (composer.loadingLocale !== locale) {
    return composer;
  }
  composer.loadingLocale = undefined;
  composer.setDateTimeFormat(locale, dateTimeFormat);
  composer.setNumberFormat(locale, numberFormat);
  composer.locale.value = locale;
  document.querySelector('html')?.setAttribute('lang', locale);

  return composer;
}

export { setLocale, SUPPORTED_LOCALES };
