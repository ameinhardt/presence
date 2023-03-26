<template>
  <Teleport to="#app > main">
    <Transition
      enter-active-class="animate-slide-in-down animate-duration-500 animate-iteration-1"
      leave-active-class="animate-fade-out animate-duration-500 animate-iteration-1"
    >
      <div
        v-if="needRefresh"
        class="z-10 absolute top-0 min-h-16 alert alert-white border-b-1 border-primary rounded-none"
      >
        <div>
          <icon-mdi-reload-alert class="flex-shrink-0 w-6 h-6 text-primary" />
          <span>{{ $t('components.updatePrompt.updateAvailable') }}</span>
        </div>
        <div class="flex-none gap-x-4">
          <button
            class="btn btn-sm btn-ghost"
            @click="close"
          >
            {{ $t('cancel') }}
          </button>
          <button
            class="btn btn-sm btn-success"
            @click="updateServiceWorker()"
          >
            {{ $t('components.updatePrompt.update') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">

import { useRegisterSW } from 'virtual:pwa-register/vue';

const close = async () => {
    /* eslint-disable no-use-before-define */
    offlineReady.value = false;
    needRefresh.value = false;
    /* eslint-enable no-use-before-define */
  },
  { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, sw) {
      if (sw) {
        setInterval(async () => {
          if (sw.installing || !navigator || (('connection' in navigator) && !navigator.onLine)) {
            return;
          }
          const response = await fetch(swUrl, {
            cache: 'no-store',
            headers: {
              cache: 'no-store',
              'cache-control': 'no-cache'
            }
          });

          if (response?.status === 200) {
            await sw.update();
          }
        }, import.meta.env.DEV ? 5 * 1000 : 30 * 60_000);
      }
    }
  });
</script>

<style>
</style>
