<template>
  <Teleport to="#app > main">
    <div class="toast toast-top toast-end gap-2 p-4">
      <TransitionGroup
        enter-active-class="animate-slide-in-down animate-duration-1000"
        leave-active-class="animate-fade-out animate-duration-500"
      >
        <div
          v-for="toast in store.toasts"
          :key="toast.id"
          class="alert flex flex-row items-center w-xs shadow top-3 animate-ease relative space-y-0"
          :class="`alert-${toast.type ?? 'info'}`"
          role="alert"
        >
          <button
            class="pointer-events-auto btn btn-sm btn-circle btn-ghost text-lg absolute right-2 top-4"
            @click="store.remove(toast)"
          >
            <icon-mdi-close />
          </button>
          <div
            v-if="toast.type"
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
          >
            <icon-mdi-information-outline v-if="toast.type === 'info'" />
            <icon-mdi-check v-if="toast.type === 'success'" />
            <icon-mdi-alert-circle-outline v-if="toast.type === 'warning'" />
            <icon-mdi-alert-box-outline v-if="toast.type === 'error'" />
          </div>
          <div class="text-sm font-normal flex-1">
            {{ toast.message }}
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastsStore } from '../stores/toasts';

const store = useToastsStore();
</script>

<style lang="scss"></style>
