<template>
  <div
    v-if="show"
    class="card bg-base-100 shadow-xl"
  >
    <div
      v-if="$slots.tools || closable"
      class="absolute right-4 top-4"
    >
      <slot name="tools" />
      <button
        v-if="closable"
        class="btn btn-ghost btn-circle btn-sm"
        @click="$emit('update:show', false)"
      >
        <icon-mdi-close />
      </button>
    </div>
    <div class="card-body">
      <h2
        v-if="title"
        class="card-title"
      >
        {{ title }}
      </h2>
      <slot />
      <div
        v-if="$slots.actions"
        class="card-actions justify-end"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  title?: string;
  closable?: boolean;
  show?: boolean;
}>(), {
  title: undefined,
  closable: false,
  show: true
});
// eslint-disable-next-line func-call-spacing
defineEmits<{
  (event: 'update:show', show: boolean): void
}>();
</script>
