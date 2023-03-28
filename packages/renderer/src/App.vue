<template>
  <main
    class="flex w-full h-full justify-center items-center bg-slate-100 dark:bg-slate-900"
  >
    <RouterView
      v-if="isReady"
      v-slot="{ Component }"
    >
      <template v-if="Component">
        <Transition
          mode="out-in"
          enter-active-class="animate-fade-in animate-duration-100"
          leave-active-class="animate-fade-out animate-duration-100"
        >
          <component :is="Component" />
        </Transition>
      </template>
    </RouterView>
  </main>
  <Toast/>
  <UpdatePrompt />
</template>

<script setup lang="ts">
import { useTitle } from '@vueuse/core';
import { nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Toast from './components/Toast.vue';
import { setLocale } from './i18n';
import { useProfileStore } from './stores/profile';
import type { langs, MessageSchema } from './typings/vue-i18n';

const SELECTOR = '#app',
  router = useRouter(),
  profile = useProfileStore(),
  i18n = useI18n<MessageSchema, langs>({ useScope: 'global' }),
  isReady = ref(false);

async function init() {
  await router.isReady();
  await setLocale(i18n, profile.lang);
  isReady.value = true;
}

init();

/* setup title */
useTitle(() => {
  const title = import.meta.env.VITE_TITLE as string,
    route = router.currentRoute.value,
    subtitle = route.meta?.title;
  if (isReady.value && subtitle) {
    return `${title} | ${typeof subtitle === 'function' ? subtitle(route, i18n) : subtitle}`;
  }
  return title;
});

function saveScrollbar(element?: Element | null) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return;
  }
  const htmlElement = element as HTMLElement,
    style = window.getComputedStyle(element);
  if (style.overflowY === 'scroll' || (style.overflowY === 'auto' && element.scrollHeight > element.clientHeight)) {
    htmlElement.dataset.scrollX = String(element.scrollLeft);
    htmlElement.dataset.scrollY = String(element.scrollTop);
  }
}

function themeTransition() {
  const themeElement = document.querySelector(SELECTOR) as HTMLElement;
  if (!themeElement) {
    return;
  }
  for (const child of themeElement.querySelectorAll<HTMLElement>('*')) {
    saveScrollbar(child);
  }
  const clone = themeElement.cloneNode(true) as HTMLElement,
    rect = themeElement.getBoundingClientRect();
  clone.classList.add('clone');
  clone.style.top = `${rect.top}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  // https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement: on macOS systems, elements that aren't text input elements are not typically focusable by default.
  const triggerElement = document.activeElement as HTMLElement, // === body on safari
    triggerRect = triggerElement.getBoundingClientRect(),
    left = triggerRect.left + triggerRect.width / 2 + window.scrollX,
    top = triggerRect.top + triggerRect.height / 2 + window.scrollY;
  themeElement.style.setProperty('--clip-pos', `${left}px ${top}px`);
  themeElement.style.removeProperty('--clip-size');

  nextTick(() => {
    themeElement.classList.add('app-transition');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        themeElement.style.setProperty('--clip-size', `${Math.hypot(window.innerWidth, window.innerHeight)  }px`);
      });
    });
  });
  document.body.append(clone);
  for (const element_ of (clone.querySelectorAll<HTMLElement>('[data-scroll-x], [data-scroll-y]'))) {
    element_.scrollLeft = +element_.dataset.scrollX!;
    element_.scrollTop = +element_.dataset.scrollY!;
  }
  function onTransitionend(event_: TransitionEvent) {
    if (event_.target === event_.currentTarget) {
      clone.remove();
      themeElement.removeEventListener('transitionend', onTransitionend);
      themeElement.removeEventListener('transitioncancel', onTransitionend);
      themeElement.classList.remove('app-transition');
      themeElement.style.removeProperty('--clip-size');
      themeElement.style.removeProperty('--clip-pos');
    }
  }
  themeElement.addEventListener('transitionend', onTransitionend);
  themeElement.addEventListener('transitioncancel', onTransitionend);
}

watch(
  () => profile.prefersDark,
  (preference) => {
    // --background does not seem to be set, yet
    const backgroundColor = preference ? '#000' : '#fff'; // black : white
    themeTransition();
    document.querySelector('#app')?.classList[preference ? 'add' : 'remove']('dark');
    document?.head
      ?.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', backgroundColor);
  }
);
watch(
  () => profile.lang,
  (lang) => setLocale(i18n, lang)
);
</script>

<style lang="scss">
@media screen {
.clone {
  position: fixed;
  z-index: -1;
  pointer-events: none;
  contain: size style;
  overflow: clip;
}
.app-transition {
  --clip-size: 0;
  --clip-pos: 0 0;
  clip-path: circle(var(--clip-size) at var(--clip-pos));
  transition: clip-path .5s ease-out;
}
}
</style>
