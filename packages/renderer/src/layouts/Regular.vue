<template>
  <div class="drawer drawer-mobile">
    <input
      id="drawer"
      type="checkbox"
      class="drawer-toggle"
    >
    <div class="drawer-content flex flex-col">
      <div class="navbar bg-base-100">
        <div class="flex-none">
          <label
            for="drawer"
            class="btn btn-primary drawer-button btn-ghost text-xl lg:hidden"
          >
            <icon-mdi-menu />
          </label>
        </div>
        <div class="flex-1">
          <RouterLink
            v-slot="{ isActive, href, navigate }"
            custom
            to="/"
            active-class="active"
          >
            <label
              v-if="isActive"
              class="px-4 font-semibold normal-case text-xl lg:hidden"
            >
              {{ title }}
            </label>
            <a
              v-else
              class="btn btn-ghost normal-case text-xl lg:hidden"
              :href="href"
              @click="navigate"
            >
              {{ title }}
            </a>
          </RouterLink>
        </div>
        <div class="order-last">
          <button
            class="btn btn-ghost text-lg"
            @click="profile.lang = nextLocale"
          >
            <icon-flagpack-de v-if="nextLocale === 'de'" />
            <icon-flagpack-us v-else-if="nextLocale === 'en'" />
            <template v-else>
              {{ nextLocale }}
            </template>
          </button>
          <label class="swap swap-rotate btn btn-ghost normal-case text-xl">
            <input
              v-model="profile.prefersDark"
              type="checkbox"
            >
            <icon-mdi-weather-sunny
              class="swap-on"
              @click="profile.prefersDark = false"
            />
            <icon-mdi-weather-night
              class="swap-off"
              @click="profile.prefersDark = true"
            />
          </label>
          <!--label
            class="btn btn-primary btn-ghost text-xl"
          >
            <icon-mdi-dots-horizontal />
          </label-->
        </div>
      </div>
      <main className="flex-1 overflow-y-auto pt-8 px-6 bg-base-200">
        <router-view v-slot="{ Component }">
          <!-- keep-alive :max="10" -->
          <component
            :is="Component"
          />
        <!-- /keep-alive -->
        </router-view>
      </main>
    </div>
    <div class="drawer-side">
      <label
        for="drawer"
        class="drawer-overlay"
      />
      <aside class="w-80 flex flex-col bg-base-100">
        <div class="p-$navbar-padding min-h-16 flex items-center mb-2">
          <RouterLink
            v-slot="{ isActive, href, navigate }"
            custom
            to="/"
            active-class="active"
          >
            <label
              v-if="isActive"
              class="px-4 font-semibold normal-case text-xl <lg:hidden"
            >
              {{ title }}
            </label>
            <a
              v-else
              class="btn btn-ghost normal-case text-xl <lg:hidden"
              :href="href"
              @click="navigate"
            >
              {{ title }}
            </a>
          </RouterLink>
          <label
            class="btn btn-primary btn-ghost text-xl ml-auto lg:hidden"
            for="drawer"
          >
            <icon-mdi-window-close />
          </label>
        </div>
        <ul class="menu menu-compact flex-1 flex flex-col px-4 gap-y-2">
          <li>
            <RouterLink
              to="/"
              active-class="active"
            >
              {{ $t('pages.home.title') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/about"
              active-class="active"
            >
              {{ $t('pages.about.title') }}
            </RouterLink>
          </li>
          <template v-if="isDevelopment">
            <li>
              <RouterLink
                to="/debug"
                active-class="active"
              >
                Debug
              </RouterLink>
            </li>
            <li>
              <a
                href="/__unocss"
                target="_blank"
              >
                UnoCSS <icon-mdi-open-in-new />
              </a>
            </li>
          </template>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { SUPPORTED_LOCALES } from '../i18n';
import { useProfileStore } from '../stores/profile';
import type { langs, MessageSchema } from '../typings/vue-i18n';

const route = useRoute(),
  i18n = useI18n<MessageSchema, langs>(),
  profile = useProfileStore(),
  title = computed(() => {
    const titleFunction = route.meta.title ?? import.meta.env.VITE_TITLE as string;
    return typeof titleFunction === 'function' ? titleFunction(route, i18n) : titleFunction;
  }),
  nextLocale = computed(() => {
    const current = SUPPORTED_LOCALES.indexOf(profile.lang);
    return SUPPORTED_LOCALES[(current + 1) % SUPPORTED_LOCALES.length];
  }),
  isDevelopment = import.meta.env.DEV;
</script>

<style lang="scss">
</style>
