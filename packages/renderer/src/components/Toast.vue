<template>
  <Teleport to="#app > main">
    <div class="toast toast-top toast-end">
      <TransitionGroup
        enter-active-class="animate-slide-in-down animate-duration-500"
        leave-active-class="animate-fade-out animate-duration-500"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="alert flex items-center w-xs shadow top-3"
          :class="`alert-${toast.type ?? 'info'}`"
          role="alert"
        >
          <div
            v-if="toast.type"
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
          >
            <icon-mdi-information-outline v-if="toast.type === 'info'" />
            <icon-mdi-check v-if="toast.type === 'success'" />
            <icon-mdi-alert-circle-outline v-if="toast.type === 'warning'" />
            <icon-mdi-alert-box-outline v-if="toast.type === 'error'" />
          </div>
          <div class="ml-3 text-sm font-normal">
            {{ toast.message }}
          </div>
          <button
            class="ml-auto inline-flex pointer-events-auto btn btn-sm btn-circle btn-ghost text-lg"
            @click="remove(toast)"
          >
            <icon-mdi-close />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export interface ToastConfig {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface Toast extends Omit<ToastConfig, 'duration'> {
  id: number;
  timeoutHandle?: number;
}

const toasts = ref<Array<Toast>>([]);
let counter = 0;

function remove(burned: Toast) {
  if (burned.timeoutHandle != null) {
    clearTimeout(burned.timeoutHandle);
  }
  const index = toasts.value.indexOf(burned);
  if (index >= 0) {
    toasts.value.splice(index, 1);
  }
}

function add({ message, type, duration }: Omit<ToastConfig, 'id'>) {
  const toast : Toast = {
    id: counter++,
    message,
    type
  };
  if (duration == null || duration > 0) {
    toast.timeoutHandle = window.setTimeout(() => remove(toast), duration ?? 3000);
  }
  toasts.value.push(toast);
  return toast;
}

defineExpose({ add, remove });
</script>

<style lang="scss"></style>
