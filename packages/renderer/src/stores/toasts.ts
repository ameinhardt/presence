import { defineStore } from 'pinia';

let counter = 0;

export interface ToastConfig {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface Toast extends Omit<ToastConfig, 'duration'> {
  id: number;
  timeoutHandle?: number;
}

export const useToastsStore = defineStore('toasts', {
  state: () => ({ toasts: [] as Array<Toast> }),
  actions: {
    remove(burned: Toast) {
      if (burned.timeoutHandle != null) {
        clearTimeout(burned.timeoutHandle);
      }
      const index = this.toasts.indexOf(burned);
      if (index >= 0) {
        this.toasts.splice(index, 1);
      }
    },
    add(toastCfg: Omit<ToastConfig, 'id'> | string) {
      // eslint-disable-next-line unicorn/no-useless-undefined
      const { message, type = undefined, duration = undefined } = typeof toastCfg === 'string' ? { message: toastCfg } : toastCfg,
        toast : Toast = {
          id: counter++,
          message,
          type
        };
      if (duration == null || duration > 0) {
        toast.timeoutHandle = window.setTimeout(() => this.remove(toast), duration ?? 3000);
      }
      this.toasts.push(toast);
      return toast;
    }
  }
});
