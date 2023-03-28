import { StorageSerializers, useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { refresh } from '../auth';
import { SUPPORTED_LOCALES } from '../i18n';
import type { langs, MessageSchema } from '../typings/vue-i18n';
import { useToastsStore } from './toasts';

export interface ProfileConfig {
  refreshToken?: string;
  prefersDark: boolean;
  popupHelp: boolean;
  popupSettings: boolean;
  lang: langs;
}

const config = useLocalStorage<ProfileConfig>('config', {
  popupHelp: false,
  popupSettings: false,
  prefersDark: false,
  lang: navigator.languages.map((lang) => lang.split('-')[0] as langs).find((lang) => ~SUPPORTED_LOCALES.indexOf(lang)) ?? 'en'
}, { serializer: StorageSerializers.object });

function computedForConfig<T = ProfileConfig[keyof ProfileConfig]>(key: keyof ProfileConfig) {
  return computed<T>({
    get: () => config.value[key] as T,
    set: (v) => (config.value[key] !== v) && ((config.value[key] as T) = v)
  });
}

export const useProfileStore = defineStore('profile', () => {
  const prefersDark = computedForConfig<ProfileConfig['prefersDark']>('prefersDark'),
    popupHelp = computedForConfig<ProfileConfig['popupHelp']>('popupHelp'),
    popupSettings = computedForConfig<ProfileConfig['popupSettings']>('popupSettings'),
    refreshToken = computedForConfig<ProfileConfig['refreshToken']>('refreshToken'),
    lang = computedForConfig<ProfileConfig['lang']>('lang'),
    accessToken = ref<string>(),
    toastsStore = useToastsStore(),
    i18n = useI18n<MessageSchema, langs>();
  let expiresOn: number | undefined;

  async function logout() {
    // refreshToken.value = undefined;
    accessToken.value = undefined;
    expiresOn = undefined;
  }

  async function login() {
    if ((!expiresOn || (expiresOn * 1000) > Date.now() + 60_000) && accessToken?.value) {
      return accessToken.value;
    } else if (!refreshToken?.value) {
      toastsStore.add({
        message: i18n.t('stores.profile.noRefreshToken'),
        type: 'error'
      });
      throw new Error('no refreshToken available');
    }
    try {
      const result = await refresh(refreshToken.value, 'offline_access openid profile User.Read');
      refreshToken.value = result.refreshToken;
      accessToken.value = result.accessToken;
      expiresOn = result.expiresOn;
      /* toastsStore.add({
        message: 'logged in!',
        type: 'success'
      });*/
      return accessToken.value;
    } catch (error) {
      console.error('login failed', error, error instanceof Error ? error.cause : 'unknown cause');
      toastsStore.add({
        message: i18n.t('stores.profile.loginError'),
        type: 'error'
      });
      await logout();
      throw new Error('login failed', { cause: error });
    }
  }

  function toggleDark() {
    prefersDark.value = !prefersDark.value;
  }

  /* refreshToken is updated on a refresh -> endless cycle
    watch(refreshToken, (newToken, oldToken) => {
    if (newToken) {
      if (newToken !== oldToken) {
        login();
      }
    } else {
      logout();
    }
  }); */

  return { lang, prefersDark, popupHelp, popupSettings, refreshToken, accessToken: readonly(accessToken), toggleDark, login, logout };
}, {});
