<template>
  <Teleport to="#app > main">
    <div
      class="modal"
      :class="[{ 'modal-open': show, 'lt-sm:translate-y-full': !show }, $attrs.class]"
      @click.prevent="$emit('update:show', false)"
    >
      <div
        class="modal-box lt-sm:(max-h-full max-w-full w-full h-full)"
        @click.stop
      >
        <div
          v-if="$slots.tools || closable"
          class="absolute right-2 top-2"
        >
          <slot name="tools" />
          <label
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="$emit('update:show', false)"
          >
            <icon-mdi-close />
          </label>
        </div>
        <h3 class="font-bold text-lg">
          {{ title }}
        </h3>
        <slot />
        <div
          v-if="$slots.actions"
          class="modal-action justify-end"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  title?: string;
  closable: boolean;
  show?: boolean;
}>(), {
  title: undefined,
  closable: false,
  show: false
});

// eslint-disable-next-line func-call-spacing
defineEmits<{
  (event: 'update:show', show: boolean): void
}>();
</script>
