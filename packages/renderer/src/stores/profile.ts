import { StorageSerializers, useLocalStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';
import { refresh } from '../auth';
import { SUPPORTED_LOCALES } from '../i18n';
import type { langs } from '../typings/vue-i18n';

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
    accessToken = ref<string>();
  let expiresOn: number | undefined;

  async function logout() {
    // refreshToken.value = undefined;
    accessToken.value = undefined;
    expiresOn = undefined;
  }

  async function login() {
    if ((!expiresOn || (expiresOn * 1000) > Date.now() + 60_000) && accessToken?.value) {
      return accessToken.value;
    } else if (refreshToken?.value) {
      try {
        const result = await refresh(refreshToken.value, 'offline_access openid profile User.Read');
        refreshToken.value = result.refreshToken;
        accessToken.value = result.accessToken;
        expiresOn = result.expiresOn;
        return accessToken.value;
      } catch (error) {
        console.error('login failed', error);
        await logout();
        throw error;
      }
    }
    throw new Error('no refreshToken available');
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
